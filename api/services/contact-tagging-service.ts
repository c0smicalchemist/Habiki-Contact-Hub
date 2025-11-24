import { db } from '../db';
import { contactTags, contactTagRelations, scrapedContacts } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

export interface TagData {
  name: string;
  color?: string;
  description?: string;
  confidence?: number;
  source?: string;
}

export class ContactTaggingService {
  /**
   * Auto-tag a contact based on their profile data
   */
  async autoTagContact(contact: any): Promise<void> {
    try {
      const tags = await this.extractTagsFromContact(contact);
      
      for (const tagData of tags) {
        await this.addTagToContact(contact.platformUserId, contact.userId, tagData);
      }
      
      logger.info(`Auto-tagged contact ${contact.platformUserId} with ${tags.length} tags`);
    } catch (error) {
      logger.error(`Failed to auto-tag contact ${contact.platformUserId}: ${error.message}`);
    }
  }

  /**
   * Extract relevant tags from contact data
   */
  private async extractTagsFromContact(contact: any): Promise<TagData[]> {
    const tags: TagData[] = [];
    
    // Extract tags from bio
    if (contact.bio) {
      const bioTags = this.extractTagsFromText(contact.bio);
      tags.push(...bioTags);
    }
    
    // Extract tags from category
    if (contact.category) {
      tags.push({
        name: contact.category.toLowerCase().replace(/\s+/g, '-'),
        color: this.getCategoryColor(contact.category),
        description: `Category: ${contact.category}`,
        confidence: 0.9,
        source: 'category'
      });
    }
    
    // Extract tags from location
    if (contact.location) {
      const locationTag = this.extractLocationTag(contact.location);
      if (locationTag) {
        tags.push(locationTag);
      }
    }
    
    // Extract tags from existing tags array
    if (contact.tags && Array.isArray(contact.tags)) {
      for (const tag of contact.tags) {
        tags.push({
          name: tag.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          color: this.getRandomColor(),
          description: `Extracted from profile tags`,
          confidence: 0.8,
          source: 'profile-tags'
        });
      }
    }
    
    // Platform-specific tagging
    if (contact.platform) {
      tags.push({
        name: contact.platform,
        color: this.getPlatformColor(contact.platform),
        description: `Platform: ${contact.platform}`,
        confidence: 1.0,
        source: 'platform'
      });
    }
    
    // Engagement-based tagging
    if (contact.engagementRate) {
      const engagementTag = this.getEngagementTag(contact.engagementRate);
      if (engagementTag) {
        tags.push(engagementTag);
      }
    }
    
    // Follower count based tagging
    if (contact.followerCount) {
      const followerTag = this.getFollowerTag(contact.followerCount);
      if (followerTag) {
        tags.push(followerTag);
      }
    }
    
    // Business account tagging
    if (contact.isBusiness) {
      tags.push({
        name: 'business-account',
        color: '#10B981',
        description: 'Business account',
        confidence: 1.0,
        source: 'account-type'
      });
    }
    
    // Verified account tagging
    if (contact.isVerified) {
      tags.push({
        name: 'verified-account',
        color: '#3B82F6',
        description: 'Verified account',
        confidence: 1.0,
        source: 'account-type'
      });
    }
    
    return this.deduplicateTags(tags);
  }

