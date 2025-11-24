import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Settings, 
  Filter, 
  Download, 
  Search,
  Users,
  Hash,
  MapPin,
  Building,
  Video,
  Music,
  TrendingUp,
  Calendar,
  Target,
  Globe,
  FileSpreadsheet
} from 'lucide-react';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Users, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', icon: Music, color: 'bg-gradient-to-r from-black to-gray-800' },
  { value: 'twitter', label: 'Twitter/X', icon: Hash, color: 'bg-gradient-to-r from-blue-400 to-blue-600' },
  { value: 'facebook', label: 'Facebook', icon: Globe, color: 'bg-gradient-to-r from-blue-600 to-blue-800' },
  { value: 'linkedin', label: 'LinkedIn', icon: Building, color: 'bg-gradient-to-r from-blue-500 to-blue-700' },
  { value: 'youtube', label: 'YouTube', icon: Video, color: 'bg-gradient-to-r from-red-500 to-red-700' }
];

const SCRAPING_TYPES = {
  instagram: [
    { value: 'hashtag', label: 'Hashtag Posts', icon: Hash, description: 'Users who posted with specific hashtags' },
    { value: 'followers', label: 'Account Followers', icon: Users, description: 'Followers of specific accounts' },
    { value: 'location', label: 'Location Posts', icon: MapPin, description: 'Users who posted from specific locations' },
    { value: 'competitor', label: 'Competitor Engagement', icon: Target, description: 'Users who engaged with competitor content' }
  ],
  tiktok: [
    { value: 'hashtag', label: 'Hashtag Videos', icon: Hash, description: 'Users who created videos with hashtags' },
    { value: 'trending', label: 'Trending Creators', icon: TrendingUp, description: 'Trending content creators' },
    { value: 'sound', label: 'Sound/Audio', icon: Music, description: 'Users who used specific sounds' }
  ],
  twitter: [
    { value: 'hashtag', label: 'Hashtag Tweets', icon: Hash, description: 'Users who tweeted with hashtags' },
    { value: 'keyword', label: 'Keyword Search', icon: Search, description: 'Users based on keywords in tweets' },
    { value: 'followers', label: 'Account Followers', icon: Users, description: 'Followers of specific accounts' }
  ],
  facebook: [
    { value: 'group', label: 'Group Members', icon: Users, description: 'Members of specific groups' },
    { value: 'page', label: 'Page Followers', icon: Globe, description: 'Followers of specific pages' },
    { value: 'event', label: 'Event Attendees', icon: Calendar, description: 'Attendees of specific events' }
  ],
  linkedin: [
    { value: 'company', label: 'Company Employees', icon: Building, description: 'Employees of specific companies' },
    { value: 'search', label: 'Search Results', icon: Search, description: 'Results from LinkedIn searches' },
    { value: 'group', label: 'Group Members', icon: Users, description: 'Members of professional groups' }
  ],
  youtube: [
    { value: 'channel', label: 'Channel Subscribers', icon: Users, description: 'Subscribers of specific channels' },
    { value: 'video', label: 'Video Commenters', icon: Video, description: 'Users who commented on videos' }
  ]
};

