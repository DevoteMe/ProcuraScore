import React from 'react';
import AuthComponent from './Auth'; // Import the Auth component
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'; // Use Card for features
import { CheckCircle } from 'lucide-react'; // Icon for feature list

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-grow flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
              Welcome to ProcuraScore
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Streamline your tender evaluation process with powerful tools and collaborative features. Make informed decisions faster.
            </p>
            {/* Optional: Add a call-to-action button later */}
            {/* <Button size="lg" className="mt-4">Get Started Free</Button> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 animate-in fade-in duration-500">
            Why Choose ProcuraScore?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Overview */}
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-6 w-6" />
                  Streamlined Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Centralize tender documents, scoring criteria, and evaluator feedback for a clear, efficient process.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: Ease of Use */}
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-6 w-6" />
                  Intuitive Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Designed for ease of use, allowing your team to get started quickly with minimal training.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: Project Setup */}
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-6 w-6" />
                  Flexible Project Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage multiple tender projects simultaneously, each with its own criteria, documents, and team.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4: Collaboration */}
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary h-6 w-6" />
                  Seamless Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Invite evaluators, assign roles, and track progress collaboratively within a secure environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section id="auth" className="py-16 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6">
          <div className="max-w-md mx-auto animate-in fade-in duration-500">
             <h2 className="text-2xl font-semibold text-center mb-6">Login or Sign Up</h2>
            <AuthComponent />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ProcuraScore. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
