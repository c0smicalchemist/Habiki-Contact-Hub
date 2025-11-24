import { ScrapingAPIClient } from './scraping-api-client';
import { ScrapingComplianceService } from './scraping-compliance-service';
import { ContactTaggingService } from './contact-tagging-service';
import { InstagramScraper, TikTokScraper, TwitterScraper, FacebookScraper, LinkedInScraper, YouTubeScraper } from './platform-scrapers';
import { db } from '../db';
import { scrapedContacts, scrapingLogs, scrapingCampaigns } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface ScrapingResult {
  contacts: ScrapedContactData[];
  totalFound: number;
  totalSaved: number;
  errors: string[];
  executionTime: number;
}

export interface ScrapedContactData {
  platformUserId: string;
  username?: string;
  displayName?: string;
  profileUrl: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isVerified?: boolean;
  isBusiness?: boolean;
  category?: string;
  tags?: string[];
  engagementRate?: number;
  lastPostDate?: Date;
  privacyStatus?: string;
  isReachable?: boolean;
}

export interface ScrapingOptions {
  maxContacts?: number;
  rateLimitDelay?: number;
  filters?: {
    minFollowers?: number;
    maxFollowers?: number;
    mustBeBusiness?: boolean;
    mustBeVerified?: boolean;
    location?: string[];
    keywords?: string[];
    excludeKeywords?: string[];
  };
}

export class SocialMediaScrapingService {
  private apiClient: ScrapingAPIClient;
  private complianceService: ScrapingComplianceService;
  private taggingService: ContactTaggingService;
  private instagramScraper: InstagramScraper;
  private tiktokScraper: TikTokScraper;
  private twitterScraper: TwitterScraper;
  private facebookScraper: FacebookScraper;
  private linkedinScraper: LinkedInScraper;
  private youtubeScraper: YouTubeScraper;

  constructor() {
    this.apiClient = new ScrapingAPIClient();
    this.complianceService = new ScrapingComplianceService();
    this.taggingService = new ContactTaggingService();
    this.instagramScraper = new InstagramScraper();
    this.tiktokScraper = new TikTokScraper();
    this.twitterScraper = new TwitterScraper();
    this.facebookScraper = new FacebookScraper();
    this.linkedinScraper = new LinkedInScraper();
    this.youtubeScraper = new YouTubeScraper();
  }

