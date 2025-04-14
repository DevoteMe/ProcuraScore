import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion'; // Import motion from framer-motion

// Define pricing plans data
const pricingPlans = [
  {
    title: 'Free',
    description: 'For individuals or small teams getting started.',
    price: '$0',
    priceDetails: '/month',
    features: [
      '1 Project',
      'Up to 3 Users',
      'Basic Scoring',
      { name: 'Limited Collaboration', negative: true },
      { name: 'Basic Support', negative: true },
    ],
    ctaText: 'Coming Soon',
    ctaDisabled: true,
  },
  {
    title: 'Pro',
    description: 'For growing teams needing more power and collaboration.',
    price: '$49',
    priceDetails: '/month',
    features: [
      'Up to 10 Projects',
      'Up to 20 Users',
      'Advanced Scoring & Weighting',
      'Enhanced Collaboration Tools',
      'Priority Support',
    ],
    ctaText: 'Coming Soon',
    ctaDisabled: true,
    highlighted: true, // Example of a highlighted plan
  },
  {
    title: 'Enterprise',
    description: 'For large organizations with custom needs.',
    price: 'Custom',
    priceDetails: '',
    features: [
      'Unlimited Projects',
      'Unlimited Users',
      'Custom Integrations',
      'Single Sign-On (SSO)',
      'Dedicated Account Manager',
    ],
    ctaText: 'Contact Sales',
    ctaDisabled: true,
  },
];


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
             {/* Use Link component to navigate to the /auth route */}
             <Link to="/auth">
                <Button variant="outline" size="sm">Login / Sign Up</Button>
             </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32 animate-in fade-in">
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
        <section id="features" className="py-16 md:py-24 bg-background animate-in fade-in">
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
        <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-muted/40 animate-in fade-in">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Choose the plan that fits your organization's needs. Get started for free or unlock advanced features.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={cn("flex flex-col", plan.highlighted && "border-primary ring-2 ring-primary shadow-lg")}>
                  <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <p className="text-4xl font-bold pt-4">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.priceDetails}</span></p>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <p key={featureIndex} className="flex items-center gap-2">
                        {typeof feature === 'string' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : feature.negative ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span>{typeof feature === 'string' ? feature : feature.name}</span>
                      </p>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" disabled={plan.ctaDisabled}>{plan.ctaText}</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* REMOVED Authentication Section */}
        {/* ... */}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-background animate-in fade-in">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ProcuraScore. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
