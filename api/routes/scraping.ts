import { Router } from 'express';
import { SocialMediaScrapingService } from '../services/social-media-scraping-service';
import { ScrapingComplianceService } from '../services/scraping-compliance-service';
import { ContactTaggingService } from '../services/contact-tagging-service';
import { ContactExportService } from '../services/contact-export-service';
import { db } from '../db';
import { scrapedContacts, scrapingCampaigns, scrapingLogs, contactTags } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateApiKey } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const scrapingService = new SocialMediaScrapingService();
const complianceService = new ScrapingComplianceService();
const taggingService = new ContactTaggingService();
const exportService = new ContactExportService();

/**
 * Scrape contacts from social media platforms
 * POST /api/scraping/scrape
 */
router.post('/scrape', authenticateApiKey, async (req, res) => {
  try {
    const { platform, scrapingType, queries, options = {} } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!platform || !scrapingType || !queries || !Array.isArray(queries)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: platform, scrapingType, queries'
      });
    }

    // Check compliance
    const compliance = await complianceService.isScrapingCompliant(
      userId, platform, scrapingType, queries
    );

    if (!compliance.compliant) {
      return res.status(403).json({
        success: false,
        error: `Scraping not compliant: ${compliance.reason}`
      });
    }

    // Start scraping
    logger.info(`Starting scraping for user ${userId}: ${platform} - ${scrapingType}`);
    
    const result = await scrapingService.scrapeContacts(
      userId,
      platform,
      scrapingType,
      queries,
      options
    );

    res.json({
      success: true,
      data: {
        contactsFound: result.totalFound,
        contactsSaved: result.totalSaved,
        executionTime: result.executionTime,
        errors: result.errors
      }
    });

  } catch (error) {
    logger.error(`Scraping error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Scraping failed',
      message: error.message
    });
  }
});

/**
 * Get scraped contacts with filtering and pagination
 * GET /api/scraping/contacts
 */
router.get('/contacts', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      platform, 
      tags, 
      search, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build query conditions
    let conditions = eq(scrapedContacts.userId, userId);
    
    if (platform) {
      conditions = and(conditions, eq(scrapedContacts.platform, platform));
    }

    if (tags && Array.isArray(tags)) {
      // Filter by tags (this would need a more complex query with joins)
      // For now, we'll filter by the tags array in the contacts table
      conditions = and(conditions, sql`${scrapedContacts.tags} && ${tags}`);
    }

    if (search) {
      // Search in username, display name, and bio
      conditions = and(conditions, sql`(
        ${scrapedContacts.username} ILIKE ${`%${search}%`} OR
        ${scrapedContacts.displayName} ILIKE ${`%${search}%`} OR
        ${scrapedContacts.bio} ILIKE ${`%${search}%`}
      )`);
    }

    // Get total count
    const totalCount = await db.select({ count: sql`COUNT(*)` })
      .from(scrapedContacts)
      .where(conditions);

    // Get contacts
    let query = db.select()
      .from(scrapedContacts)
      .where(conditions)
      .limit(Number(limit))
      .offset(offset);

    // Add sorting
    if (sortBy === 'followerCount') {
      query = query.orderBy(sortOrder === 'desc' ? 
        sql`${scrapedContacts.followerCount} DESC` : 
        sql`${scrapedContacts.followerCount} ASC`
      );
    } else if (sortBy === 'engagementRate') {
      query = query.orderBy(sortOrder === 'desc' ? 
        sql`${scrapedContacts.engagementRate} DESC` : 
        sql`${scrapedContacts.engagementRate} ASC`
      );
    } else {
      query = query.orderBy(sortOrder === 'desc' ? 
        sql`${scrapedContacts.createdAt} DESC` : 
        sql`${scrapedContacts.createdAt} ASC`
      );
    }

    const contacts = await query;

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalCount[0].count),
          pages: Math.ceil(Number(totalCount[0].count) / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error(`Get contacts error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get contacts',
      message: error.message
    });
  }
});

/**
 * Get scraping campaigns
 * GET /api/scraping/campaigns
 */
