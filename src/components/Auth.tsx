// Placeholder Auth component - Bypassing actual auth for development
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevLogin = async () => {
    setLoading(true);
    setError(null);
    console.log("Attempting development login as demouser1...");

    try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'demouser1@procurascore.com',
            password: 'DemoUser123!',
        });

        if (signInError) {
            throw signInError;
        }

        if (data.session) {
            console.log("Dev login successful for demouser1. Navigating to dashboard...");
            navigate('/dashboard');
        } else {
            throw new Error("Login succeeded but no session data received.")
        }

    } catch (err: any) {
        console.error("Development login error:", err);
        setError(err.message || 'Development login failed.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
       <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">User Login/Signup (Dev Mode)</CardTitle>
          <CardDescription>Click below to log in as the demo user.</CardDescription>
           {error && (
                <Alert variant="destructive" className="mt-4 text-left">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Login Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <Button onClick={handleDevLogin} className="w-full" disabled={loading}>
             {loading ? 'Logging in as Demo User...' : 'Login as Demo User'}
           </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
