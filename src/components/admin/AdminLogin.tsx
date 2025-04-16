import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext'; // Use existing context
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { session, isPlatformAdmin } = useAuth(); // Get session and admin status
  const location = useLocation();

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null); // Clear previous errors

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Admin Login Error:", error.message);
      setErrorMsg(error.message);
    } else if (data.session?.user?.app_metadata?.claims_admin !== true) {
      // IMPORTANT: Check for admin claim *immediately* after login attempt
      // Even if login is successful, if they aren't an admin, deny access here.
      console.warn("Admin Login Denied: User is not a platform admin.");
      setErrorMsg("Access Denied: You do not have administrator privileges.");
      // Sign out the non-admin user who just logged in via the admin form
      await supabase.auth.signOut();
    } else {
      // Login successful AND user is an admin.
      // The AuthContext listener will handle the session update and redirect.
      console.log("Admin Login Successful for:", email);
    }

    setLoading(false);
  };

  // If already logged in as an admin, redirect to the admin dashboard
  if (session && isPlatformAdmin) {
    console.log("[AdminLogin] Already logged in as admin, redirecting to /admin");
    const from = location.state?.from?.pathname || "/admin";
    return <Navigate to={from} replace />;
  }

  // If logged in but NOT as an admin, redirect to user dashboard
  // This prevents a non-admin user from seeing the admin login page
  if (session && !isPlatformAdmin) {
     console.log("[AdminLogin] Logged in as non-admin, redirecting to /dashboard");
     return <Navigate to="/dashboard" replace />;
  }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Platform Admin Login</CardTitle>
          <CardDescription>Enter your administrator credentials.</CardDescription>
        </CardHeader>
        <form onSubmit={handleAdminLogin}>
          <CardContent className="grid gap-4">
            {errorMsg && (
              <div className="text-red-500 text-sm p-3 bg-red-100 dark:bg-red-900 border border-red-400 rounded">
                {errorMsg}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Sign In'}
            </Button>
          </CardFooter>
        </form>
         {/* Optional: Link back to regular login or landing page */}
         <div className="mt-4 text-center text-sm">
           <a href="/auth" className="underline">User Login</a>
           {' | '}
           <a href="/" className="underline">Back to Home</a>
         </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
