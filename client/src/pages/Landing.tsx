import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Activity, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import CodeBlock from "@/components/CodeBlock";

export default function Landing() {
  const features = [
    {
      icon: Shield,
      title: "Secure API Proxy",
      description: "Your API credentials stay hidden. We handle ExtremeSMS integration securely."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Easily manage multiple clients with individual API keys and usage tracking."
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track API usage, delivery status, and system health in real-time."
    }
  ];

  const sampleCode = `curl -X POST https://api.ibikisms.com/v2/sms/sendsingle \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"recipient": "+1234567890", "message": "Hello!"}'`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-semibold">Ibiki SMS</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login">Login</Button>
              </Link>
              <Link href="/signup">
                <Button data-testid="button-get-started">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            SMS API Middleware
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ibiki SMS provides a secure API passthrough service. Connect your applications
            seamlessly while we handle the complexity of SMS delivery.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" data-testid="button-hero-signup">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" data-testid="button-view-docs">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-3">Simple Integration</h2>
            <p className="text-muted-foreground">Get started with just a few lines of code</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <CodeBlock code={sampleCode} />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12 mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Ibiki SMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
