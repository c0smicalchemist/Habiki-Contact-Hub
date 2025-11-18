import { MessageSquare, DollarSign, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import ApiKeyDisplay from "@/components/ApiKeyDisplay";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function ClientDashboard() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/client/profile']
  });

  const { data: messages } = useQuery({
    queryKey: ['/api/client/messages']
  });

  const credits = profile?.credits || "0.00";
  const messageCount = messages?.messages?.length || 0;
  const firstApiKey = profile?.apiKeys?.[0];

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor your SMS API usage and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Messages Sent"
          value={messageCount.toLocaleString()}
          icon={MessageSquare}
          description="All time"
        />
        <StatCard
          title="Available Credits"
          value={`$${parseFloat(credits).toFixed(2)}`}
          icon={DollarSign}
          description={`Current balance • ${profile?.currency || 'USD'}`}
        />
        <StatCard
          title="API Status"
          value="Online"
          icon={Activity}
          description="All systems operational"
        />
      </div>

      {firstApiKey && (
        <ApiKeyDisplay 
          apiKey={`${firstApiKey.displayKey.split('...')[0]}${'•'.repeat(32)}${firstApiKey.displayKey.split('...')[1]}`}
          title="Your API Credentials"
          description="Use this key to authenticate all API requests to Ibiki SMS"
        />
      )}

      <div className="flex gap-3">
        <Link href="/docs">
          <Button data-testid="button-view-docs">View API Documentation</Button>
        </Link>
        <Button variant="outline" data-testid="button-usage-details">View Usage Details</Button>
      </div>
    </div>
  );
}
