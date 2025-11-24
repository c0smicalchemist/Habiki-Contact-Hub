import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Settings, 
  Users, 
  TrendingUp, 
  Filter, 
  Download,
  Search,
  Tag,
  Globe,
  Target,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  scrapingTypes: string[];
  enabled: boolean;
}

interface ScrapingCampaign {
  id: string;
  name: string;
  platforms: string[];
  scrapingType: string;
  targetQueries: string[];
  filters?: any;
  status: 'draft' | 'active' | 'completed' | 'failed';
  contactsFound: number;
  createdAt: string;
  lastRunAt?: string;
}

interface ScrapedContact {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  engagementRate: number;
  tags: string[];
  isVerified: boolean;
  isBusiness: boolean;
  createdAt: string;
}

const platforms: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    scrapingTypes: ['hashtag', 'followers', 'location', 'profile'],
    enabled: true
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-gradient-to-br from-red-500 to-pink-500',
    scrapingTypes: ['hashtag', 'trending', 'creators', 'profile'],
    enabled: true
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    scrapingTypes: ['keyword', 'trending', 'followers', 'profile'],
    enabled: true
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: 'bg-gradient-to-br from-blue-600 to-blue-800',
    scrapingTypes: ['pages', 'groups', 'business', 'profile'],
    enabled: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-gradient-to-br from-blue-700 to-blue-900',
    scrapingTypes: ['professionals', 'companies', 'jobtitle', 'profile'],
    enabled: true
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: 'bg-gradient-to-br from-red-600 to-red-800',
    scrapingTypes: ['channels', 'trending', 'subscribers', 'profile'],
    enabled: true
  }
];

const scrapingTypeLabels: Record<string, string> = {
  hashtag: 'Hashtag',
  followers: 'Followers',
  location: 'Location',
  profile: 'Profile',
  trending: 'Trending',
  creators: 'Creators',
  keyword: 'Keyword',
  pages: 'Pages',
  groups: 'Groups',
  business: 'Business',
  professionals: 'Professionals',
  companies: 'Companies',
  jobtitle: 'Job Title',
  channels: 'Channels',
  subscribers: 'Subscribers'
};