router.get('/campaigns', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let conditions = eq(scrapingCampaigns.userId, userId);
    
    if (status) {
      conditions = and(conditions, eq(scrapingCampaigns.status, status));
    }

    const campaigns = await db.select()
      .from(scrapingCampaigns)
      .where(conditions)
      .orderBy(sql`${scrapingCampaigns.createdAt} DESC`)
      .limit(Number(limit))
      .offset(offset);

    const totalCount = await db.select({ count: sql`COUNT(*)` })
      .from(scrapingCampaigns)
      .where(conditions);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalCount[0].count),
          pages: Math.ceil(Number(totalCount[0].count) / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error(`Get campaigns error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaigns',
      message: error.message
    });
  }
});

/**
 * Create scraping campaign
 * POST /api/scraping/campaigns
 */
router.post('/campaigns', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, platforms, scrapingType, targetQueries, filters, schedule } = req.body;

    // Validate input
    if (!name || !platforms || !scrapingType || !targetQueries) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const campaign = await db.insert(scrapingCampaigns).values({
      userId,
      name,
      description,
      platforms,
      scrapingType,
      targetQueries,
      filters,
      schedule,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    res.json({
      success: true,
      data: campaign[0]
    });

  } catch (error) {
    logger.error(`Create campaign error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

/**
 * Run scraping campaign
 * POST /api/scraping/campaigns/:id/run
 */
router.post('/campaigns/:id/run', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;

    // Get campaign
    const campaigns = await db.select()
      .from(scrapingCampaigns)
      .where(and(
        eq(scrapingCampaigns.id, campaignId),
        eq(scrapingCampaigns.userId, userId)
      ))
      .limit(1);

    if (campaigns.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    const campaign = campaigns[0];

    // Update campaign status
    await db.update(scrapingCampaigns)
      .set({ 
        status: 'active',
        lastRunAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(scrapingCampaigns.id, campaignId));

    // Run scraping for each platform
    let totalContactsFound = 0;
    const errors = [];

    for (const platform of campaign.platforms) {
      try {
        const result = await scrapingService.scrapeContacts(
          userId,
          platform,
          campaign.scrapingType,
          campaign.targetQueries,
          campaign.filters || {}
        );

        totalContactsFound += result.totalSaved;
        
        // Update campaign progress
        await db.update(scrapingCampaigns)
          .set({ 
            contactsFound: totalContactsFound,
            updatedAt: new Date()
          })
          .where(eq(scrapingCampaigns.id, campaignId));

      } catch (error) {
        errors.push(`${platform}: ${error.message}`);
        logger.error(`Campaign scraping error for ${platform}: ${error.message}`);
      }
    }

    // Update campaign status
    await db.update(scrapingCampaigns)
      .set({ 
        status: errors.length > 0 ? 'partial_success' : 'completed',
        contactsFound: totalContactsFound,
        updatedAt: new Date()
      })
      .where(eq(scrapingCampaigns.id, campaignId));

    res.json({
      success: true,
      data: {
        campaignId,
        contactsFound: totalContactsFound,
        errors
      }
    });

  } catch (error) {
    logger.error(`Run campaign error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to run campaign',
      message: error.message
    });
  }
});

/**
 * Get scraping logs
 * GET /api/scraping/logs
 */
router.get('/logs', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, status, page = 1, limit = 50 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let conditions = eq(scrapingLogs.userId, userId);
    
    if (platform) {
      conditions = and(conditions, eq(scrapingLogs.platform, platform));
    }
    
    if (status) {
      conditions = and(conditions, eq(scrapingLogs.status, status));
    }

    const logs = await db.select()
      .from(scrapingLogs)
      .where(conditions)
      .orderBy(sql`${scrapingLogs.createdAt} DESC`)
      .limit(Number(limit))
      .offset(offset);

    const totalCount = await db.select({ count: sql`COUNT(*)` })
      .from(scrapingLogs)
      .where(conditions);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(totalCount[0].count),
          pages: Math.ceil(Number(totalCount[0].count) / Number(limit))
        }
      }
    });

  } catch (error) {
    logger.error(`Get logs error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get logs',
      message: error.message
    });
  }
});

/**
 * Get contact tags
 * GET /api/scraping/tags
 */
router.get('/tags', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await taggingService.getUserTags(userId);

    res.json({
      success: true,
      data: { tags }
    });

  } catch (error) {
    logger.error(`Get tags error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get tags',
      message: error.message
    });
  }
});

/**
 * Bulk tag contacts
 * POST /api/scraping/contacts/tag
 */
router.post('/contacts/tag', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactIds, tag } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || !tag) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: contactIds, tag'
      });
    }

    await taggingService.bulkTagContacts(contactIds, tag);

    res.json({
      success: true,
      message: `Tagged ${contactIds.length} contacts with "${tag.name}"`
    });

  } catch (error) {
    logger.error(`Bulk tag error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to tag contacts',
      message: error.message
    });
  }
});

/**
 * Get scraping statistics
 * GET /api/scraping/stats
 */
