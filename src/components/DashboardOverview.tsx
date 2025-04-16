import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button'; // Import Button
import { FolderKanban, PlusCircle } from 'lucide-react';
// import { useOutletContext } from 'react-router-dom'; // Removed outlet context dependency
// import { useAuth } from '@/contexts/AuthContext'; // Can add back later if needed for user info

// Removed DashboardContext interface

const DashboardOverview: React.FC = () => {
  // Removed context fetching and conditional logic for admin/tenant

  // const { user } = useAuth(); // Get user info directly if needed later

  return (
    <div className="p-6 space-y-6">
      {/* Welcome message - could use user?.email later */}
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome to your Dashboard!
      </h2>
      <p className="text-muted-foreground">
          Manage your tender evaluations efficiently.
      </p>

      {/* Grid for main actions/info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

         {/* Card for viewing projects */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  My Evaluation Projects
               </CardTitle>
               <CardDescription>View and manage your ongoing or completed evaluations.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center">
                 {/* Placeholder - Later fetch and display a count or snippet */}
                 <p className="text-muted-foreground mb-4">You have X active projects.</p>
                 <Link to="/dashboard/projects">
                     <Button variant="outline">View All Projects</Button>
                 </Link>
            </CardContent>
         </Card>

         {/* Card for creating a new project */}
         <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    Start New Evaluation
                </CardTitle>
                <CardDescription>Create a new project to evaluate suppliers or bids.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center">
                <Link to="/dashboard/projects/new">
                    <Button>Create New Project</Button>
                </Link>
            </CardContent>
         </Card>

         {/* Placeholder Card 3 (e.g., Subscription Status, Team Management) */}
         <Card className="flex flex-col bg-muted/30 border-dashed">
            <CardHeader>
                <CardTitle className="text-muted-foreground/80">More Actions</CardTitle>
                <CardDescription className="text-muted-foreground/60">Quick links (optional)</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center text-center">
               <p className="text-sm text-muted-foreground">Links to Subscription, Team, or Settings can go here.</p>
            </CardContent>
         </Card>

      </div>

       {/* Placeholder for additional content if needed later */}
       {/* <div className="mt-8 bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Activity feed or quick links could go here...</p>
       </div> */}
    </div>
  );
};

export default DashboardOverview;
