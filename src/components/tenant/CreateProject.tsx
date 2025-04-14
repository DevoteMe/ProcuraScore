import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea'; // Assuming you have a Textarea component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'; // Assuming you have an Alert component
import { Loader2 } from 'lucide-react'; // Loading spinner icon

// Define the structure of the context passed from Dashboard
interface DashboardContext {
  selectedTenantId: string | null;
  // Add other context properties if needed later
}

// Define the structure for project status (matches schema)
type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

const CreateProject: React.FC = () => {
  const context = useOutletContext<DashboardContext>();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('draft'); // Default status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { selectedTenantId } = context || {};

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedTenantId) {
      setError("No tenant selected. Cannot create project.");
      return;
    }
    if (!projectName.trim()) {
        setError("Project name is required.");
        return;
    }

    setLoading(true);

    try {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            tenant_id: selectedTenantId,
            name: projectName.trim(),
            description: projectDescription.trim(),
            status: status,
            // created_by: session.user.id // Add this if your schema tracks creator
          },
        ])
        .select() // Return the created record(s)
        .single(); // Expecting a single record back

      if (insertError) {
        throw insertError;
      }

      setSuccess(`Project "${data.name}" created successfully!`);
      // Optionally clear the form
      setProjectName('');
      setProjectDescription('');
      setStatus('draft');

      // Redirect after a short delay
      setTimeout(() => {
        // Redirect to the project list or the new project's detail page
        navigate('/dashboard/projects');
        // navigate(`/dashboard/projects/${data.id}`); // If redirecting to details page
      }, 1500);

    } catch (err: any) {
      console.error('Error creating project:', err.message);
      setError(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Enter the details for your new evaluation project.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700">
                 <AlertTitle>Success</AlertTitle>
                 <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., New CRM System Evaluation"
                required
                disabled={loading || !!success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (Optional)</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Provide a brief description of the project's goals."
                rows={4}
                disabled={loading || !!success}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="projectStatus">Initial Status</Label>
               <select
                 id="projectStatus"
                 value={status}
                 onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                 className="w-full p-2 border rounded bg-background text-foreground focus:ring-primary focus:border-primary"
                 disabled={loading || !!success}
               >
                 <option value="draft">Draft</option>
                 <option value="active">Active</option>
                 {/* Add other statuses if needed, but 'draft' is typical for creation */}
               </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading || !!success}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateProject;
