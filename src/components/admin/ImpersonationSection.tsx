import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

const ImpersonationSection: React.FC = () => {
  const { session: adminSession } = useAuth();
  const [impersonateUserId, setImpersonateUserId] = useState('');
  const [impersonating, setImpersonating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleImpersonate = async () => {
    if (!impersonateUserId || !adminSession) return;
    setImpersonating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('admin-impersonate', {
        body: { targetUserId: impersonateUserId },
        headers: {
          Authorization: `Bearer ${adminSession.access_token}`
        }
      });

      if (functionError) throw functionError;

      if (data.error) { // Check for errors returned in the function's response body
        throw new Error(data.error);
      }

      if (data.session) {
        const { error: setError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        if (setError) throw setError;
        setSuccessMessage(`Successfully impersonating user ${impersonateUserId}. The application context has been updated. Refresh may be needed.`);
        setImpersonateUserId(''); // Clear input on success
      } else {
        throw new Error('Impersonation function did not return a session.');
      }

    } catch (err: any) {
      console.error('Impersonation failed:', err);
      setError(`Impersonation failed: ${err.message}`);
    } finally {
      setImpersonating(false);
    }
  };

  const handleStopImpersonating = async () => {
    setError(null);
    setSuccessMessage("Logging out to stop impersonating. Please log back in with your admin account.");
    // Add a small delay for the user to read the message
    setTimeout(async () => {
        await supabase.auth.signOut();
        // No need to clear messages here as the page will reload/redirect on logout
    }, 1500);
  };

  return (
    <div className="p-4 border rounded-lg bg-secondary/30 space-y-4">
      <h3 className="text-lg font-medium">User Impersonation (Feature 0.4)</h3>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default">
           <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Input
          type="text"
          placeholder="Enter User ID to impersonate"
          value={impersonateUserId}
          onChange={(e) => setImpersonateUserId(e.target.value)}
          className="max-w-xs"
          disabled={impersonating}
        />
        <div className="flex gap-2">
            <Button onClick={handleImpersonate} disabled={impersonating || !impersonateUserId}>
            {impersonating ? 'Processing...' : 'Impersonate User'}
            </Button>
            <Button onClick={handleStopImpersonating} variant="outline" disabled={impersonating}>
                Stop Impersonating (Logout)
            </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Impersonation changes the current session. Use 'Stop Impersonating' to log out and return to your admin account.
      </p>
    </div>
  );
};

export default ImpersonationSection;
