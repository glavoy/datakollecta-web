import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Portal login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Field app login state
  const [projectCode, setProjectCode] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");

  // Sign up state
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        // Navigate to dashboard - component will unmount so no need to reset loading
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccessMessage("Account created! Please check your email to verify your account.");
      setIsSignUp(false);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage("Password reset email sent! Check your inbox.");
    }
    setIsLoading(false);
  };

  const handleAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // TODO: Implement app credential authentication
    // This will authenticate against the app_credentials table
    setError("Field app login is for mobile app users. Use Portal login for web access.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/logo.png" alt="DataKollecta" className="h-56 w-auto mx-auto" />
          </Link>
          <p className="text-muted-foreground text-lg">Sign in to manage your data collection projects</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-4 border-green-500 text-green-700">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="portal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="portal">Web Portal</TabsTrigger>
            <TabsTrigger value="app">Field App</TabsTrigger>
          </TabsList>

          <TabsContent value="portal">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{isSignUp ? "Create Account" : "Portal Login"}</CardTitle>
                <CardDescription>
                  {isSignUp
                    ? "Create a new administrator account"
                    : "For administrators, editors, and analysts"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={isSignUp ? handleSignUp : handlePortalLogin} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-secondary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? (isSignUp ? "Creating account..." : "Signing in...")
                      : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {isSignUp ? (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => { setIsSignUp(false); setError(null); }}
                        className="text-secondary hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => { setIsSignUp(true); setError(null); }}
                        className="text-secondary hover:underline"
                      >
                        Create Account
                      </button>
                    </>
                  )}
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
                <form onSubmit={handleAppLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-code">Project Code</Label>
                    <Input
                      id="project-code"
                      placeholder="e.g., clinical-alpha"
                      value={projectCode}
                      onChange={(e) => setProjectCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Your team username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-password">Password</Label>
                    <Input
                      id="app-password"
                      type="password"
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login to App"}
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
