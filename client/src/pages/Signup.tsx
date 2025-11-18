import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-semibold">Ibiki SMS</span>
            </div>
          </Link>
        </div>

        <Card data-testid="card-signup">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Get started with Ibiki SMS API access</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Acme Inc"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  data-testid="input-company"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  data-testid="input-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  data-testid="input-confirm-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" data-testid="button-signup">
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login">
                <a className="text-primary hover:underline" data-testid="link-login">
                  Sign in
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
