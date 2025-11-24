import { db } from "../../shared/db";
import { scrapedContacts, contactTags } from "../../shared/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import * as csv from "csv-stringify";
import * as ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'pdf';
  fields?: string[];
  filters?: {
    platforms?: string[];
    tags?: string[];
    minFollowers?: number;
    maxFollowers?: number;
    isVerified?: boolean;
    isBusiness?: boolean;
    location?: string;
    category?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  includeAnalytics?: boolean;
  customHeaders?: Record<string, string>;
}

export interface ExportResult {
  data: Buffer | string;
  filename: string;
  mimeType: string;
  recordCount: number;
}

export class ContactExportService {
  private defaultFields = [
    'username',
    'displayName',
    'platform',
    'profileUrl',
    'avatarUrl',
    'bio',
    'email',
    'phone',
    'location',
    'followerCount',
    'followingCount',
    'postCount',
    'isVerified',
    'isBusiness',
    'category',
    'tags',
    'engagementRate',
    'scrapingSource',
    'scrapingQuery',
    'scrapedAt'
  ];

  async exportContacts(
    userId: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const contacts = await this.getFilteredContacts(userId, options.filters);
    
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(contacts, options);
      case 'json':
        return this.exportToJSON(contacts, options);
      case 'excel':
        return this.exportToExcel(contacts, options);
      case 'pdf':
        return this.exportToPDF(contacts, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async getFilteredContacts(userId: string, filters?: ExportOptions['filters']) {
    let query = db
      .select({
        id: scrapedContacts.id,
        username: scrapedContacts.username,
        displayName: scrapedContacts.displayName,
        platform: scrapedContacts.platform,
        profileUrl: scrapedContacts.profileUrl,
        avatarUrl: scrapedContacts.avatarUrl,
        bio: scrapedContacts.bio,
        email: scrapedContacts.email,
        phone: scrapedContacts.phone,
        website: scrapedContacts.website,
        location: scrapedContacts.location,
        followerCount: scrapedContacts.followerCount,
        followingCount: scrapedContacts.followingCount,
        postCount: scrapedContacts.postCount,
        isVerified: scrapedContacts.isVerified,
        isBusiness: scrapedContacts.isBusiness,
        category: scrapedContacts.category,
        tags: scrapedContacts.tags,
        engagementRate: scrapedContacts.engagementRate,
        scrapingSource: scrapedContacts.scrapingSource,
        scrapingQuery: scrapedContacts.scrapingQuery,
        scrapedAt: scrapedContacts.scrapedAt,
        createdAt: scrapedContacts.createdAt,
        updatedAt: scrapedContacts.updatedAt
      })
      .from(scrapedContacts)
      .where(eq(scrapedContacts.userId, userId));

    if (filters) {
      if (filters.platforms?.length) {
        query = query.where(inArray(scrapedContacts.platform, filters.platforms));
      }
      
      if (filters.minFollowers !== undefined) {
        query = query.where(sql`${scrapedContacts.followerCount} >= ${filters.minFollowers}`);
      }
      
      if (filters.maxFollowers !== undefined) {
        query = query.where(sql`${scrapedContacts.followerCount} <= ${filters.maxFollowers}`);
      }
      
      if (filters.isVerified !== undefined) {
        query = query.where(eq(scrapedContacts.isVerified, filters.isVerified));
      }
      
      if (filters.isBusiness !== undefined) {
        query = query.where(eq(scrapedContacts.isBusiness, filters.isBusiness));
      }
      
      if (filters.location) {
        query = query.where(sql`${scrapedContacts.location} ILIKE ${`%${filters.location}%`}`);
      }
      
      if (filters.category) {
        query = query.where(sql`${scrapedContacts.category} ILIKE ${`%${filters.category}%`}`);
      }
      
      if (filters.tags?.length) {
        // Filter by tags using array overlap
        query = query.where(sql`${scrapedContacts.tags} && ${filters.tags}`);
      }
      
      if (filters.dateRange) {
        query = query.where(
          and(
            sql`${scrapedContacts.scrapedAt} >= ${filters.dateRange.start}`,
            sql`${scrapedContacts.scrapedAt} <= ${filters.dateRange.end}`
          )
        );
      }
    }

    return await query;
  }

  private async exportToCSV(contacts: any[], options: ExportOptions): Promise<ExportResult> {
    const fields = options.fields || this.defaultFields;
    const headers = options.customHeaders || this.getDefaultHeaders();
    
    const csvData = contacts.map(contact => {
      const row: any = {};
      fields.forEach(field => {
        const header = headers[field] || field;
        let value = contact[field];
        
        // Handle special formatting
        if (field === 'tags' && Array.isArray(value)) {
          value = value.join('; ');
        } else if (field === 'engagementRate' && value !== null) {
          value = `${(value * 100).toFixed(2)}%`;
        } else if (field === 'scrapedAt' || field === 'createdAt' || field === 'updatedAt') {
          value = value ? new Date(value).toISOString() : '';
        }
        
        row[header] = value || '';
      });
      return row;
    });

    const csvString = await new Promise<string>((resolve, reject) => {
      csv.stringify(csvData, { header: true }, (err, output) => {
        if (err) reject(err);
        else resolve(output);
      });
    });

    return {
      data: csvString,
      filename: `contacts_${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv',
      recordCount: contacts.length
    };
  }

  private async exportToJSON(contacts: any[], options: ExportOptions): Promise<ExportResult> {
    const fields = options.fields || this.defaultFields;
    
    const jsonData = contacts.map(contact => {
      const record: any = {};
      fields.forEach(field => {
        record[field] = contact[field];
      });
      
      if (options.includeAnalytics) {
        record.analytics = {
          followerGrowth: this.calculateFollowerGrowth(contact),
          engagementScore: this.calculateEngagementScore(contact),
          influenceScore: this.calculateInfluenceScore(contact)
        };
      }
      
      return record;
    });

    return {
      data: JSON.stringify({
        exportedAt: new Date().toISOString(),
        totalRecords: contacts.length,
        filters: options.filters,
        contacts: jsonData
      }, null, 2),
      filename: `contacts_${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json',
      recordCount: contacts.length
    };
  }

  private async exportToExcel(contacts: any[], options: ExportOptions): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Contacts');
    
    const fields = options.fields || this.defaultFields;
    const headers = options.customHeaders || this.getDefaultHeaders();
    
    // Add headers
    worksheet.columns = fields.map(field => ({
      header: headers[field] || field,
      key: field,
      width: this.getColumnWidth(field)
    }));

    // Add data
    contacts.forEach(contact => {
      const row: any = {};
      fields.forEach(field => {
        let value = contact[field];
        
        // Handle special formatting
        if (field === 'tags' && Array.isArray(value)) {
          value = value.join('; ');
        } else if (field === 'engagementRate' && value !== null) {
          value = value / 100; // Convert to percentage for Excel
          row[`${field}_formatted`] = `${(value * 100).toFixed(2)}%`;
        } else if (field === 'scrapedAt' || field === 'createdAt' || field === 'updatedAt') {
          value = value ? new Date(value) : null;
        }
        
        row[field] = value;
      });
      worksheet.addRow(row);
    });

    // Add formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add analytics sheet if requested
    if (options.includeAnalytics) {
      const analyticsSheet = workbook.addWorksheet('Analytics');
      this.addAnalyticsSheet(analyticsSheet, contacts);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    
    return {
      data: Buffer.from(buffer),
      filename: `contacts_${new Date().toISOString().split('T')[0]}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      recordCount: contacts.length
    };
  }

  private async exportToPDF(contacts: any[], options: ExportOptions): Promise<ExportResult> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Social Media Contacts Export', 14, 22);
    
    // Add export info
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`Total Records: ${contacts.length}`, 14, 38);
    
    if (options.filters) {
      const filtersText = Object.entries(options.filters)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join(' | ');
      if (filtersText) {
        doc.text(`Filters: ${filtersText}`, 14, 44);
      }
    }

    // Prepare table data
    const fields = options.fields || this.defaultFields.slice(0, 8); // Limit fields for PDF
    const headers = options.customHeaders || this.getDefaultHeaders();
    
    const headersArray = fields.map(field => headers[field] || field);
    const dataArray = contacts.slice(0, 100).map(contact => { // Limit to 100 records for PDF
      return fields.map(field => {
        let value = contact[field];
        if (field === 'tags' && Array.isArray(value)) {
          value = value.join(', ');
        } else if (field === 'engagementRate' && value !== null) {
          value = `${(value * 100).toFixed(1)}%`;
        }
        return value || '';
      });
    });

    autoTable(doc, {
      head: [headersArray],
      body: dataArray,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 167, 69] }
    });

    // Add summary if more than 100 records
    if (contacts.length > 100) {
      doc.text(`... and ${contacts.length - 100} more records`, 14, doc.lastAutoTable.finalY + 10);
    }

    // Add analytics if requested
    if (options.includeAnalytics) {
      this.addPDFAnalytics(doc, contacts);
    }

    return {
      data: doc.output('arraybuffer'),
      filename: `contacts_${new Date().toISOString().split('T')[0]}.pdf`,
      mimeType: 'application/pdf',
      recordCount: contacts.length
    };
  }

  private getDefaultHeaders(): Record<string, string> {
    return {
      username: 'Username',
      displayName: 'Display Name',
      platform: 'Platform',
      profileUrl: 'Profile URL',
      avatarUrl: 'Avatar URL',
      bio: 'Bio',
      email: 'Email',
      phone: 'Phone',
      website: 'Website',
      location: 'Location',
      followerCount: 'Followers',
      followingCount: 'Following',
      postCount: 'Posts',
      isVerified: 'Verified',
      isBusiness: 'Business',
      category: 'Category',
      tags: 'Tags',
      engagementRate: 'Engagement Rate',
      scrapingSource: 'Source',
      scrapingQuery: 'Query',
      scrapedAt: 'Scraped Date',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date'
    };
  }

  private getColumnWidth(field: string): number {
    const widths: Record<string, number> = {
      username: 15,
      displayName: 20,
      platform: 10,
      profileUrl: 30,
      bio: 40,
      email: 25,
      phone: 15,
      location: 20,
      category: 15,
      tags: 25,
      engagementRate: 12
    };
    return widths[field] || 15;
  }

  private calculateFollowerGrowth(contact: any): number {
    // Mock calculation - in real implementation, would use historical data
    return Math.random() * 20 - 10; // -10% to +10%
  }

  private calculateEngagementScore(contact: any): number {
    const baseScore = contact.engagementRate ? contact.engagementRate * 100 : 0;
    const followerBonus = Math.min(contact.followerCount / 10000, 10); // Cap at 10
    return Math.min(baseScore + followerBonus, 100);
  }

  private calculateInfluenceScore(contact: any): number {
    let score = 0;
    
    // Follower count (0-40 points)
    score += Math.min(contact.followerCount / 2500, 40);
    
    // Verification bonus (10 points)
    if (contact.isVerified) score += 10;
    
    // Business account bonus (5 points)
    if (contact.isBusiness) score += 5;
    
    // Engagement rate (0-30 points)
    if (contact.engagementRate) {
      score += Math.min(contact.engagementRate * 100 * 3, 30);
    }
    
    // Post frequency (0-15 points)
    if (contact.postCount && contact.postCount > 0) {
      score += Math.min(contact.postCount / 100, 15);
    }
    
    return Math.min(score, 100);
  }

  private addAnalyticsSheet(worksheet: ExcelJS.Worksheet, contacts: any[]) {
    // Platform distribution
    const platformStats = this.calculatePlatformStats(contacts);
    const verificationStats = this.calculateVerificationStats(contacts);
    const engagementStats = this.calculateEngagementStats(contacts);

    worksheet.addRow(['Platform Distribution']);
    worksheet.addRow(['Platform', 'Count', 'Percentage']);
    Object.entries(platformStats).forEach(([platform, count]) => {
      const percentage = ((count / contacts.length) * 100).toFixed(1);
      worksheet.addRow([platform, count, `${percentage}%`]);
    });

    worksheet.addRow([]);
    worksheet.addRow(['Verification Status']);
    worksheet.addRow(['Status', 'Count', 'Percentage']);
    worksheet.addRow(['Verified', verificationStats.verified, `${((verificationStats.verified / contacts.length) * 100).toFixed(1)}%`]);
    worksheet.addRow(['Not Verified', verificationStats.notVerified, `${((verificationStats.notVerified / contacts.length) * 100).toFixed(1)}%`]);

    worksheet.addRow([]);
    worksheet.addRow(['Engagement Statistics']);
    worksheet.addRow(['Metric', 'Value']);
    worksheet.addRow(['Average Engagement Rate', `${engagementStats.average.toFixed(2)}%`]);
    worksheet.addRow(['Median Engagement Rate', `${engagementStats.median.toFixed(2)}%`]);
    worksheet.addRow(['Highest Engagement Rate', `${engagementStats.max.toFixed(2)}%`]);
    worksheet.addRow(['Lowest Engagement Rate', `${engagementStats.min.toFixed(2)}%`]);
  }

  private addPDFAnalytics(doc: jsPDF, contacts: any[]) {
    const platformStats = this.calculatePlatformStats(contacts);
    const verificationStats = this.calculateVerificationStats(contacts);
    const engagementStats = this.calculateEngagementStats(contacts);

    doc.addPage();
    doc.setFontSize(16);
    doc.text('Analytics Summary', 14, 22);

    doc.setFontSize(12);
    let yPos = 35;
    
    doc.text('Platform Distribution:', 14, yPos);
    yPos += 8;
    Object.entries(platformStats).forEach(([platform, count]) => {
      const percentage = ((count / contacts.length) * 100).toFixed(1);
      doc.text(`${platform}: ${count} (${percentage}%)`, 20, yPos);
      yPos += 6;
    });

    yPos += 8;
    doc.text('Verification Status:', 14, yPos);
    yPos += 8;
    doc.text(`Verified: ${verificationStats.verified} (${((verificationStats.verified / contacts.length) * 100).toFixed(1)}%)`, 20, yPos);
    yPos += 6;
    doc.text(`Not Verified: ${verificationStats.notVerified} (${((verificationStats.notVerified / contacts.length) * 100).toFixed(1)}%)`, 20, yPos);

    yPos += 8;
    doc.text('Engagement Statistics:', 14, yPos);
    yPos += 8;
    doc.text(`Average: ${engagementStats.average.toFixed(2)}%`, 20, yPos);
    yPos += 6;
    doc.text(`Median: ${engagementStats.median.toFixed(2)}%`, 20, yPos);
    yPos += 6;
    doc.text(`Range: ${engagementStats.min.toFixed(2)}% - ${engagementStats.max.toFixed(2)}%`, 20, yPos);
  }

  private calculatePlatformStats(contacts: any[]): Record<string, number> {
    const stats: Record<string, number> = {};
    contacts.forEach(contact => {
      stats[contact.platform] = (stats[contact.platform] || 0) + 1;
    });
    return stats;
  }

  private calculateVerificationStats(contacts: any[]) {
    return {
      verified: contacts.filter(c => c.isVerified).length,
      notVerified: contacts.filter(c => !c.isVerified).length
    };
  }

  private calculateEngagementStats(contacts: any[]) {
    const rates = contacts
      .map(c => c.engagementRate)
      .filter(rate => rate !== null && rate !== undefined)
      .map(rate => rate * 100);
    
    if (rates.length === 0) {
      return { average: 0, median: 0, min: 0, max: 0 };
    }
    
    const sorted = rates.sort((a, b) => a - b);
    return {
      average: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }
}