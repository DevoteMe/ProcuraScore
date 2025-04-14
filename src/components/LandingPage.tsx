import React from 'react';
import AuthComponent from './Auth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button'; // Import Button for potential future use

const LandingPage: React.FC = () => {
  console.log("Rendering LandingPage component with Auth in header...");

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
             {/* Can add navigation links here later if needed */}
             {/* <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Features</a> */}
             {/* Simple Auth Trigger - Adjust styling as needed */}
             {/* We'll place the full Auth component below the hero for now,
                 but you could trigger a modal or navigate to a dedicated auth page from here */}
             <a href="#auth">
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
              {/* Optional: Add a Call to Action Button linking to Auth section */}
              <Button size="lg" asChild>
                <a href="#auth">Get Started</a>
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
              {/* Feature 1 */}
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
              {/* Feature 2 */}
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
              {/* Feature 3 */}
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
              {/* Feature 4 */}
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
              {/* Feature 5 */}
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
              {/* Feature 6 */}
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

        {/* Authentication Section - Kept lower on the page for now */}
        <section id="auth" className="py-16 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="max-w-md mx-auto">
               <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">Login or Sign Up</h2>
              <AuthComponent />
            </div>
          </div>
        </section>
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