export function ContactScrapingDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedScrapingType, setSelectedScrapingType] = useState('');
  const [targetQueries, setTargetQueries] = useState<string[]>(['']);
  const [campaigns, setCampaigns] = useState<ScrapingCampaign[]>([]);
  const [contacts, setContacts] = useState<ScrapedContact[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [filters, setFilters] = useState({
    minFollowers: '',
    maxFollowers: '',
    mustBeBusiness: false,
    mustBeVerified: false,
    location: '',
    keywords: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load campaigns and contacts on mount
  useEffect(() => {
    loadCampaigns();
    loadContacts();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/scraping/campaigns');
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data.campaigns);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/scraping/contacts');
      const data = await response.json();
      if (data.success) {
        setContacts(data.data.contacts);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleAddQuery = () => {
    setTargetQueries([...targetQueries, '']);
  };

  const handleQueryChange = (index: number, value: string) => {
    const newQueries = [...targetQueries];
    newQueries[index] = value;
    setTargetQueries(newQueries);
  };

  const handleRemoveQuery = (index: number) => {
    setTargetQueries(targetQueries.filter((_, i) => i !== index));
  };

  const handleStartScraping = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: 'No platforms selected',
        description: 'Please select at least one platform to scrape.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedScrapingType) {
      toast({
        title: 'No scraping type selected',
        description: 'Please select a scraping type.',
        variant: 'destructive'
      });
      return;
    }

    const validQueries = targetQueries.filter(q => q.trim());
    if (validQueries.length === 0) {
      toast({
        title: 'No queries provided',
        description: 'Please provide at least one search query.',
        variant: 'destructive'
      });
      return;
    }

    setIsScraping(true);
    setScrapingProgress(0);

    try {
      const response = await fetch('/api/scraping/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatforms[0], // Process one platform at a time for now
          scrapingType: selectedScrapingType,
          queries: validQueries,
          options: {
            filters: {
              minFollowers: filters.minFollowers ? parseInt(filters.minFollowers) : undefined,
              maxFollowers: filters.maxFollowers ? parseInt(filters.maxFollowers) : undefined,
              mustBeBusiness: filters.mustBeBusiness,
              mustBeVerified: filters.mustBeVerified,
              location: filters.location ? filters.location.split(',').map(l => l.trim()) : undefined,
              keywords: filters.keywords ? filters.keywords.split(',').map(k => k.trim()) : undefined
            }
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Scraping completed!',
          description: `Found ${data.data.contactsFound} contacts and saved ${data.data.contactsSaved} new contacts.`,
          variant: 'default'
        });
        loadContacts();
        loadCampaigns();
      } else {
        toast({
          title: 'Scraping failed',
          description: data.error || 'An error occurred during scraping.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Scraping error',
        description: 'Failed to start scraping. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsScraping(false);
      setScrapingProgress(0);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (searchTerm && !contact.username.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !contact.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedTags.length > 0 && !selectedTags.some(tag => contact.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Scraping Dashboard</h1>
              <p className="text-gray-600">Scrape and manage contacts from multiple social media platforms</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">3 running now</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Contacts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.isVerified).length}</div>
              <p className="text-xs text-muted-foreground">{Math.round((contacts.filter(c => c.isVerified).length / contacts.length) * 100)}% of total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Business Accounts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.filter(c => c.isBusiness).length}</div>
              <p className="text-xs text-muted-foreground">{Math.round((contacts.filter(c => c.isBusiness).length / contacts.length) * 100)}% of total</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="scrape" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Scrape
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Scraping Campaigns</CardTitle>
                <CardDescription>Manage your contact scraping campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {campaign.platforms.join(', ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {campaign.contactsFound} contacts found
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Run
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {campaigns.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns yet. Create your first scraping campaign to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scrape Tab */}
          <TabsContent value="scrape" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Selection */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>Select Platforms</CardTitle>
                  <CardDescription>Choose which platforms to scrape contacts from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePlatformToggle(platform.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center text-white text-lg`}>
                              {platform.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold">{platform.name}</h3>
                              <p className="text-sm text-gray-500">
                                {platform.scrapingTypes.length} methods
                              </p>
                            </div>
                          </div>
                          {selectedPlatforms.includes(platform.id) && (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scraping Configuration */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>Scraping Configuration</CardTitle>
                  <CardDescription>Configure your scraping parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="scrapingType">Scraping Type</Label>
                    <Select value={selectedScrapingType} onValueChange={setSelectedScrapingType}>
                      <SelectTrigger id="scrapingType">
                        <SelectValue placeholder="Select scraping type" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPlatforms.length > 0 && platforms
                          .filter(p => selectedPlatforms.includes(p.id))
                          .flatMap(p => p.scrapingTypes)
                          .filter((type, index, array) => array.indexOf(type) === index)
                          .map(type => (
                            <SelectItem key={type} value={type}>
                              {scrapingTypeLabels[type] || type}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Queries</Label>
                    <div className="space-y-2">
                      {targetQueries.map((query, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={query}
                            onChange={(e) => handleQueryChange(index, e.target.value)}
                            placeholder={`Query ${index + 1}`}
                            className="flex-1"
                          />
                          {targetQueries.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveQuery(index)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddQuery}
                        className="w-full"
                      >
                        + Add Query
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartScraping}
                    disabled={isScraping}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  >
                    {isScraping ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Scraping... {scrapingProgress}%
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Scraping
                      </>
                    )}
                  </Button>

                  {isScraping && (
                    <Progress value={scrapingProgress} className="w-full" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </CardTitle>
                <CardDescription>Filter contacts by engagement and demographics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="minFollowers">Min Followers</Label>
                    <Input
                      id="minFollowers"
                      type="number"
                      placeholder="0"
                      value={filters.minFollowers}
                      onChange={(e) => setFilters({...filters, minFollowers: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxFollowers">Max Followers</Label>
                    <Input
                      id="maxFollowers"
                      type="number"
                      placeholder="∞"
                      value={filters.maxFollowers}
                      onChange={(e) => setFilters({...filters, maxFollowers: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="New York, London"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      placeholder="fitness, tech, business"
                      value={filters.keywords}
                      onChange={(e) => setFilters({...filters, keywords: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mustBeBusiness"
                      checked={filters.mustBeBusiness}
                      onChange={(e) => setFilters({...filters, mustBeBusiness: e.target.checked})}
                    />
                    <Label htmlFor="mustBeBusiness">Business accounts only</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mustBeVerified"
                      checked={filters.mustBeVerified}
                      onChange={(e) => setFilters({...filters, mustBeVerified: e.target.checked})}
                    />
                    <Label htmlFor="mustBeVerified">Verified accounts only</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scraped Contacts</CardTitle>
                    <CardDescription>Manage your scraped contacts</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Tag className="w-4 h-4 mr-2" />
                      Bulk Tag
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <img
                          src={contact.avatarUrl || `https://via.placeholder.com/50?text=${contact.username[0].toUpperCase()}`}
                          alt={contact.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{contact.displayName}</h4>
                          <p className="text-sm text-gray-500 truncate">@{contact.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {contact.followerCount.toLocaleString()} followers
                            </span>
                            {contact.isVerified && (
                              <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                            )}
                            {contact.isBusiness && (
                              <Badge variant="outline" className="text-xs">Business</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {contact.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{contact.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{contact.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredContacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No contacts found. Try adjusting your search or filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Scraping Analytics</CardTitle>
                <CardDescription>Track your scraping performance and contact quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600">
                      {Math.round(contacts.reduce((sum, c) => sum + c.engagementRate, 0) / contacts.length || 0)}%
                    </div>
                    <p className="text-sm text-gray-500">Avg Engagement Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">
                      {Math.round(contacts.reduce((sum, c) => sum + c.followerCount, 0) / contacts.length || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-500">Avg Follower Count</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {new Set(contacts.map(c => c.platform)).size}
                    </div>
                    <p className="text-sm text-gray-500">Platforms Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}