export default function ContactScrapingInterface() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scrapingType, setScrapingType] = useState('');
  const [queries, setQueries] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingResults, setScrapingResults] = useState(null);
  const [activeTab, setActiveTab] = useState('scrape');
  const [filters, setFilters] = useState({
    minFollowers: '',
    maxFollowers: '',
    mustBeBusiness: false,
    mustBeVerified: false,
    location: '',
    keywords: ''
  });

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
    setScrapingType(''); // Reset scraping type when platforms change
  };

  const handleScrape = async () => {
    if (selectedPlatforms.length === 0 || !scrapingType || !queries.trim()) {
      alert('Please select platforms, scraping type, and enter queries');
      return;
    }

    setIsScraping(true);
    setScrapingResults(null);

    try {
      const queryList = queries.split('\n').filter(q => q.trim());
      const scrapingOptions = {
        maxContacts: 100,
        filters: {
          minFollowers: filters.minFollowers ? parseInt(filters.minFollowers) : undefined,
          maxFollowers: filters.maxFollowers ? parseInt(filters.maxFollowers) : undefined,
          mustBeBusiness: filters.mustBeBusiness,
          mustBeVerified: filters.mustBeVerified,
          location: filters.location ? filters.location.split(',').map(l => l.trim()) : undefined,
          keywords: filters.keywords ? filters.keywords.split(',').map(k => k.trim()) : undefined
        }
      };

      const results = [];
      for (const platform of selectedPlatforms) {
        const response = await fetch('/api/scraping/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your-api-key' // This should come from your auth system
          },
          body: JSON.stringify({
            platform,
            scrapingType,
            queries: queryList,
            options: scrapingOptions
          })
        });

        const result = await response.json();
        results.push({ platform, ...result.data });
      }

      setScrapingResults(results);
    } catch (error) {
      console.error('Scraping error:', error);
      alert('Scraping failed. Please try again.');
    } finally {
      setIsScraping(false);
    }
  };

  const renderPlatformCard = (platform: any) => {
    const isSelected = selectedPlatforms.includes(platform.value);
    
    return (
      <div
        key={platform.value}
        onClick={() => handlePlatformToggle(platform.value)}
        className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 shadow-lg transform scale-105' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className={`absolute inset-0 ${platform.color} opacity-10`} />
        <div className="relative p-4">
          <div className="flex items-center space-x-3">
            <platform.icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            <div>
              <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                {platform.label}
              </h3>
              <p className="text-sm text-gray-500">Click to {isSelected ? 'deselect' : 'select'}</p>
            </div>
          </div>
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Scraping Hub</h1>
          <p className="text-gray-600">Discover and collect contacts from social media platforms with advanced targeting</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scrape">Scrape Contacts</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="scrape" className="space-y-6">
            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Social Media Platforms</CardTitle>
                <CardDescription>Choose which platforms to scrape contacts from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PLATFORMS.map(renderPlatformCard)}
                </div>
              </CardContent>
            </Card>

            {/* Scraping Configuration */}
            {selectedPlatforms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Scraping Configuration</CardTitle>
                  <CardDescription>Configure how you want to scrape contacts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scraping Type */}
                  <div className="space-y-2">
                    <Label>Scraping Method</Label>
                    <Select value={scrapingType} onValueChange={setScrapingType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scraping method" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPlatforms.map(platform => 
                          SCRAPING_TYPES[platform]?.map(type => (
                            <SelectItem key={`${platform}-${type.value}`} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                                <span className="text-xs text-gray-500">({platform})</span>
                              </div>
                            </SelectItem>
                          ))
                        ).flat()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Queries */}
                  <div className="space-y-2">
                    <Label>Search Queries (one per line)</Label>
                    <Textarea
                      value={queries}
                      onChange={(e) => setQueries(e.target.value)}
                      placeholder={`Enter your search queries here...\n\nExamples:\n#fitness #motivation\n@competitor_username\nNew York City\nDigital Marketing`}
                      className="min-h-[120px]"
                    />
                    <p className="text-sm text-gray-500">
                      Enter hashtags, usernames, locations, or keywords - one per line
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Filters */}
            {scrapingType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span>Advanced Filters</span>
                  </CardTitle>
                  <CardDescription>Refine your targeting with advanced filters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minFollowers">Minimum Followers</Label>
                      <Input
                        id="minFollowers"
                        type="number"
                        placeholder="1000"
                        value={filters.minFollowers}
                        onChange={(e) => setFilters(prev => ({ ...prev, minFollowers: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxFollowers">Maximum Followers</Label>
                      <Input
                        id="maxFollowers"
                        type="number"
                        placeholder="100000"
                        value={filters.maxFollowers}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxFollowers: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location Filter</Label>
                    <Input
                      id="location"
                      placeholder="New York, Los Angeles, London"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                    <p className="text-sm text-gray-500">Comma-separated list of locations</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Bio Keywords</Label>
                    <Input
                      id="keywords"
                      placeholder="fitness, entrepreneur, digital marketing"
                      value={filters.keywords}
                      onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
                    />
                    <p className="text-sm text-gray-500">Comma-separated list of keywords to include</p>
                  </div>

                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.mustBeBusiness}
                        onChange={(e) => setFilters(prev => ({ ...prev, mustBeBusiness: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Business accounts only</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.mustBeVerified}
                        onChange={(e) => setFilters(prev => ({ ...prev, mustBeVerified: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Verified accounts only</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scraping Action */}
            {scrapingType && queries.trim() && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ready to Scrape</h3>
                      <p className="text-sm text-gray-500">
                        Selected: {selectedPlatforms.length} platforms • Type: {scrapingType} • Queries: {queries.split('\n').filter(q => q.trim()).length}
                      </p>
                    </div>
                    <Button 
                      onClick={handleScrape}
                      disabled={isScraping}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isScraping ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Scraping...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Scraping
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            {scrapingResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Scraping Results</CardTitle>
                  <CardDescription>Summary of contacts found across platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scrapingResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {result.platform.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold capitalize">{result.platform}</h4>
                            <p className="text-sm text-gray-500">
                              {result.contactsFound} contacts found • {result.contactsSaved} saved
                            </p>
                          </div>
                        </div>
                        <Badge variant={result.errors?.length > 0 ? "destructive" : "success"}>
                          {result.errors?.length > 0 ? 'Partial Success' : 'Success'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Campaigns</CardTitle>
                <CardDescription>Manage your scraping campaigns and scheduled jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first scraping campaign to get started</p>
                  <Button>Create Campaign</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Analytics</CardTitle>
                <CardDescription>View insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-500">Start scraping to see analytics and insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Contact Export</span>
                </CardTitle>
                <CardDescription>Export your scraped contacts in various formats with advanced filtering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Export Interface</h3>
                  <p className="text-gray-500 mb-4">Export your contacts in CSV, JSON, Excel, or PDF formats with custom filtering and field selection</p>
                  <Button 
                    onClick={() => window.open('/contact-export', '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Open Export Interface
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}