import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PlusCircle, FolderKanban } from 'lucide-react'; // Icons

// Define the structure of the context passed from Dashboard
interface DashboardContext {
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  tenantRole?: 'tenant_id_admin' | 'tenant_id_user';
}

// Define the structure of a Project (adjust based on your schema)
interface Project {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  // Add other relevant fields like description, last_updated etc.
}

const ProjectList: React.FC = () => {
  const context = useOutletContext<DashboardContext>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedTenantId, tenantRole } = context || {}; // Destructure safely

  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedTenantId) {
        setProjects([]);
        setLoading(false);
        setError("No tenant selected.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch projects for the currently selected tenant
        // Ensure RLS is set up correctly for the 'projects' table
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('id, name, status, created_at') // Select desired columns
          .eq('tenant_id', selectedTenantId)
          .order('created_at', { ascending: false }); // Order by creation date

        if (fetchError) {
          throw fetchError;
        }

        setProjects(data || []);
      } catch (err: any) {
        console.error('Error fetching projects:', err.message);
        setError('Failed to load projects. Please try again.');
        setProjects([]); // Clear projects on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedTenantId]); // Re-fetch when the selected tenant changes

  const canCreateProject = tenantRole === 'tenant_id_admin'; // Only admins can create projects

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Projects</h2>
        {canCreateProject && (
          <Button asChild>
            {/* TODO: Update link to actual project creation route */}
            <Link to="/dashboard/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Project
            </Link>
          </Button>
        )}
      </div>

      {loading && <p className="text-muted-foreground">Loading projects...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <Card className="text-center py-8">
          <CardHeader>
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4 text-xl font-semibold">No Projects Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Get started by creating your first evaluation project.</p>
            {canCreateProject && (
              <Button asChild size="sm">
                 <Link to="/dashboard/projects/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Project
                 </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">
                  {/* Link to project details page */}
                  <Link to={`/dashboard/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Status: <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${
                    project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    project.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' // Draft or other
                  }`}>{project.status}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>
                {/* Add more details or actions like Edit/View buttons here */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
