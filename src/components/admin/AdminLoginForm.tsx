import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { supabase } from '@/lib/supabaseClient'; // Assuming your Supabase client is here

const AdminLoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { checkAdminStatus } = useAuth(); // Need a way to re-check admin status after login

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                throw signInError;
            }

            // Critical Step: Verify if the logged-in user is actually an admin
            // Option 1: Check metadata immediately (might have stale data if just updated)
            // const isAdmin = data?.user?.app_metadata?.is_platform_admin === true;

            // Option 2: Rely on AuthContext to refresh and check (better)
            if (data.user) {
                 // Trigger a refresh/check in AuthContext
                 const isAdmin = await checkAdminStatus(data.user);

                if (isAdmin) {
                    navigate('/admin'); // Redirect to admin dashboard on success
                } else {
                    // Logged in successfully, but NOT an admin
                    await supabase.auth.signOut(); // Log them out immediately
                    setError('Login successful, but you do not have admin privileges.');
                }
            } else {
                 // Should not happen if signInError is not thrown, but handle defensively
                 throw new Error("Login successful but no user data received.");
            }

        } catch (err: any) {
            console.error("Admin login error:", err);
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    disabled={loading}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    disabled={loading}
                />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </Button>
        </form>
    );
};

export default AdminLoginForm; 