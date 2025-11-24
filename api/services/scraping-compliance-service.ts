import { db } from '../db';
import { scrapingCompliance, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface ComplianceSettings {
  platform: string;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  respectRobotsTxt: boolean;
  avoidPrivateProfiles: boolean;
  avoidSensitiveContent: boolean;
  dataRetentionDays: number;
  requireConsent: boolean;
}

export class ScrapingComplianceService {
  /**
   * Get compliance settings for user and platform
   */
  async getComplianceSettings(userId: string, platform: string): Promise<ComplianceSettings | null> {
    try {
      const settings = await db.select()
        .from(scrapingCompliance)
        .where(and(
          eq(scrapingCompliance.userId, userId),
          eq(scrapingCompliance.platform, platform)
        ))
        .limit(1);

      if (settings.length === 0) {
        // Create default settings if not exists
        return await this.createDefaultComplianceSettings(userId, platform);
      }

      return settings[0];
    } catch (error) {
      logger.error(`Failed to get compliance settings: ${error.message}`);
      return null;
    }
  }

  /**
   * Create default compliance settings for a platform
   */
  private async createDefaultComplianceSettings(userId: string, platform: string): Promise<ComplianceSettings> {
    const defaultSettings = {
      userId,
      platform,
      maxRequestsPerHour: this.getDefaultMaxRequestsPerHour(platform),
      maxRequestsPerDay: this.getDefaultMaxRequestsPerDay(platform),
      respectRobotsTxt: true,
      avoidPrivateProfiles: true,
      avoidSensitiveContent: true,
      dataRetentionDays: 365,
      requireConsent: this.requiresConsent(platform),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await db.insert(scrapingCompliance).values(defaultSettings);
      return defaultSettings;
    } catch (error) {
      logger.error(`Failed to create default compliance settings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get default max requests per hour based on platform
   */
  private getDefaultMaxRequestsPerHour(platform: string): number {
    const limits = {
      'instagram': 60,
      'tiktok': 80,
      'twitter': 100,
      'facebook': 40,
      'linkedin': 20,
      'youtube': 120
    };
    return limits[platform] || 50;
  }

  /**
   * Get default max requests per day based on platform
   */
  private getDefaultMaxRequestsPerDay(platform: string): number {
    const limits = {
      'instagram': 1000,
      'tiktok': 1500,
      'twitter': 2000,
      'facebook': 800,
      'linkedin': 300,
      'youtube': 2500
    };
    return limits[platform] || 1000;
  }

  /**
   * Check if platform requires consent for data collection
   */
  private requiresConsent(platform: string): boolean {
    const consentRequired = ['linkedin', 'facebook'];
    return consentRequired.includes(platform);
  }

  /**
   * Update compliance settings
   */
  async updateComplianceSettings(
    userId: string, 
    platform: string, 
    settings: Partial<ComplianceSettings>
  ): Promise<boolean> {
    try {
      await db.update(scrapingCompliance)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(and(
          eq(scrapingCompliance.userId, userId),
          eq(scrapingCompliance.platform, platform)
        ));

      logger.info(`Updated compliance settings for ${platform}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update compliance settings: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if scraping request is compliant
   */
  async isScrapingCompliant(
    userId: string, 
    platform: string, 
    scrapingType: string,
    queries: string[]
  ): Promise<{ compliant: boolean; reason?: string }> {
    
    const settings = await this.getComplianceSettings(userId, platform);
    if (!settings) {
      return { compliant: false, reason: 'No compliance settings found' };
    }

    // Check if scraping type is allowed
    if (!this.isScrapingTypeAllowed(platform, scrapingType)) {
      return { 
        compliant: false, 
        reason: `Scraping type 