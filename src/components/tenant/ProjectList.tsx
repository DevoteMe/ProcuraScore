import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PlusCircle, FolderKanban } from 'lucide-react';

// Define the structure of a Project directly
interface Project {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  tenant_id: string; // Include tenant_id if needed for display/filtering later
  // Add other relevant fields like description, last_updated etc.
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { user } = useAuth(); // Can add back later if needed

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching projects (bypassing RLS for dev)...");
      // Fetch projects directly - REMOVE RLS checks for dev bypass
      // We will add .eq('tenant_id', userTenantId) later
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('id, name, status, created_at, tenant_id') // Select desired columns
        // Removed .eq('tenant_id', selectedTenantId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      console.log("Fetched projects:", data);
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err.message);
      setError('Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies for now as we fetch all

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Simplified permission for dev - always allow create button
  const canCreateProject = true; // Assume true for dev bypass

  // Function to get badge color based on status
  const getStatusBadgeColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'draft':
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground">My Projects</h2>
        {canCreateProject && (
          <Button asChild>
            <Link to="/dashboard/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Project
            </Link>
          </Button>
        )}
      </div>

      {loading && <p className="text-muted-foreground text-center py-4">Loading projects...</p>}
      {error && <p className="text-destructive text-center py-4">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <Card className="text-center py-10 border-dashed">
          <CardHeader>
             <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl font-semibold">No Projects Found</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">Get started by creating your first evaluation project.</CardDescription>
          </CardHeader>
          <CardContent>
            {canCreateProject && (
              <Button asChild size="sm">
                 <Link to="/dashboard/projects/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Project
                 </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} to={`/dashboard/projects/${project.id}`} className="block hover:no-underline">
              <Card className="h-full hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-lg truncate" title={project.name}>{project.name}</CardTitle>
                  <CardDescription className={`capitalize px-2 py-0.5 rounded-full text-xs inline-block font-medium ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                   {/* Optionally show tenant ID during dev */}
                  {/* <p className="text-xs text-muted-foreground">Tenant: {project.tenant_id}</p> */}
                   <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
