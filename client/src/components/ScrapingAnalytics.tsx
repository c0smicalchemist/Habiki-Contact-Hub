import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  Award, 
  Globe, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';

interface ScrapingAnalytics {
  overview: {
    totalContacts: number;
    totalCampaigns: number;
    activeCampaigns: number;
    successRate: number;
    avgEngagementRate: number;
    totalScrapedThisMonth: number;
    totalScrapedThisWeek: number;
    totalScrapedToday: number;
  };
  platformStats: Array<{
    platform: string;
    totalContacts: number;
    validContacts: number;
    avgEngagementRate: number;
    successRate: number;
    growthRate: number;
    topCategories: string[];
  }>;
  campaignPerformance: Array<{
    campaignId: string;
    campaignName: string;
    platform: string;
    status: string;
    contactsScraped: number;
    successRate: number;
    avgEngagementRate: number;
    createdAt: string;
    completedAt?: string;
  }>;
  engagementDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    contacts: number;
    campaigns: number;
    engagement: number;
  }>;
  validationStats: {
    valid: number;
    invalid: number;
    pending: number;
    unknown: number;
  };
  contactQuality: {
    highQuality: number;
    mediumQuality: number;
    lowQuality: number;
    criteria: {
      highQuality: string[];
      mediumQuality: string[];
      lowQuality: string[];
    };
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: '#4267B2' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077B5' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' }
];

interface ScrapingAnalyticsProps {
  className?: string;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

export default function ScrapingAnalytics({ 
  className = "", 
  onRefresh,
  onExport 
}: ScrapingAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ScrapingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scraping/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    onRefresh?.();
    loadAnalytics();
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    onExport?.(format);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Scraping Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Loading...
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const { overview, platformStats, campaignPerformance, engagementDistribution, 
          geographicDistribution, categoryDistribution, timeSeriesData, 
          validationStats, contactQuality } = analytics;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Scraping Analytics & Reporting
            </CardTitle>
            <CardDescription>
              Comprehensive insights into your contact scraping performance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.totalContacts.toLocaleString()}</div>
                  <div className="text-xs text-green-600">
                    +{overview.totalScrapedThisMonth} this month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.successRate.toFixed(1)}%</div>
                  <Progress value={overview.successRate} className="h-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.avgEngagementRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Across all platforms</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.activeCampaigns}</div>
                  <div className="text-xs text-gray-600">of {overview.totalCampaigns} total</div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Scraping Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Scraping Activity</CardTitle>
                <CardDescription>Contacts scraped over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="contacts" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            {/* Platform Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformStats.map((platform) => (
                <Card key={platform.platform}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <span className="text-lg">
                        {PLATFORMS.find(p => p.id === platform.platform)?.icon}
                      </span>
                      {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Contacts:</span>
                      <span className="font-medium">{platform.totalContacts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valid:</span>
                      <span className="font-medium">{platform.validContacts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate:</span>
                      <span className="font-medium">{platform.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Engagement:</span>
                      <span className="font-medium">{platform.avgEngagementRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Growth:</span>
                      <span className={`font-medium ${platform.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {platform.growthRate >= 0 ? '+' : ''}{platform.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-gray-600 mb-1">Top Categories:</div>
                      <div className="flex flex-wrap gap-1">
                        {platform.topCategories.slice(0, 3).map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Platform Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
                <CardDescription>Performance metrics across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalContacts" fill="#8884d8" name="Total Contacts" />
                    <Bar dataKey="validContacts" fill="#82ca9d" name="Valid Contacts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaign Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Detailed performance of your scraping campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.map((campaign) => (
                    <div key={campaign.campaignId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{campaign.campaignName}</h4>
                          <p className="text-sm text-gray-600">
                            {campaign.platform} • Created {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={campaign.status === 'completed' ? 'success' : 
                                  campaign.status === 'running' ? 'default' : 'secondary'}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Contacts Scraped</div>
                          <div className="font-medium">{campaign.contactsScraped.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                          <div className="font-medium">{campaign.successRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Avg Engagement</div>
                          <div className="font-medium">{campaign.avgEngagementRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-medium">
                            {campaign.completedAt 
                              ? `${Math.round((new Date(campaign.completedAt).getTime() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days`
                              : 'In Progress'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            {/* Contact Quality Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Quality Distribution</CardTitle>
                  <CardDescription>Quality breakdown of scraped contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High Quality', value: contactQuality.highQuality },
                          { name: 'Medium Quality', value: contactQuality.mediumQuality },
                          { name: 'Low Quality', value: contactQuality.lowQuality }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { fill: '#22c55e' },
                          { fill: '#f59e0b' },
                          { fill: '#ef4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        High Quality
                      </span>
                      <span className="font-medium">{contactQuality.highQuality.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        Medium Quality
                      </span>
                      <span className="font-medium">{contactQuality.mediumQuality.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        Low Quality
                      </span>
                      <span className="font-medium">{contactQuality.lowQuality.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Validation Status</CardTitle>
                  <CardDescription>Contact validation breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Valid', value: validationStats.valid },
                      { name: 'Invalid', value: validationStats.invalid },
                      { name: 'Pending', value: validationStats.pending },
                      { name: 'Unknown', value: validationStats.unknown }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                      <span>Valid Contacts:</span>
                      <span className="font-medium text-green-600">{validationStats.valid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Invalid Contacts:</span>
                      <span className="font-medium text-red-600">{validationStats.invalid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Validation:</span>
                      <span className="font-medium text-yellow-600">{validationStats.pending.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quality Criteria */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Assessment Criteria</CardTitle>
                <CardDescription>How contact quality is determined</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">High Quality</h4>
                    <ul className="text-sm space-y-1">
                      {contactQuality.criteria.highQuality.map((criterion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Medium Quality</h4>
                    <ul className="text-sm space-y-1">
                      {contactQuality.criteria.mediumQuality.map((criterion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Low Quality</h4>
                    <ul className="text-sm space-y-1">
                      {contactQuality.criteria.lowQuality.map((criterion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Engagement Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate Distribution</CardTitle>
                <CardDescription>How engagement rates are distributed across contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Contacts by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={geographicDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                      >
                        {geographicDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Contacts by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryDistribution.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{category.count.toLocaleString()}</span>
                          <span className="text-xs text-gray-600">({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}