router.get('/stats', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get contact statistics
    const contactStats = await db.select({
      platform: scrapedContacts.platform,
      count: sql`COUNT(*)`,
      avgFollowers: sql`AVG(${scrapedContacts.followerCount})`,
      avgEngagement: sql`AVG(${scrapedContacts.engagementRate})`
    })
    .from(scrapedContacts)
    .where(eq(scrapedContacts.userId, userId))
    .groupBy(scrapedContacts.platform);

    // Get total contacts
    const totalContacts = await db.select({ count: sql`COUNT(*)` })
      .from(scrapedContacts)
      .where(eq(scrapedContacts.userId, userId));

    // Get recent scraping activity
    const recentActivity = await db.select({
      date: sql`DATE(${scrapingLogs.createdAt})`,
      count: sql`COUNT(*)`,
      contactsFound: sql`SUM(${scrapingLogs.contactsFound})`
    })
    .from(scrapingLogs)
    .where(and(
      eq(scrapingLogs.userId, userId),
      sql`${scrapingLogs.createdAt} >= NOW() - INTERVAL '7 days'`
    ))
    .groupBy(sql`DATE(${scrapingLogs.createdAt})`)
    .orderBy(sql`DATE(${scrapingLogs.createdAt}) DESC`);

    res.json({
      success: true,
      data: {
        totalContacts: Number(totalContacts[0].count),
        platformStats: contactStats,
        recentActivity
      }
    });

  } catch (error) {
    logger.error(`Get stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

/**
 * Export contacts in various formats
 * POST /api/scraping/export
 */
router.post('/export', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format, fields, filters, includeAnalytics, customHeaders } = req.body;

    if (!format) {
      return res.status(400).json({
        success: false,
        error: 'Export format is required'
      });
    }

    const exportOptions = {
      format,
      fields,
      filters,
      includeAnalytics: includeAnalytics || false,
      customHeaders
    };

    const result = await exportService.exportContacts(userId, exportOptions);

    // Set appropriate headers for file download
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('X-Record-Count', result.recordCount.toString());

    res.send(result.data);

  } catch (error) {
    logger.error(`Export contacts error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * Get export preview (first 10 records)
 * POST /api/scraping/export/preview
 */
router.post('/export/preview', authenticateApiKey, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format, fields, filters, includeAnalytics, customHeaders } = req.body;

    if (!format) {
      return res.status(400).json({
        success: false,
        error: 'Export format is required'
      });
    }

    // Create preview with limited records
    const previewFilters = {
      ...filters,
      // Add limit to get only first 10 records for preview
    };

    const exportOptions = {
      format,
      fields,
      filters: previewFilters,
      includeAnalytics: includeAnalytics || false,
      customHeaders
    };

    const result = await exportService.exportContacts(userId, exportOptions);

    // For preview, we'll modify the data to show only first 10 records
    let previewData;
    if (format === 'json') {
      const fullData = JSON.parse(result.data as string);
      fullData.contacts = fullData.contacts.slice(0, 10);
      fullData.totalRecords = result.recordCount;
      fullData.preview = true;
      previewData = JSON.stringify(fullData, null, 2);
    } else if (format === 'csv') {
      const lines = (result.data as string).split('\n');
      previewData = [lines[0], ...lines.slice(1, 11)].join('\n');
    } else {
      previewData = result.data; // For other formats, just return the full data
    }

    res.json({
      success: true,
      data: {
        format,
        data: previewData,
        recordCount: result.recordCount,
        previewCount: Math.min(10, result.recordCount),
        filename: result.filename.replace('.', '_preview.')
      }
    });

  } catch (error) {
    logger.error(`Export preview error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Preview generation failed',
      message: error.message
    });
  }
});

/**
 * Get available export fields
 * GET /api/scraping/export/fields
 */
router.get('/export/fields', authenticateApiKey, async (req, res) => {
  try {
    const fields = [
      { key: 'username', label: 'Username', type: 'text' },
      { key: 'displayName', label: 'Display Name', type: 'text' },
      { key: 'platform', label: 'Platform', type: 'text' },
      { key: 'profileUrl', label: 'Profile URL', type: 'url' },
      { key: 'avatarUrl', label: 'Avatar URL', type: 'url' },
      { key: 'bio', label: 'Bio', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'website', label: 'Website', type: 'url' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'followerCount', label: 'Followers', type: 'number' },
      { key: 'followingCount', label: 'Following', type: 'number' },
      { key: 'postCount', label: 'Posts', type: 'number' },
      { key: 'isVerified', label: 'Verified', type: 'boolean' },
      { key: 'isBusiness', label: 'Business Account', type: 'boolean' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'array' },
      { key: 'engagementRate', label: 'Engagement Rate', type: 'percentage' },
      { key: 'scrapingSource', label: 'Scraping Source', type: 'text' },
      { key: 'scrapingQuery', label: 'Scraping Query', type: 'text' },
      { key: 'scrapedAt', label: 'Scraped Date', type: 'date' },
      { key: 'createdAt', label: 'Created Date', type: 'date' },
      { key: 'updatedAt', label: 'Updated Date', type: 'date' }
    ];

    res.json({
      success: true,
      data: { fields }
    });

  } catch (error) {
    logger.error(`Get export fields error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get export fields',
      message: error.message
    });
  }
});

export default router;