  /**
   * Extract tags from text content
   */
  private extractTagsFromText(text: string): TagData[] {
    const tags: TagData[] = [];
    const lowerText = text.toLowerCase();
    
    // Industry/category keywords
    const industryKeywords = {
      'fitness': ['fitness', 'gym', 'workout', 'health', 'exercise', 'training'],
      'food': ['food', 'cooking', 'recipe', 'restaurant', 'chef', 'culinary', 'dining'],
      'travel': ['travel', 'wanderlust', 'adventure', 'explore', 'journey', 'trip', 'vacation'],
      'technology': ['tech', 'technology', 'coding', 'programming', 'software', 'developer', 'startup'],
      'fashion': ['fashion', 'style', 'outfit', 'clothing', 'trend', 'designer'],
      'music': ['music', 'song', 'artist', 'band', 'concert', 'album', 'musician'],
      'art': ['art', 'artist', 'creative', 'design', 'painting', 'drawing', 'illustration'],
      'business': ['business', 'entrepreneur', 'startup', 'marketing', 'sales', 'consulting'],
      'lifestyle': ['lifestyle', 'life', 'living', 'daily', 'routine', 'habits']
    };
    
    for (const [category, keywords] of Object.entries(industryKeywords)) {
      const hasKeyword = keywords.some(keyword => lowerText.includes(keyword));
      if (hasKeyword) {
        tags.push({
          name: category,
          color: this.getCategoryColor(category),
          description: `Industry: ${category}`,
          confidence: 0.7,
          source: 'bio-analysis'
        });
      }
    }
    
    // Extract hashtags
    const hashtagMatches = text.match(/#\w+/g);
    if (hashtagMatches) {
      for (const hashtag of hashtagMatches) {
        const tagName = hashtag.substring(1).toLowerCase();
        if (tagName.length > 2) {
          tags.push({
            name: tagName,
            color: this.getRandomColor(),
            description: `Hashtag: #${tagName}`,
            confidence: 0.8,
            source: 'hashtag'
          });
        }
      }
    }
    
    return tags;
  }

  /**
   * Extract location-based tags
   */
  private extractLocationTag(location: string): TagData | null {
    const majorCities = [
      'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
      'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
      'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte',
      'san francisco', 'indianapolis', 'seattle', 'denver', 'washington',
      'boston', 'el paso', 'detroit', 'nashville', 'portland',
      'oklahoma city', 'las vegas', 'louisville', 'baltimore', 'milwaukee'
    ];
    
    const lowerLocation = location.toLowerCase();
    const isMajorCity = majorCities.some(city => lowerLocation.includes(city));
    
    if (isMajorCity) {
      return {
        name: 'major-city',
        color: '#F59E0B',
        description: `Location: ${location}`,
        confidence: 0.9,
        source: 'location'
      };
    }
    
    return null;
  }

  /**
   * Get engagement rate tag
   */
  private getEngagementTag(engagementRate: number): TagData | null {
    if (engagementRate >= 10) {
      return {
        name: 'high-engagement',
        color: '#EF4444',
        description: `High engagement: ${engagementRate.toFixed(1)}%`,
        confidence: 1.0,
        source: 'engagement'
      };
    } else if (engagementRate >= 5) {
      return {
        name: 'medium-engagement',
        color: '#F97316',
        description: `Medium engagement: ${engagementRate.toFixed(1)}%`,
        confidence: 1.0,
        source: 'engagement'
      };
    } else if (engagementRate >= 2) {
      return {
        name: 'low-engagement',
        color: '#6B7280',
        description: `Low engagement: ${engagementRate.toFixed(1)}%`,
        confidence: 1.0,
        source: 'engagement'
      };
    }
    
    return null;
  }

  /**
   * Get follower count tag
   */
  private getFollowerTag(followerCount: number): TagData | null {
    if (followerCount >= 100000) {
      return {
        name: 'mega-influencer',
        color: '#8B5CF6',
        description: `Mega influencer: ${followerCount.toLocaleString()} followers`,
        confidence: 1.0,
        source: 'followers'
      };
    } else if (followerCount >= 10000) {
      return {
        name: 'macro-influencer',
        color: '#A855F7',
        description: `Macro influencer: ${followerCount.toLocaleString()} followers`,
        confidence: 1.0,
        source: 'followers'
      };
    } else if (followerCount >= 1000) {
      return {
        name: 'micro-influencer',
        color: '#C084FC',
        description: `Micro influencer: ${followerCount.toLocaleString()} followers`,
        confidence: 1.0,
        source: 'followers'
      };
    }
    
    return null;
  }

  /**
   * Add tag to contact
   */
  async addTagToContact(platformUserId: string, userId: string, tagData: TagData): Promise<void> {
    try {
      // Create or get tag
      let tag = await db.select()
        .from(contactTags)
        .where(and(
          eq(contactTags.userId, userId),
          eq(contactTags.name, tagData.name)
        ))
        .limit(1);

      let tagId: string;
      
      if (tag.length === 0) {
        // Create new tag
        const newTag = await db.insert(contactTags)
          .values({
            userId,
            name: tagData.name,
            color: tagData.color || this.getRandomColor(),
            description: tagData.description,
            isSystem: false,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning({ id: contactTags.id });
        
        tagId = newTag[0].id;
      } else {
        tagId = tag[0].id;
      }

      // Get contact
      const contact = await db.select()
        .from(scrapedContacts)
        .where(and(
          eq(scrapedContacts.userId, userId),
          eq(scrapedContacts.platformUserId, platformUserId)
        ))
        .limit(1);

      if (contact.length === 0) {
        throw new Error('Contact not found');
      }

      const contactId = contact[0].id;

      // Check if relationship already exists
      const existingRelation = await db.select()
        .from(contactTagRelations)
        .where(and(
          eq(contactTagRelations.contactId, contactId),
          eq(contactTagRelations.tagId, tagId)
        ))
        .limit(1);

      if (existingRelation.length === 0) {
        // Create relationship
        await db.insert(contactTagRelations).values({
          contactId,
          tagId,
          confidence: tagData.confidence || 0.8,
          source: tagData.source || 'manual',
          createdAt: new Date()
        });

        // Update tag count
        await db.update(contactTags)
          .set({
            contactsCount: sql`contacts_count + 1`,
            updatedAt: new Date()
          })
          .where(eq(contactTags.id, tagId));
      }

    } catch (error) {
      logger.error(`Failed to add tag to contact: ${error.message}`);
      throw error;
    }
  }

  /**
   * Remove tag from contact
   */
  async removeTagFromContact(contactId: string, tagId: string): Promise<void> {
    try {
      await db.delete(contactTagRelations)
        .where(and(
          eq(contactTagRelations.contactId, contactId),
          eq(contactTagRelations.tagId, tagId)
        ));

      // Update tag count
      await db.update(contactTags)
        .set({
          contactsCount: sql`contacts_count - 1`,
          updatedAt: new Date()
        })
        .where(eq(contactTags.id, tagId));

    } catch (error) {
      logger.error(`Failed to remove tag from contact: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get contact tags
   */
  async getContactTags(contactId: string): Promise<any[]> {
    try {
      const tags = await db.select({
        id: contactTags.id,
        name: contactTags.name,
        color: contactTags.color,
        description: contactTags.description,
        confidence: contactTagRelations.confidence,
        source: contactTagRelations.source,
        createdAt: contactTagRelations.createdAt
      })
      .from(contactTagRelations)
      .innerJoin(contactTags, eq(contactTagRelations.tagId, contactTags.id))
      .where(eq(contactTagRelations.contactId, contactId));

      return tags;
    } catch (error) {
      logger.error(`Failed to get contact tags: ${error.message}`);
      return [];
    }
  }

  /**
   * Get tags by user
   */
  async getUserTags(userId: string): Promise<any[]> {
    try {
      const tags = await db.select()
        .from(contactTags)
        .where(eq(contactTags.userId, userId))
        .orderBy(contactTags.name);

      return tags;
    } catch (error) {
      logger.error(`Failed to get user tags: ${error.message}`);
      return [];
    }
  }

  /**
   * Bulk tag contacts
   */
  async bulkTagContacts(contactIds: string[], tagData: TagData): Promise<void> {
    for (const contactId of contactIds) {
      try {
        const contact = await db.select()
          .from(scrapedContacts)
          .where(eq(scrapedContacts.id, contactId))
          .limit(1);

        if (contact.length > 0) {
          await this.addTagToContact(contact[0].platformUserId, contact[0].userId, tagData);
        }
      } catch (error) {
        logger.error(`Failed to bulk tag contact ${contactId}: ${error.message}`);
      }
    }
  }

  /**
   * Delete tag and all its relationships
   */
  async deleteTag(tagId: string): Promise<void> {
    try {
      // Delete all relationships first
      await db.delete(contactTagRelations)
        .where(eq(contactTagRelations.tagId, tagId));

      // Delete the tag
      await db.delete(contactTags)
        .where(eq(contactTags.id, tagId));

    } catch (error) {
      logger.error(`Failed to delete tag: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private getCategoryColor(category: string): string {
    const colors = {
      'fitness': '#EF4444',
      'food': '#F59E0B',
      'travel': '#10B981',
      'technology': '#3B82F6',
      'fashion': '#8B5CF6',
      'music': '#EC4899',
      'art': '#F97316',
      'business': '#6B7280'
    };
    
    return colors[category.toLowerCase()] || this.getRandomColor();
  }

  private getPlatformColor(platform: string): string {
    const colors = {
      'instagram': '#E4405F',
      'tiktok': '#000000',
      'twitter': '#1DA1F2',
      'facebook': '#1877F2',
      'linkedin': '#0A66C2',
      'youtube': '#FF0000'
    };
    
    return colors[platform.toLowerCase()] || '#6B7280';
  }

  private getRandomColor(): string {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
      '#EC4899', '#F97316', '#06B6D4', '#84CC16', '#F59E0B'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private deduplicateTags(tags: TagData[]): TagData[] {
    const seen = new Set<string>();
    return tags.filter(tag => {
      if (seen.has(tag.name)) {
        return false;
      }
      seen.add(tag.name);
      return true;
    });
  }
}