import React from 'react';
// Removed AuthComponent import as it's no longer directly used here
// import AuthComponent from './Auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';

const LandingPage: React.FC = () => {
  console.log("Rendering LandingPage component with Pricing section...");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <a href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> Replace with your logo if you have one */}
            <span className="font-bold inline-block">ProcuraScore</span>
          </a>
          <nav className="flex items-center gap-4">
             {/* The href="#auth" currently points nowhere, but keeps the button.
                 We can update this later to trigger a modal or go to a login page. */}
             <a href="#auth"> {/* Consider changing this href later */}
                <Button variant="outline" size="sm">Login / Sign Up</Button>
             </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
                Welcome to ProcuraScore
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Streamline your tender evaluation process with powerful tools and insights.
              </p>
              {/* Optional: Link this button to the pricing section */}
              <Button size="lg" asChild>
                <a href="#pricing">Get Started</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Why Choose ProcuraScore?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards remain the same */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-6 w-6" />
                    Efficient Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Standardize scoring criteria and automate calculations for faster, consistent evaluations.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-6 w-6" />
                    Collaborative Workspace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Enable team members to review and score proposals within a shared, secure environment.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-6 w-6" />
                    Data-Driven Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize scoring trends and bidder performance to make informed award decisions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-6 w-6" />
                    Secure & Multi-Tenant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your data is isolated and protected within your dedicated tenant space using robust security measures.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-6 w-6" />
                    Role-Based Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Control user permissions effectively with distinct roles for administrators and evaluators.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="text-primary h-6 w-6" />
                    Audit Trails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Maintain transparency and accountability with logs of key actions and scoring changes (Future Feature).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Choose the plan that fits your organization's needs. Get started for free or unlock advanced features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>For individuals or small teams getting started.</CardDescription>
                  <p className="text-4xl font-bold pt-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> 1 Project</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Up to 3 Users</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Basic Scoring</p>
                  <p className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /> Limited Collaboration</p>
                  <p className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /> Basic Support</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>Coming Soon</Button> {/* Replace with actual sign-up link/action */}
                </CardFooter>
              </Card>

              {/* Pro Tier (Example) */}
              <Card className="flex flex-col border-primary ring-2 ring-primary shadow-lg">
                 <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For growing teams needing more power and collaboration.</CardDescription>
                   <p className="text-4xl font-bold pt-4">$49<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Up to 10 Projects</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Up to 20 Users</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Advanced Scoring & Weighting</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Enhanced Collaboration Tools</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Priority Support</p>
                </CardContent>
                <CardFooter>
                   <Button className="w-full" disabled>Coming Soon</Button> {/* Replace with actual sign-up link/action */}
                </CardFooter>
              </Card>

              {/* Enterprise Tier (Example) */}
              <Card className="flex flex-col">
                 <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large organizations with custom needs.</CardDescription>
                   <p className="text-4xl font-bold pt-4">Custom</p>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Unlimited Projects</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Unlimited Users</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Custom Integrations</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Single Sign-On (SSO)</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Dedicated Account Manager</p>
                </CardContent>
                <CardFooter>
                   <Button variant="outline" className="w-full" disabled>Contact Sales</Button> {/* Replace with actual contact link/action */}
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* REMOVED Authentication Section */}
        {/*
        <section id="auth" className="py-16 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="max-w-md mx-auto">
               <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">Login or Sign Up</h2>
              <AuthComponent />
            </div>
          </div>
        </section>
        */}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-background">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ProcuraScore. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
