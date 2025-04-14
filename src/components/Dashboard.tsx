// Placeholder Dashboard component - Implement actual app features here
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Button } from './ui/button';
import AdminPanel from './admin/AdminPanel'; // Placeholder for Admin Panel
import TenantDashboard from './tenant/TenantDashboard'; // Placeholder for Tenant Dashboard

interface DashboardProps {
  session: Session;
}

interface UserProfile {
  id: string;
  // Add other profile fields like full_name, avatar_url etc.
}

interface TenantMembership {
    tenant_id: string;
    role: 'tenant_id_admin' | 'tenant_id_user';
    // Add other membership details if needed
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null); // State to manage the currently active tenant

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check for Platform Admin role
        const isAdmin = session.user.app_metadata?.claims_admin === true || session.user.user_metadata?.is_platform_admin === true; // Adjust based on how you set the admin claim/metadata
        setIsPlatformAdmin(isAdmin);

        // Fetch user profile (example - assumes a 'profiles' table)
        // let { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', session.user.id)
        //   .single();
        // if (profileError) throw profileError;
        // setProfile(profileData);
        setProfile({ id: session.user.id }); // Simplified for now

        // Fetch tenant memberships
        let { data: membershipData, error: membershipError } = await supabase
          .from('tenant_memberships')
          .select('tenant_id, role')
          .eq('user_id', session.user.id);

        if (membershipError) throw membershipError;
        setMemberships(membershipData || []);

        // Set default selected tenant (e.g., the first one)
        if (membershipData && membershipData.length > 0) {
            setSelectedTenantId(membershipData[0].tenant_id);
        }

      } catch (error: any) {
        console.error('Error fetching user data:', error.message);
        // Handle error appropriately (e.g., show error message)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Session state will update via onAuthStateChange, redirecting to Auth
  };

  // Function to switch active tenant (example)
  const switchTenant = (tenantId: string) => {
      setSelectedTenantId(tenantId);
      // Potentially refetch tenant-specific data here
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold">ProcuraScore</h1>
        <div className="flex items-center gap-4">
           {/* Tenant Switcher Dropdown - Implement this properly */}
           {memberships.length > 1 && !isPlatformAdmin && (
             <select
                value={selectedTenantId || ''}
                onChange={(e) => switchTenant(e.target.value)}
                className="p-2 border rounded bg-background text-foreground"
             >
                {memberships.map(mem => (
                    <option key={mem.tenant_id} value={mem.tenant_id}>
                        Tenant {mem.tenant_id.substring(0, 6)}... {/* Replace with actual tenant name */}
                    </option>
                ))}
             </select>
           )}
          <span>Welcome, {session.user.email}</span>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>

      {isPlatformAdmin ? (
        <AdminPanel user={session.user} />
      ) : selectedTenantId ? (
        // Pass the selected tenant ID and the user's role within that tenant
        <TenantDashboard
            user={session.user}
            tenantId={selectedTenantId}
            role={memberships.find(m => m.tenant_id === selectedTenantId)?.role || 'tenant_id_user'} // Provide a default or handle error if role not found
        />
      ) : (
         <div>
            <p>You are not part of any tenant yet.</p>
            {/* Add UI for creating a tenant or requesting access */}
         </div>
      )}
    </div>
  );
};

export default Dashboard;
