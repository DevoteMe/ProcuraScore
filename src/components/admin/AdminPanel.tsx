// Placeholder Admin Panel component - Updated to include sub-components
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '@/lib/supabaseClient';
import TenantList from './TenantList';
import UserManagement from './UserManagement';
import LicenseAdminView from './LicenseAdminView';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface AdminPanelProps {
  user: User; // Keep user prop for clarity, though context is available
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const { session: adminSession } = useAuth(); // Get the original admin session from context
  const [impersonateUserId, setImpersonateUserId] = useState('');
  const [impersonating, setImpersonating] = useState(false);
  // Removed originalSession state as we'll rely on context/logout

  const handleImpersonate = async () => {
    if (!impersonateUserId || !adminSession) return; // Need admin session to call function
    setImpersonating(true);
    try {
        // Call the Edge Function using the admin's token from context
        const { data, error } = await supabase.functions.invoke('admin-impersonate', {
            body: { targetUserId: impersonateUserId },
            headers: { // Pass the admin's Authorization header
                Authorization: `Bearer ${adminSession.access_token}`
            }
        });

        if (error) throw error;

        // Set the new session using the token from the Edge Function
        if (data.session) {
            // IMPORTANT: setSession might trigger onAuthStateChange which could refetch
            // data based on the *new* user. Ensure fetchUserData handles this correctly.
            const { error: setError } = await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token, // Use the new refresh token
            });
            if (setError) throw setError;
            alert(`Now impersonating user ${impersonateUserId}. The application context has been updated.`);
            // No reload needed if onAuthStateChange handles UI updates correctly.
        } else {
            // Handle case where function runs but doesn't return expected session
             if (data.error) { // Check if the function returned a specific error message
                throw new Error(data.error);
            } else {
                throw new Error('Impersonation function did not return a session.');
            }
        }

    } catch (error: any) {
        console.error('Impersonation failed:', error);
        alert(`Impersonation failed: ${error.message}`);
        // No need to restore session manually, logout/login is the recovery path
    } finally {
        setImpersonating(false);
    }
  };

  // Stop Impersonating: Simplest is to log out, forcing admin login again.
  const handleStopImpersonating = async () => {
     alert("To stop impersonating, you will be logged out. Please log back in with your admin account.");
     await supabase.auth.signOut();
  };


  return (
    <div className="p-4 border rounded-lg bg-secondary/30 space-y-6">
      <h2 className="text-xl font-semibold mb-4">Platform Admin Panel</h2>
      <p>Welcome, Admin {user.email}.</p>

      {/* Impersonation Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">User Impersonation</h3>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Enter User ID to impersonate"
            value={impersonateUserId}
            onChange={(e) => setImpersonateUserId(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleImpersonate} disabled={impersonating || !impersonateUserId}>
            {impersonating ? 'Processing...' : 'Impersonate User'}
          </Button>
           {/* Add stop button - relies on logout */}
           <Button onClick={handleStopImpersonating} variant="outline">Stop Impersonating (Logout)</Button>
        </div>
         <p className="text-xs text-muted-foreground mt-1">Impersonation changes the current session. Use 'Stop Impersonating' to log out and return to your admin account.</p>
      </div>

      {/* Other Admin sections */}
       <div className="border-t pt-4">
         <TenantList />
       </div>
        <div className="border-t pt-4">
         <UserManagement />
       </div>
        <div className="border-t pt-4">
         <LicenseAdminView />
       </div>

    </div>
  );
};

export default AdminPanel;
