import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext'; // To get admin token for function call

// Define License type if not already defined elsewhere
interface License {
  id: string;
  tenant_id: string;
  plan_id: string; // e.g., 'free', 'pro', 'enterprise'
  status: 'active' | 'inactive' | 'canceled';
  expires_at: string | null;
  created_at: string;
  // Add other relevant fields like user_limit, project_limit etc.
}

const LicenseAdminView: React.FC = () => {
  const { session } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for Create/Update Form
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLicense, setCurrentLicense] = useState<Partial<License>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Admins need access to all licenses, potentially via RLS or specific view/function
      const { data, error: fetchError } = await supabase
        .from('licenses') // Assuming a 'licenses' table
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLicenses(data || []);
    } catch (err: any) {
      console.error('Error fetching licenses:', err);
      setError(`Failed to fetch licenses: ${err.message}. Ensure the 'licenses' table exists and the admin role has read access.`);
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLicenses = licenses.filter(license =>
    license.tenant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.plan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentLicense(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
        setFormError("Admin session not found. Cannot manage licenses.");
        return;
    }
    setFormLoading(true);
    setFormError(null);

    const action = isEditing ? 'update' : 'create';
    const licenseData = { ...currentLicense };
    // Ensure expires_at is null if empty string, or format if needed
    if (licenseData.expires_at === '') {
        licenseData.expires_at = null;
    }

    try {
        console.log("Calling admin-manage-license with:", { action, licenseData });
        const { data, error: functionError } = await supabase.functions.invoke('admin-manage-license', {
            body: { action, licenseData },
             headers: { // Pass the admin's Authorization header
                Authorization: `Bearer ${session.access_token}`
            }
        });

        if (functionError) throw functionError;
        if (data.error) throw new Error(data.error); // Check for errors returned by the function

        console.log("Function response:", data);
        alert(`License successfully ${action}d!`);
        setShowForm(false);
        setIsEditing(false);
        setCurrentLicense({});
        fetchLicenses(); // Refresh the list

    } catch (err: any) {
        console.error(`Error ${action}ing license:`, err);
        setFormError(`Failed to ${action} license: ${err.message}`);
    } finally {
        setFormLoading(false);
    }
  };

  const openCreateForm = () => {
    setIsEditing(false);
    setCurrentLicense({ status: 'active' }); // Default status for new license
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (license: License) => {
    setIsEditing(true);
    // Format expires_at for input type="date" if it exists
    const formattedLicense = {
        ...license,
        expires_at: license.expires_at ? new Date(license.expires_at).toISOString().split('T')[0] : ''
    };
    setCurrentLicense(formattedLicense);
    setFormError(null);
    setShowForm(true);
  };

  // TODO: Implement Delete/Cancel functionality if needed (might just be updating status via edit)

  return (
    <div className="p-4 border rounded-lg bg-secondary/30 space-y-4">
      <h3 className="text-lg font-medium">License Management (Feature 0.5)</h3>
       {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Input
          type="text"
          placeholder="Search licenses by Tenant ID, Plan, or License ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={openCreateForm}>Create New License</Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="p-4 border rounded-md bg-background space-y-3">
          <h4 className="text-md font-medium mb-2">{isEditing ? 'Edit License' : 'Create New License'}</h4>
          {formError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {isEditing && currentLicense.id && (
             <div>
                <Label htmlFor="id">License ID</Label>
                <Input id="id" name="id" type="text" value={currentLicense.id} readOnly className="bg-muted" />
             </div>
          )}
          <div>
            <Label htmlFor="tenant_id">Tenant ID *</Label>
            <Input id="tenant_id" name="tenant_id" type="text" value={currentLicense.tenant_id || ''} onChange={handleInputChange} required disabled={isEditing} />
             {isEditing && <p className="text-xs text-muted-foreground">Tenant ID cannot be changed after creation.</p>}
          </div>
          <div>
            <Label htmlFor="plan_id">Plan ID *</Label>
            <Input id="plan_id" name="plan_id" type="text" placeholder="e.g., free, pro, enterprise" value={currentLicense.plan_id || ''} onChange={handleInputChange} required />
          </div>
           <div>
             <Label htmlFor="status">Status *</Label>
             {/* Consider using a Select component here */}
             <Input id="status" name="status" type="text" placeholder="active, inactive, canceled" value={currentLicense.status || ''} onChange={handleInputChange} required />
           </div>
           <div>
             <Label htmlFor="expires_at">Expires At (Optional)</Label>
             <Input id="expires_at" name="expires_at" type="date" value={currentLicense.expires_at || ''} onChange={handleInputChange} />
           </div>
           {/* Add inputs for other license fields like user_limit, project_limit if needed */}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={formLoading}>Cancel</Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Saving...' : (isEditing ? 'Update License' : 'Create License')}
            </Button>
          </div>
        </form>
      )}


      {/* License List */}
      {loading ? (
        <p>Loading licenses...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">License ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenant ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Expires At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-gray-700">
              {filteredLicenses.length > 0 ? filteredLicenses.map((license) => (
                <tr key={license.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">{license.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{license.tenant_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{license.plan_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       license.status === 'active' ? 'bg-green-800 text-green-100' :
                       license.status === 'canceled' ? 'bg-red-800 text-red-100' :
                       'bg-yellow-800 text-yellow-100' // inactive or other
                     }`}>
                       {license.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(license.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" onClick={() => openEditForm(license)}>Edit</Button>
                    {/* Add Delete/Cancel button if needed, likely triggers an edit to change status */}
                  </td>
                </tr>
              )) : (
                 <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-muted-foreground">
                         {licenses.length === 0 && !loading ? 'No licenses found.' : 'No licenses match your search.'}
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LicenseAdminView;
