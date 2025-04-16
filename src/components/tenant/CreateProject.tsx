import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
// import { useAuth } from '@/contexts/AuthContext'; // To get user/tenant ID later
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const CreateProject: React.FC = () => {
    const navigate = useNavigate();
    // const { user, tenantId } = useAuth(); // Get these later for assigning ownership
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Use the UUID of the EXISTING Demo Tenant
        const devTenantId = '1fcf37df-c8a6-4c70-9f67-81546f9c1854'; // Correct Demo Tenant UUID

        try {
            const { data, error: insertError } = await supabase
                .from('projects')
                .insert({
                    name: projectName,
                    description: projectDescription,
                    tenant_id: devTenantId, // Use existing Demo Tenant ID
                    status: 'draft'
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            console.log('Project created under Demo Tenant:', data);
            navigate(`/dashboard/projects/${data.id}`);

        } catch (err: any) {
            console.error("Error creating project:", err);
            setError(err.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Evaluation Project</CardTitle>
                    <CardDescription>Enter the details for your new tender evaluation.</CardDescription>
                     {error && (
                        <Alert variant="destructive" className="mt-4">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input
                                id="projectName"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                required
                                placeholder="e.g., New Office IT Infrastructure"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="projectDescription">Description (Optional)</Label>
                            <Textarea
                                id="projectDescription"
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                placeholder="Provide a brief overview of the project or tender..."
                                rows={4}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                         <Button type="button" variant="outline" onClick={() => navigate('/dashboard/projects')} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default CreateProject;
