import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertCircle, Youtube, Play, StopCircle, MessageSquare, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveStream {
  id: string;
  title: string;
  liveChatId: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
}

interface YouTubeIntegrationProps {
  accountId: string;
  accessToken: string;
}

export function YouTubeIntegration({ accountId, accessToken }: YouTubeIntegrationProps) {
  const { toast } = useToast();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch active live streams
  const fetchLiveStreams = async () => {
    try {
      setIsLoading(true);
      // Mock data for preview - in production, this would call YouTube API
      const mockStreams: LiveStream[] = [
        {
          id: "stream123",
          title: "Live Q&A Session - Product Updates",
          liveChatId: "Cg0KC1pRZG41aXFDS3FV",
          isLive: true,
          viewerCount: 1247,
          startedAt: "2024-11-24T18:30:00Z"
        },
        {
          id: "stream456",
          title: "Weekly Tech Talk",
          liveChatId: "Cg0KC2FiY2RlZmdoaWpr",
          isLive: true,
          viewerCount: 892,
          startedAt: "2024-11-24T19:00:00Z"
        }
      ];
      
      setLiveStreams(mockStreams);
      
      if (mockStreams.length > 0 && !selectedStream) {
        setSelectedStream(mockStreams[0]);
      }
    } catch (error) {
      toast({
        title: "Error fetching streams",
        description: "Failed to fetch YouTube live streams",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStreams();
    // Refresh streams every 30 seconds
    const interval = setInterval(fetchLiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendLiveChatMessage = async () => {
    if (!selectedStream || !messageText.trim()) return;

    try {
      setIsConnecting(true);
      
      // Mock API call - in production, this would use YouTube Live Streaming API
      // POST https://www.googleapis.com/youtube/v3/liveChat/messages
      // Requires: part=snippet
      // Body: {
      //   snippet: {
      //     type: "textMessageEvent",
      //     liveChatId: selectedStream.liveChatId,
      //     textMessageDetails: {
      //       messageText: messageText
      //     }
      //   }
      // }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      toast({
        title: "Message sent!",
        description: `Your message has been sent to the live chat: "${selectedStream.title}"`
      });
      
      setMessageText("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Unable to send message to YouTube live chat",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStreamDuration = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Youtube className="h-5 w-5 text-red-600" />
            <CardTitle>YouTube Live Chat Integration</CardTitle>
          </div>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Live Chat Only
          </Badge>
        </div>
        <CardDescription>
          Send messages to YouTube live chat during active live streams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Streams List */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Live Stream</label>
          <div className="grid gap-2">
            {liveStreams.map((stream) => (
              <div
                key={stream.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedStream?.id === stream.id
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedStream(stream)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${stream.isLive ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
                    <div>
                      <p className="font-medium text-sm">{stream.title}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {stream.viewerCount.toLocaleString()} viewers
                        </span>
                        <span>{getStreamDuration(stream.startedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {stream.isLive && (
                    <Badge variant="destructive" className="text-xs">
                      LIVE
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Live Chat Message</label>
          <div className="space-y-3">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message for the live chat..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{messageText.length}/200 characters</span>
              <span>Messages are public to all viewers</span>
            </div>
            <Button
              onClick={sendLiveChatMessage}
              disabled={!selectedStream || !messageText.trim() || isConnecting}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send to Live Chat
                </>
              )}
            </Button>
          </div>
        </div>

        {/* YouTube API Limitations */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">YouTube Messaging Limitations</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Messages can only be sent during active live streams</li>
                <li>Messages are public to all viewers in the live chat</li>
                <li>Rate limiting applies to prevent spam</li>
                <li>No direct private messaging to user accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}