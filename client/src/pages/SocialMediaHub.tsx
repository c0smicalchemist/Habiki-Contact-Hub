import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YouTubeIntegration } from "@/components/YouTubeIntegration";
import { 
  BarChart3, 
  Send, 
  Users, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Music,
  Youtube,
  AlertCircle
} from "lucide-react";

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Music,
  youtube: Youtube
};

const platformColors = {
  facebook: "bg-blue-600 hover:bg-blue-700",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
  twitter: "bg-sky-500 hover:bg-sky-600",
  linkedin: "bg-blue-700 hover:bg-blue-800",
  tiktok: "bg-black hover:bg-gray-800",
  youtube: "bg-red-600 hover:bg-red-700"
};

interface Campaign {
  id: string;
  name: string;
  message: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  totalRecipients: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  scheduledFor?: string;
  createdAt: string;
}

interface PlatformStats {
  platform: string;
  connected: boolean;
  totalMessages: number;
  successRate: number;
  lastUsed?: string;
}

export default function SocialMediaHub() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [campaignName, setCampaignName] = useState("");

  useEffect(() => {
    // Mock data for preview
    setCampaigns([
      {
        id: "1",
        name: "Holiday Promotion Campaign",
        message: "🎄 Special holiday offers are here! Get 25% off on all products. Limited time only! #HolidaySale",
        platforms: ["facebook", "instagram", "twitter"],
        status: "sent",
        totalRecipients: 1250,
        successfulDeliveries: 1187,
        failedDeliveries: 63,
        createdAt: "2024-11-20T10:30:00Z"
      },
      {
        id: "2",
        name: "Product Launch Announcement",
        message: "🚀 Exciting news! Our new product line is now available. Be the first to experience innovation at its finest!",
        platforms: ["linkedin", "twitter"],
        status: "scheduled",
        totalRecipients: 850,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        scheduledFor: "2024-11-25T14:00:00Z",
        createdAt: "2024-11-22T09:15:00Z"
      },
      {
        id: "3",
        name: "Live Stream Chat Engagement",
        message: "🔴 We're going live! Join our interactive Q&A session and get your questions answered in real-time!",
        platforms: ["youtube"],
        status: "sending",
        totalRecipients: 450,
        successfulDeliveries: 387,
        failedDeliveries: 63,
        createdAt: "2024-11-23T20:00:00Z"
      }
    ]);

    setPlatformStats([
      { platform: "facebook", connected: true, totalMessages: 2840, successRate: 94.2, lastUsed: "2024-11-23T15:20:00Z" },
      { platform: "instagram", connected: true, totalMessages: 1920, successRate: 91.8, lastUsed: "2024-11-23T14:45:00Z" },
      { platform: "twitter", connected: true, totalMessages: 1650, successRate: 89.5, lastUsed: "2024-11-23T16:10:00Z" },
      { platform: "linkedin", connected: false, totalMessages: 0, successRate: 0 },
      { platform: "tiktok", connected: false, totalMessages: 0, successRate: 0 },
      { platform: "youtube", connected: true, totalMessages: 890, successRate: 87.3, lastUsed: "2024-11-23T18:30:00Z" }
    ]);
  }, []);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800",
      scheduled: "bg-blue-100 text-blue-800",
      sending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      paused: "bg-orange-100 text-orange-800",
      failed: "bg-red-100 text-red-800"
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Hub</h1>
          <p className="text-gray-600">Send bulk messages across multiple platforms</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Send className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Platform Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {platformStats.map((stat) => {
          const Icon = platformIcons[stat.platform as keyof typeof platformIcons];
          return (
            <Card key={stat.platform} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${platformColors[stat.platform as keyof typeof platformColors]} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant={stat.connected ? "default" : "secondary"}>
                  {stat.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <h3 className="font-semibold capitalize mb-2">{stat.platform}</h3>
              {stat.connected ? (
                <div className="space-y-1 text-sm text-gray-600">
                  <div>{stat.totalMessages.toLocaleString()} messages</div>
                  <div>{stat.successRate}% success rate</div>
                  {stat.lastUsed && (
                    <div className="text-xs text-gray-500">
                      Last used: {new Date(stat.lastUsed).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full mt-2">
                  Connect Account
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose Message</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Platforms</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {Object.keys(platformColors).map((platform) => {
                    const Icon = platformIcons[platform as keyof typeof platformIcons];
                    return (
                      <Button
                        key={platform}
                        variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                        className={`flex items-center space-x-2 ${selectedPlatforms.includes(platform) ? platformColors[platform as keyof typeof platformColors] : ""}`}
                        onClick={() => togglePlatform(platform)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{platform}</span>
                      </Button>
                    );
                  })}
                </div>
                {selectedPlatforms.includes("youtube") && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">YouTube Messaging Limitations:</p>
                        <p>YouTube messages are sent to <strong>live chat during active live streams</strong>, not direct user messages. Ensure your channel is live streaming for message delivery.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {message.length} characters
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline">Upload Recipients (CSV)</Button>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  Schedule Campaign
                </Button>
              </div>

              {/* YouTube Live Chat Integration */}
              {selectedPlatforms.includes("youtube") && (
                <div className="mt-6">
                  <YouTubeIntegration 
                    accountId="mock-youtube-account"
                    accessToken="mock-access-token"
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(campaign.status)}
                      {campaign.scheduledFor && (
                        <Badge variant="outline">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(campaign.scheduledFor).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {campaign.platforms.map((platform) => {
                      const Icon = platformIcons[platform as keyof typeof platformIcons];
                      return (
                        <div key={platform} className={`p-2 rounded ${platformColors[platform as keyof typeof platformColors]} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{campaign.message}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{campaign.totalRecipients}</div>
                    <div className="text-sm text-gray-600">Total Recipients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{campaign.successfulDeliveries}</div>
                    <div className="text-sm text-gray-600">Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{campaign.failedDeliveries}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>

                {campaign.status !== 'draft' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{campaign.totalRecipients > 0 ? ((campaign.successfulDeliveries / campaign.totalRecipients) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <Progress value={campaign.totalRecipients > 0 ? (campaign.successfulDeliveries / campaign.totalRecipients) * 100 : 0} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold">6,410</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                +12.5% from last month
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">91.7%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                +2.1% from last month
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Send className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                +8 this week
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold">15.2K</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="mr-1 h-4 w-4" />
                +18.3% from last month
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}