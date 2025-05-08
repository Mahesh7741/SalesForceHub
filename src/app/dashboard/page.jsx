"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Cloud, LogOut, CheckCircle2, AlertCircle, User, Building, Key, Mail, ChevronLeft, Home } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import { useSalesforce } from "../../context/salesforcecontet";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const { 
    isConnected, 
    isLoading, 
    sfUserInfo, 
    credentials, 
    connectToSalesforce,
    disconnectFromSalesforce,
    setCredentials
  } = useSalesforce();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await connectToSalesforce(credentials);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        setFormError(error.message || 'Connection failed');
      } else {
        setFormError('Connection failed');
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">Dashboard</CardTitle>
                <CardDescription className="text-md">Welcome back to your personal workspace</CardDescription>
              </div>
              
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 w-full md:w-auto">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20 shadow-md">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">{session.user?.name || "User"}</h2>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{session.user?.email || ""}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto mt-4 md:mt-0">
                {!isConnected ? (
                  <Button 
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white gap-2 font-medium"
                    size="lg"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Cloud className="h-5 w-5" />
                    Connect to Salesforce
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full md:w-auto gap-2 border-primary/30 hover:bg-primary/10"
                    onClick={disconnectFromSalesforce}
                  >
                    <LogOut className="h-5 w-5" />
                    Disconnect Salesforce
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isConnected ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle>Salesforce Organization</CardTitle>
                </div>
                <CardDescription>Connected organization details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">Organization Name</Label>
                        <div className="font-semibold">{sfUserInfo?.org_name || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">Organization ID</Label>
                        <div className="font-medium text-sm font-mono">{sfUserInfo?.organization_id || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <Cloud className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">Instance URL</Label>
                        <div className="font-medium text-sm">{sfUserInfo?.instance_url || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h10" /></svg>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-1">API Version</Label>
                        <div className="font-medium">v58.0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Account Information</CardTitle>
                </div>
                <CardDescription>Connected user details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">Name</Label>
                      <div className="font-semibold">{sfUserInfo?.display_name || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">Username</Label>
                      <div className="font-medium">{sfUserInfo?.username || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">Email</Label>
                      <div className="font-medium">{sfUserInfo?.email || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground block mb-1">User ID</Label>
                      <div className="font-medium text-sm font-mono">{sfUserInfo?.user_id || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="text-center pb-0">
              <CardTitle className="text-2xl">Welcome to your Dashboard</CardTitle>
              <CardDescription className="text-md">
                Connect your Salesforce account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="bg-primary/10 p-6 rounded-full mb-6">
                  <Cloud className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">No Salesforce Connection</h3>
                <p className="text-center text-muted-foreground max-w-md mb-8">
                  Connect your Salesforce account to view and manage your organization data securely from this dashboard
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  size="lg"
                  className="gap-2 px-8"
                >
                  <Cloud className="h-5 w-5" />
                  Connect to Salesforce
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Connect to Salesforce Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Cloud className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Connect to Salesforce</DialogTitle>
            <DialogDescription className="text-center">
              Enter your credentials to securely connect your account
            </DialogDescription>
          </DialogHeader>
          
          {formError && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{formError}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleConnect} className="space-y-5 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="username"
                    name="username"
                    className="pl-9"
                    placeholder="your.email@example.com" 
                    value={credentials.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">Password</Label>
                <div className="relative">
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    className="pl-9"
                    placeholder="Enter your password" 
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="securityToken" className="font-medium">Security Token</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="securityToken"
                    name="securityToken"
                    className="pl-9"
                    placeholder="Your security token" 
                    value={credentials.securityToken}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  You can reset your security token in Salesforce: Settings → My Personal Information → Reset Security Token
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col gap-2 sm:flex-col">
              <Button 
                type="button"
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Salesforce'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}