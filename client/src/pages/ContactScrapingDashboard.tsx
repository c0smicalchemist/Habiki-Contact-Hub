import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import ContactFilteringInterface from '@/components/ContactFilteringInterface';
import ScrapingAnalytics from '@/components/ScrapingAnalytics';
import { 
  Play, 
  Pause, 
  Stop, 
  Download, 
  Filter, 
  Search, 
  Users, 
  Hash,
  TrendingUp,
  Target,
  Settings,
  Eye,
  Trash2,
  Edit,
  Plus,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScrapingCampaign {
  id: string;
  name: string;
  platform: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  queries: string[];
  filters: {
    minFollowers?: number;
    maxFollowers?: number;
    location?: string[];
    categories?: string[];
    tags?: string[];
    verifiedOnly?: boolean;
    businessOnly?: boolean;
  };
  settings: {
    maxContacts: number;
    delayBetweenRequests: number;
    respectRateLimits: boolean;
    validateEmails: boolean;
    autoTag: boolean;
  };
  progress: {
    total: number;
    scraped: number;
    validated: number;
    failed: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface ScrapedContact {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  isBusiness: boolean;
  category?: string;
  tags: string[];
  engagementRate?: number;
  validationStatus: 'pending' | 'valid' | 'invalid' | 'unknown';
  scrapedAt: string;
}

interface PlatformStats {
  platform: string;
  totalContacts: number;
  validContacts: number;
  avgEngagementRate: number;
  topTags: string[];
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-gradient-to-br from-black to-red-500' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: 'bg-gradient-to-br from-blue-600 to-blue-800' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-gradient-to-br from-blue-700 to-blue-900' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-gradient-to-br from-red-500 to-red-700' }
];

const CATEGORIES = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Technology', 'Business', 
  'Art', 'Music', 'Sports', 'Gaming', 'Lifestyle', 'Education', 'Health',
  'Finance', 'Real Estate', 'Automotive', 'Photography', 'Entertainment'
];

export default function ContactScrapingDashboard() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<ScrapingCampaign[]>([]);
  const [contacts, setContacts] = useState<ScrapedContact[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New campaign form state
  const [newCampaign, setNewCampaign] = useState<Partial<ScrapingCampaign>>({
    name: '',
    platform: '',
    queries: [],
    filters: {},
    settings: {
      maxContacts: 1000,
      delayBetweenRequests: 2000,
      respectRateLimits: true,
      validateEmails: true,
      autoTag: true
    },
    progress: { total: 0, scraped: 0, validated: 0, failed: 0 }
  });

  // Load initial data
  useEffect(() => {
    loadCampaigns();
    loadContacts();
    loadPlatformStats();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scraping/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters as any).toString();
      const response = await fetch(`/api/scraping/contacts?${params}`);
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'destructive'
      });
    }
  };

  const loadPlatformStats = async () => {
    try {
      const response = await fetch('/api/scraping/analytics/platforms');
      const data = await response.json();
      setPlatformStats(data.stats || []);
    } catch (error) {
      console.error('Failed to load platform stats:', error);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.platform) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in campaign name and platform',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/scraping/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign created successfully'
        });
        loadCampaigns();
        setNewCampaign({
          name: '',
          platform: '',
          queries: [],
          filters: {},
          settings: {
            maxContacts: 1000,
            delayBetweenRequests: 2000,
            respectRateLimits: true,
            validateEmails: true,
            autoTag: true
          },
          progress: { total: 0, scraped: 0, validated: 0, failed: 0 }
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}/start`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign started successfully'
        });
        loadCampaigns();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start campaign',
        variant: 'destructive'
      });
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}/pause`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign paused successfully'
        });
        loadCampaigns();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to pause campaign',
        variant: 'destructive'
      });
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign deleted successfully'
        });
        loadCampaigns();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive'
      });
    }
  };

  const exportContacts = async (format: 'csv' | 'json' | 'xlsx', filters = {}) => {
    try {
      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).map(([k, v]) => [k, String(v)]))
      }).toString();
      
      const response = await fetch(`/api/scraping/contacts/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: `Contacts exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export contacts',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformColor = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.id === platform);
    return platformData?.color || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Scraping Dashboard</h1>
          <p className="text-gray-600">Scrape and manage contacts from social media platforms</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportContacts('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportContacts('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Platform Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {PLATFORMS.map((platform) => {
          const stats = platformStats.find(s => s.platform === platform.id);
          return (
            <Card key={platform.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{platform.icon} {platform.name}</CardTitle>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
                <div className="text-sm text-gray-600">
                  {stats?.validContacts || 0} valid contacts
                </div>
                {stats?.avgEngagementRate && (
                  <div className="text-xs text-green-600 mt-1">
                    {stats.avgEngagementRate.toFixed(1)}% avg engagement
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="new-campaign">New Campaign</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Your latest scraping campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(campaign.status)}`} />
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-gray-600">{campaign.platform}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{campaign.progress.scraped}/{campaign.progress.total}</div>
                        <Progress value={(campaign.progress.scraped / campaign.progress.total) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your scraping performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Contacts</span>
                    <span className="font-bold">{contacts.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valid Contacts</span>
                    <span className="font-bold text-green-600">
                      {contacts.filter(c => c.validationStatus === 'valid').length.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Campaigns</span>
                    <span className="font-bold">{campaigns.filter(c => c.status === 'running').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-bold text-blue-600">
                      {contacts.length > 0 
                        ? Math.round((contacts.filter(c => c.validationStatus === 'valid').length / contacts.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Campaigns</CardTitle>
              <CardDescription>Manage your contact scraping campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>
                            {campaign.platform} • Created {new Date(campaign.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status.toUpperCase()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{campaign.progress.scraped} / {campaign.progress.total}</span>
                          </div>
                          <Progress value={(campaign.progress.scraped / campaign.progress.total) * 100} />
                        </div>

                        {/* Queries */}
                        {campaign.queries.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Search Queries</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {campaign.queries.map((query, index) => (
                                <Badge key={index} variant="secondary">{query}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4">
                          <div className="text-sm text-gray-600">
                            {campaign.progress.validated} validated • {campaign.progress.failed} failed
                          </div>
                          <div className="flex space-x-2">
                            {campaign.status === 'draft' && (
                              <Button onClick={() => startCampaign(campaign.id)} size="sm">
                                <Play className="w-4 h-4 mr-1" />
                                Start
                              </Button>
                            )}
                            {campaign.status === 'running' && (
                              <Button onClick={() => pauseCampaign(campaign.id)} variant="outline" size="sm">
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                              </Button>
                            )}
                            {campaign.status === 'paused' && (
                              <Button onClick={() => startCampaign(campaign.id)} size="sm">
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Set up a new contact scraping campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      value={newCampaign.name || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={newCampaign.platform || ''}
                      onValueChange={(value) => setNewCampaign({...newCampaign, platform: value})}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.icon} {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Queries */}
                <div>
                  <Label>Search Queries</Label>
                  <Textarea
                    placeholder="Enter search queries (one per line)"
                    value={newCampaign.queries?.join('\n') || ''}
                    onChange={(e) => setNewCampaign({
                      ...newCampaign, 
                      queries: e.target.value.split('\n').filter(q => q.trim())
                    })}
                    rows={4}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Enter keywords, hashtags, or usernames to search for
                  </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min-followers">Min Followers</Label>
                    <Input
                      id="min-followers"
                      type="number"
                      placeholder="0"
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        filters: {
                          ...newCampaign.filters,
                          minFollowers: parseInt(e.target.value) || undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-followers">Max Followers</Label>
                    <Input
                      id="max-followers"
                      type="number"
                      placeholder="∞"
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        filters: {
                          ...newCampaign.filters,
                          maxFollowers: parseInt(e.target.value) || undefined
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-contacts">Max Contacts</Label>
                    <Input
                      id="max-contacts"
                      type="number"
                      value={newCampaign.settings?.maxContacts || 1000}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        settings: {
                          ...newCampaign.settings,
                          maxContacts: parseInt(e.target.value) || 1000
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="space-y-4">
                  <div>
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CATEGORIES.map((category) => (
                        <Badge
                          key={category}
                          variant={newCampaign.filters?.categories?.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = newCampaign.filters?.categories || [];
                            const updated = current.includes(category)
                              ? current.filter(c => c !== category)
                              : [...current, category];
                            setNewCampaign({
                              ...newCampaign,
                              filters: { ...newCampaign.filters, categories: updated }
                            });
                          }}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified-only"
                        checked={newCampaign.filters?.verifiedOnly || false}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          filters: { ...newCampaign.filters, verifiedOnly: checked as boolean }
                        })}
                      />
                      <Label htmlFor="verified-only">Verified accounts only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="business-only"
                        checked={newCampaign.filters?.businessOnly || false}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          filters: { ...newCampaign.filters, businessOnly: checked as boolean }
                        })}
                      />
                      <Label htmlFor="business-only">Business accounts only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="respect-rate-limits"
                        checked={newCampaign.settings?.respectRateLimits || false}
                        onCheckedChange={(checked) => setNewCampaign({
                          ...newCampaign,
                          settings: { ...newCampaign.settings, respectRateLimits: checked as boolean }
                        })}
                      />
                      <Label htmlFor="respect-rate-limits">Respect rate limits</Label>
                    </div>
                  </div>
                </div>

                {/* Create Button */}
                <Button onClick={createCampaign} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ContactFilteringInterface
                onFilterChange={(filters) => loadContacts(filters)}
                className="sticky top-4"
              />
            </div>
            
            {/* Contacts List */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Scraped Contacts</CardTitle>
                      <CardDescription>View and manage your scraped contacts</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contact Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">{contacts.length}</div>
                        <div className="text-sm text-gray-600">Total Contacts</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {contacts.filter(c => c.validationStatus === 'valid').length}
                        </div>
                        <div className="text-sm text-gray-600">Valid Contacts</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {contacts.filter(c => c.isVerified).length}
                        </div>
                        <div className="text-sm text-gray-600">Verified</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {contacts.filter(c => c.isBusiness).length}
                        </div>
                        <div className="text-sm text-gray-600">Business</div>
                      </div>
                    </div>

                    {/* Contacts List */}
                    <div className="border rounded-lg">
                      <div className="max-h-96 overflow-y-auto">
                        {contacts.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No contacts found matching your filters
                          </div>
                        ) : (
                          contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={contact.avatarUrl || `https://via.placeholder.com/40?text=${contact.username[0]?.toUpperCase()}`}
                                  alt={contact.username}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <div className="font-medium">{contact.displayName || contact.username}</div>
                                  <div className="text-sm text-gray-600">@{contact.username}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {contact.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {contact.category}
                                      </Badge>
                                    )}
                                    {contact.platform && (
                                      <Badge variant="outline" className="text-xs">
                                        {PLATFORMS.find(p => p.id === contact.platform)?.icon} {contact.platform}
                                      </Badge>
                                    )}
                                    {contact.tags?.slice(0, 3).map((tag, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                    {contact.tags && contact.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{contact.tags.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {contact.followerCount.toLocaleString()} followers
                                </div>
                                <div className="text-xs text-gray-600">
                                  {contact.engagementRate?.toFixed(1) || '0'}% engagement
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Badge 
                                    variant={contact.validationStatus === 'valid' ? 'success' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {contact.validationStatus}
                                  </Badge>
                                  {contact.isVerified && (
                                    <Badge variant="outline" className="text-xs">
                                      ✓ Verified
                                    </Badge>
                                  )}
                                  {contact.isBusiness && (
                                    <Badge variant="outline" className="text-xs">
                                      🏢 Business
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ScrapingAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
