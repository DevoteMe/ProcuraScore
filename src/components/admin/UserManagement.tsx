import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from '@supabase/supabase-js'; // Use Supabase User type

// Extend User type or create a new one if you need more fields like tenant_id, roles etc.
// interface ManagedUser extends User {
//   tenant_id?: string; // Example: if you join with a tenant table
//   roles?: string[]; // Example: if roles are stored in metadata
//   status?: 'active' | 'disabled'; // Example: if you add a status concept
// }

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]); // Use Supabase User type initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Implement Invite/Role Assignment/Disable functionality
  // const [showInviteModal, setShowInviteModal] = useState(false);
  // const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // IMPORTANT: Fetching all users requires admin privileges.
        // This typically needs an Edge Function calling supabase.auth.admin.listUsers()
        // For now, this direct client-side call WILL LIKELY FAIL without specific setup.
        // We'll proceed assuming it might work in some contexts or use placeholder data.
        // const { data: { users: fetchedUsers }, error: fetchError } = await supabase.auth.admin.listUsers(); // This needs admin API access

        // Placeholder/Alternative: Fetch from a 'profiles' table if available and RLS allows admin access
         const { data, error: fetchError } = await supabase
           .from('profiles') // Assuming a 'profiles' table linked to auth.users
           .select(`
             id,
             email,
             full_name,
             created_at,
             tenant_id,
             status,
             raw_user_meta_data->>'roles' as roles
           `) // Adjust select based on your profiles table structure
           .order('email', { ascending: true });


        if (fetchError) throw fetchError;
        // Map data to User-like structure if needed, or adjust state type
        setUsers(data || []);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(`Failed to fetch users: ${err.message}. This likely requires an Edge Function with admin privileges or a properly configured 'profiles' table viewable by admins.`);
        setUsers([]); // Clear users on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) // Optional chaining for email
    // Add search for name, tenant_id etc. if available in your user data structure
    // || user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteUser = () => {
    // TODO: Implement user invitation logic (modal + Edge Function using supabase.auth.admin.inviteUserByEmail)
    alert('User invitation functionality not yet implemented.');
    // setShowInviteModal(true);
  };

  const handleEditUserRoles = (user: User) => {
     // TODO: Implement role editing (modal + Edge Function to update user metadata or roles table)
     alert(`Editing roles for user ${user.email} functionality not yet implemented.`);
     // setEditingUser(user); // Pass user to a modal
  };

  const handleToggleUserStatus = async (user: User) => {
     // TODO: Implement user status toggle (Disable/Enable) - Requires admin API access (e.g., updateUserById) and potentially a 'status' field
     alert(`Toggling status for user ${user.email} functionality not yet implemented. Requires admin API access.`);
     // Example (conceptual - needs admin API via Edge Function):
     // const newStatus = user.status === 'active' ? 'disabled' : 'active'; // Assuming a status field
     // const { error } = await supabase.functions.invoke('admin-manage-user-status', {
     //   body: { userId: user.id, status: newStatus } // Or use ban_duration for disabling
     // });
     // if (error) alert(`Error: ${error.message}`);
     // else // refetch users
  };


  return (
    <div className="p-4 border rounded-lg bg-secondary/30 space-y-4">
      <h3 className="text-lg font-medium">User Management (All Tenants) (Feature 0.2)</h3>
       {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Input
          type="text"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleInviteUser}>Invite New User</Button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</th>
                {/* Add columns for Tenant, Roles, Status if available */}
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant ID</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Roles</th>
                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-700">
              {filteredUsers.length > 0 ? filteredUsers.map((user: any) => ( // Use 'any' temporarily if structure varies
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{user.email ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.id}</td>
                  {/* Display Tenant, Roles, Status if available */}
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.tenant_id ?? 'N/A'}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{JSON.stringify(user.roles) ?? 'N/A'}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                       {user.status || 'N/A'} {/* Display status or N/A */}
                     </span>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                     <Button variant="outline" size="sm" onClick={() => handleEditUserRoles(user)}>Edit Roles</Button>
                     <Button
                       variant={user.status === 'active' ? 'destructive' : 'default'}
                       size="sm"
                       onClick={() => handleToggleUserStatus(user)}
                       disabled={!user.status} // Disable if status field doesn't exist or logic not implemented
                     >
                       {user.status === 'active' ? 'Disable' : 'Enable'}
                     </Button>
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-muted-foreground">
                         {users.length === 0 && !loading ? 'No users found.' : 'No users match your search.'}
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

       {/* TODO: Add Modals for Invite/Edit Roles */}
       {/* {showInviteModal && <InviteUserModal onClose={() => setShowInviteModal(false)} />} */}
       {/* {editingUser && <EditUserRolesModal user={editingUser} onClose={() => setEditingUser(null)} />} */}
    </div>
  );
};

export default UserManagement;
