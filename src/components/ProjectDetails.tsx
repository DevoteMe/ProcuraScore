import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Project Details</h2>
      {projectId ? (
        <p className="text-muted-foreground">Project ID: {projectId}</p>
      ) : (
        <p className="text-destructive">Error: Project ID not found.</p>
      )}
      {/* Add more project details here */}
      <p className="mt-4 text-muted-foreground">More project details will be displayed here in future updates.</p>
    </div>
  );
};

export default ProjectDetails;
