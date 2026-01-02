import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Database className="h-10 w-10 text-secondary" />
            <span className="text-2xl font-bold text-foreground">DataKollecta</span>
          </Link>
          <p className="text-muted-foreground">Sign in to manage your data collection projects</p>
        </div>

        <Tabs defaultValue="portal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="portal">Web Portal</TabsTrigger>
            <TabsTrigger value="app">Field App</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portal">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Portal Login</CardTitle>
                <CardDescription>
                  For administrators, editors, and analysts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-sm text-secondary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a href="#" className="text-secondary hover:underline">
                    Request Access
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="app">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Field App Login</CardTitle>
                <CardDescription>
                  For data collectors using the mobile app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-code">Project Code</Label>
                    <Input 
                      id="project-code" 
                      placeholder="e.g., clinical-alpha"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="Your team username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-password">Password</Label>
                    <Input 
                      id="app-password" 
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login to App
                  </Button>
                </form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Contact your project administrator if you need credentials.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