  /**
   * Main scraping method that handles all platforms
   */
  async scrapeContacts(
    userId: string,
    platform: string,
    scrapingType: string,
    queries: string[],
    options: ScrapingOptions = {}
  ): Promise<ScrapingResult> {
    const startTime = Date.now();
    
    try {
      // Check compliance settings
      const compliance = await this.complianceService.getComplianceSettings(userId, platform);
      if (!compliance) {
        throw new Error(`No compliance settings found for platform: ${platform}`);
      }

      // Validate scraping request
      await this.validateScrapingRequest(userId, platform, scrapingType, queries);

      const allContacts: ScrapedContactData[] = [];
      const errors: string[] = [];
      let totalFound = 0;
      let totalSaved = 0;

      // Process each query
      for (const query of queries) {
        try {
          logger.info(`Scraping ${platform} for query: ${query}`);
          
          const result = await this.scrapePlatform(
            userId,
            platform,
            scrapingType,
            query,
            options,
            compliance
          );

          allContacts.push(...result.contacts);
          totalFound += result.contacts.length;
          
          // Log scraping activity
          await this.logScrapingActivity(userId, platform, scrapingType, query, result);

          // Rate limiting
          if (compliance.rateLimitDelay > 0) {
            await this.delay(compliance.rateLimitDelay);
          }

        } catch (error) {
          const errorMessage = `Failed to scrape query "${query}": ${error.message}`;
          logger.error(errorMessage);
          errors.push(errorMessage);
          
          await this.logScrapingActivity(userId, platform, scrapingType, query, {
            contacts: [],
            totalFound: 0,
            totalSaved: 0,
            errors: [errorMessage],
            executionTime: 0
          });
        }
      }

      // Save contacts to database
      const savedContacts = await this.saveContacts(userId, platform, allContacts, scrapingType, options);
      totalSaved = savedContacts.length;

      // Auto-tag contacts based on content
      await this.autoTagContacts(savedContacts);

      const executionTime = Date.now() - startTime;

      return {
        contacts: savedContacts,
        totalFound,
        totalSaved,
        errors,
        executionTime
      };

    } catch (error) {
      logger.error(`Scraping failed for ${platform}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Facebook scraping implementation
   */
  private async scrapeFacebook(
    userId: string,
    scrapingType: string,
    query: string,
    options: ScrapingOptions,
    compliance: any
  ): Promise<{ contacts: ScrapedContactData[] }> {
    
    const contacts: ScrapedContactData[] = [];

    try {
      switch (scrapingType) {
        case 'pages':
          // Scrape Facebook business pages
          const pageContacts = await this.facebookScraper.scrapePages(query, options);
          contacts.push(...pageContacts);
          break;

        case 'groups':
          // Scrape Facebook group members
          const groupContacts = await this.facebookScraper.scrapeGroups(query, options);
          contacts.push(...groupContacts);
          break;

        case 'business':
          // Scrape Facebook business accounts
          const businessContacts = await this.facebookScraper.scrapeBusinessAccounts(query, options);
          contacts.push(...businessContacts);
          break;

        case 'profile':
          // Scrape individual Facebook profile
          const profileContact = await this.facebookScraper.scrapeByUsername(query, options);
          if (profileContact) {
            contacts.push(profileContact);
          }
          break;

        default:
          throw new Error(`Unsupported Facebook scraping type: ${scrapingType}`);
      }

      const filteredContacts = this.applyFilters(contacts, options.filters);
      return { contacts: filteredContacts };

    } catch (error) {
      logger.error(`Facebook scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * LinkedIn scraping implementation
   */
  private async scrapeLinkedIn(
    userId: string,
    scrapingType: string,
    query: string,
    options: ScrapingOptions,
    compliance: any
  ): Promise<{ contacts: ScrapedContactData[] }> {
    
    const contacts: ScrapedContactData[] = [];

    try {
      switch (scrapingType) {
        case 'professionals':
          // Scrape LinkedIn professionals by industry
          const professionalContacts = await this.linkedinScraper.scrapeProfessionals(query, options);
          contacts.push(...professionalContacts);
          break;

        case 'companies':
          // Scrape LinkedIn companies by type
          const companyContacts = await this.linkedinScraper.scrapeCompanies(query, options);
          contacts.push(...companyContacts);
          break;

        case 'jobtitle':
          // Scrape LinkedIn users by job title
          const jobTitleContacts = await this.linkedinScraper.scrapeByJobTitle(query, options);
          contacts.push(...jobTitleContacts);
          break;

        case 'profile':
          // Scrape individual LinkedIn profile
          const profileContact = await this.linkedinScraper.scrapeByUsername(query, options);
          if (profileContact) {
            contacts.push(profileContact);
          }
          break;

        default:
          throw new Error(`Unsupported LinkedIn scraping type: ${scrapingType}`);
      }

      const filteredContacts = this.applyFilters(contacts, options.filters);
      return { contacts: filteredContacts };

    } catch (error) {
      logger.error(`LinkedIn scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * YouTube scraping implementation
   */
  private async scrapeYouTube(
    userId: string,
    scrapingType: string,
    query: string,
    options: ScrapingOptions,
    compliance: any
  ): Promise<{ contacts: ScrapedContactData[] }> {
    
    const contacts: ScrapedContactData[] = [];

    try {
      switch (scrapingType) {
        case 'channels':
          // Scrape YouTube channels by category
          const channelContacts = await this.youtubeScraper.scrapeChannels(query, options);
          contacts.push(...channelContacts);
          break;

        case 'trending':
          // Scrape trending YouTube creators
          const trendingContacts = await this.youtubeScraper.scrapeTrending(query, options);
          contacts.push(...trendingContacts);
          break;

        case 'subscribers':
          // Scrape subscribers of specific channel
          const subscriberContacts = await this.youtubeScraper.scrapeSubscribers(query, options);
          contacts.push(...subscriberContacts);
          break;

        case 'profile':
          // Scrape individual YouTube channel
          const profileContact = await this.youtubeScraper.scrapeByUsername(query, options);
          if (profileContact) {
            contacts.push(profileContact);
          }
          break;

        default:
          throw new Error(`Unsupported YouTube scraping type: ${scrapingType}`);
      }

      const filteredContacts = this.applyFilters(contacts, options.filters);
      return { contacts: filteredContacts };

    } catch (error) {
      logger.error(`YouTube scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Instagram scraping implementation
   */
  private async scrapeInstagram(
    userId: string,
    scrapingType: string,
    query: string,
    options: ScrapingOptions,
    compliance: any
  ): Promise<{ contacts: ScrapedContactData[] }> {
    
    const contacts: ScrapedContactData[] = [];

    try {
      switch (scrapingType) {
        case 'hashtag':
          // Scrape users who posted with specific hashtag
          const hashtagContacts = await this.instagramScraper.scrapeByHashtag(query, options);
          contacts.push(...hashtagContacts);
          break;

        case 'followers':
          // Scrape followers of specific account
          const followerContacts = await this.instagramScraper.scrapeFollowers(query, options);
          contacts.push(...followerContacts);
          break;

        case 'location':
          // Scrape users who posted from specific location
          const locationContacts = await this.instagramScraper.scrapeByLocation(query, options);
          contacts.push(...locationContacts);
          break;

        case 'profile':
          // Scrape individual Instagram profile
          const profileContact = await this.instagramScraper.scrapeByUsername(query, options);
          if (profileContact) {
            contacts.push(profileContact);
          }
          break;

        default:
          throw new Error(`Unsupported Instagram scraping type: ${scrapingType}`);
      }

      // Apply filters
      const filteredContacts = this.applyFilters(contacts, options.filters);
      
      return { contacts: filteredContacts };

    } catch (error) {
      logger.error(`Instagram scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * TikTok scraping implementation
   */
  private async scrapeTikTok(
    userId: string,
    scrapingType: string,
    query: string,
    options: ScrapingOptions,
    compliance: any
  ): Promise<{ contacts: ScrapedContactData[] }> {
    
    const contacts: ScrapedContactData[] = [];

    try {
      switch (scrapingType) {
        case 'hashtag':
          // Scrape TikTok users who used specific hashtag
          const hashtagContacts = await this.tiktokScraper.scrapeByHashtag(query, options);
          contacts.push(...hashtagContacts);
          break;

        case 'trending':
          // Scrape trending content creators
          const trendingContacts = await this.tiktokScraper.scrapeTrending(query, options);
          contacts.push(...trendingContacts);
          break;

        case 'creators':
          // Scrape creators by niche
          const creatorContacts = await this.tiktokScraper.scrapeCreators(query, options);
          contacts.push(...creatorContacts);
          break;

        case 'profile':
          // Scrape individual TikTok profile
          const profileContact = await this.tiktokScraper.scrapeByUsername(query, options);
          if (profileContact) {
            contacts.push(profileContact);
          }
          break;

        default:
          throw new Error(`Unsupported TikTok scraping type: ${scrapingType}`);
      }

      const filteredContacts = this.applyFilters(contacts, options.filters);
      return { contacts: filteredContacts };

    } catch (error) {
      logger.error(`TikTok scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Twitter/X scraping implementation
   */
  private async scrapeTwitter(
    userId: string,
    scrapingType: string,
    query: string,
    options: ScrapingOptions,
    compliance: any
  ): Promise<{ contacts: ScrapedContactData[] }> {
    
    const contacts: ScrapedContactData[] = [];

    try {
      switch (scrapingType) {
        case 'keyword':
          // Scrape users based on keyword in tweets
          const keywordContacts = await this.twitterScraper.scrapeByKeyword(query, options);
          contacts.push(...keywordContacts);
          break;

        case 'trending':
          // Scrape trending topic users
          const trendingContacts = await this.twitterScraper.scrapeTrending(query, options);
          contacts.push(...trendingContacts);
          break;

        case 'followers':
          // Scrape followers of specific account
          const followerContacts = await this.twitterScraper.scrapeFollowers(query, options);
          contacts.push(...followerContacts);
          break;

        case 'profile':
          // Scrape individual Twitter profile
          const profileContact = await this.twitterScraper.scrapeByUsername(query, options);
          if (profileContact) {
            contacts.push(profileContact);
          }
          break;

        default:
          throw new Error(`Unsupported Twitter scraping type: ${scrapingType}`);
      }

      const filteredContacts = this.applyFilters(contacts, options.filters);
      return { contacts: filteredContacts };

    } catch (error) {
      logger.error(`Twitter scraping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply filters to scraped contacts
   */
  private applyFilters(contacts: ScrapedContactData[], filters?: any): ScrapedContactData[] {
    if (!filters) return contacts;

    return contacts.filter(contact => {
      // Follower count filter
      if (filters.minFollowers && (contact.followerCount || 0) < filters.minFollowers) {
        return false;
      }
      if (filters.maxFollowers && (contact.followerCount || 0) > filters.maxFollowers) {
        return false;
      }

      // Business account filter
      if (filters.mustBeBusiness && !contact.isBusiness) {
        return false;
      }

      // Verified account filter
      if (filters.mustBeVerified && !contact.isVerified) {
        return false;
      }

      // Location filter
      if (filters.location && filters.location.length > 0) {
        const contactLocation = contact.location?.toLowerCase() || '';
        const hasMatchingLocation = filters.location.some((loc: string) => 
          contactLocation.includes(loc.toLowerCase())
        );
        if (!hasMatchingLocation) return false;
      }

      // Keywords filter
      if (filters.keywords && filters.keywords.length > 0) {
        const bioText = contact.bio?.toLowerCase() || '';
        const hasKeyword = filters.keywords.some((keyword: string) => 
          bioText.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      // Exclude keywords filter
      if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
        const bioText = contact.bio?.toLowerCase() || '';
        const hasExcludedKeyword = filters.excludeKeywords.some((keyword: string) => 
          bioText.includes(keyword.toLowerCase())
        );
        if (hasExcludedKeyword) return false;
      }

      return true;
    });
  }

  /**
   * Save contacts to database with deduplication
   */
  private async saveContacts(
    userId: string,
    platform: string,
    contacts: ScrapedContactData[],
    scrapingSource: string,
    options: ScrapingOptions
  ): Promise<ScrapedContactData[]> {
    
    const savedContacts: ScrapedContactData[] = [];

    for (const contact of contacts) {
      try {
        // Check for duplicates
        const existingContact = await db.select()
          .from(scrapedContacts)
          .where(and(
            eq(scrapedContacts.userId, userId),
            eq(scrapedContacts.platform, platform),
            eq(scrapedContacts.platformUserId, contact.platformUserId)
          ))
          .limit(1);

        if (existingContact.length > 0) {
          // Update existing contact
          await db.update(scrapedContacts)
            .set({
              ...contact,
              updatedAt: new Date(),
              validationStatus: 'valid'
            })
            .where(eq(scrapedContacts.id, existingContact[0].id));
          
          savedContacts.push(contact);
        } else {
          // Insert new contact
          await db.insert(scrapedContacts).values({
            ...contact,
            userId,
            platform,
            scrapingSource,
            scrapingQuery: contact.scrapingQuery || 'bulk_import',
            validationStatus: 'valid',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          savedContacts.push(contact);
        }

      } catch (error) {
        logger.error(`Failed to save contact ${contact.platformUserId}: ${error.message}`);
      }
    }

    return savedContacts;
  }

  /**
   * Auto-tag contacts based on their content
   */
  private async autoTagContacts(contacts: ScrapedContactData[]): Promise<void> {
    for (const contact of contacts) {
      try {
        await this.taggingService.autoTagContact(contact);
      } catch (error) {
        logger.error(`Failed to auto-tag contact ${contact.platformUserId}: ${error.message}`);
      }
    }
  }

  /**
   * Log scraping activity for monitoring and compliance
   */
  private async logScrapingActivity(
    userId: string,
    platform: string,
    scrapingType: string,
    query: string,
    result: any
  ): Promise<void> {
    
    try {
      await db.insert(scrapingLogs).values({
        userId,
        platform,
        scrapingType,
        query,
        contactsFound: result.contacts.length,
        contactsSaved: result.totalSaved,
        status: result.errors.length > 0 ? 'partial_success' : 'success',
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
        responseTime: result.executionTime,
        createdAt: new Date()
      });
    } catch (error) {
      logger.error(`Failed to log scraping activity: ${error.message}`);
    }
  }

  /**
   * Validate scraping request against compliance rules
   */
  private async validateScrapingRequest(
    userId: string,
    platform: string,
    scrapingType: string,
    queries: string[]
  ): Promise<void> {
    
    // Check rate limits
    const recentRequests = await db.select()
      .from(scrapingLogs)
      .where(and(
        eq(scrapingLogs.userId, userId),
        eq(scrapingLogs.platform, platform),
        sql`created_at > NOW() - INTERVAL '1 hour'`
      ));

    const compliance = await this.complianceService.getComplianceSettings(userId, platform);
    if (recentRequests.length >= compliance.maxRequestsPerHour) {
      throw new Error(`Rate limit exceeded: ${compliance.maxRequestsPerHour} requests per hour`);
    }

    // Validate queries
    for (const query of queries) {
      if (!query || query.trim().length === 0) {
        throw new Error('Empty query provided');
      }
      if (query.length > 100) {
        throw new Error('Query too long (max 100 characters)');
      }
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}