import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button'; // Import Button
import { FolderKanban, PlusCircle, ListTodo, CalendarClock, Users, BadgePercent, HelpCircle, BarChartHorizontal } from 'lucide-react';
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
          Welcome back!
      </h2>
      <p className="text-muted-foreground">
          Here's a quick overview of your tender evaluation activities.
      </p>

      {/* Grid for main actions/info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

         {/* Card for viewing projects */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  My Projects
               </CardTitle>
               <CardDescription>View and manage all your evaluations.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center">
                 <p className="text-sm text-muted-foreground mb-4 text-center">3 Active / 1 Draft / 5 Completed</p> {/* Placeholder Data */}
                 <Link to="/dashboard/projects">
                     <Button variant="outline">View All Projects</Button>
                 </Link>
            </CardContent>
         </Card>

         {/* Card for creating a new project */}
         <Card className="flex flex-col bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <PlusCircle className="h-5 w-5" />
                    Start New Evaluation
                </CardTitle>
                <CardDescription>Create a new project to evaluate suppliers.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center">
                <Link to="/dashboard/projects/new">
                    <Button>Create New Project</Button>
                </Link>
            </CardContent>
         </Card>

          {/* Evaluation Progress Card */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <BarChartHorizontal className="h-5 w-5 text-primary" />
                  Evaluation Progress
               </CardTitle>
               <CardDescription>See scoring completion across active projects.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center space-y-2">
                 <p className="text-sm text-muted-foreground">Project Alpha: 75%</p>{/* Placeholder */}
                 <p className="text-sm text-muted-foreground">Project Beta: 30%</p>{/* Placeholder */}
                 {/* Add progress bars later */}
            </CardContent>
         </Card>

         {/* Pending Tasks Card */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Pending Tasks
               </CardTitle>
               <CardDescription>Criteria or suppliers needing your score.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center space-y-2">
                 <p className="text-sm text-muted-foreground">Score Supplier X (Project Alpha)</p>{/* Placeholder */}
                 <p className="text-sm text-muted-foreground">Score Criteria Y (Project Beta)</p>{/* Placeholder */}
                 <Button variant="link" size="sm" className="mt-2">View All Tasks</Button>{/* Placeholder Link */}
            </CardContent>
         </Card>

          {/* Upcoming Deadlines Card */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Upcoming Deadlines
               </CardTitle>
               <CardDescription>Key dates for your projects.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center space-y-2">
                 <p className="text-sm text-muted-foreground">Project Alpha Final Score: 25 Dec 2024</p>{/* Placeholder */}
                 <p className="text-sm text-muted-foreground">Project Beta Submission: 10 Jan 2025</p>{/* Placeholder */}
            </CardContent>
         </Card>

         {/* Subscription Status Card */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <BadgePercent className="h-5 w-5 text-primary" />
                  Subscription Status
               </CardTitle>
               <CardDescription>Your current plan details.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center">
                 <p className="text-sm font-medium mb-2">Pro Tier (5 Users)</p>{/* Placeholder */}
                 <p className="text-xs text-muted-foreground mb-4">Renews on: 01 Jan 2025</p>{/* Placeholder */}
                 <Button variant="secondary" size="sm">Manage Subscription</Button> {/* Placeholder Link */} 
            </CardContent>
         </Card>

         {/* Invite Evaluators Card (Maybe only for Admins?) */}
          <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Collaboration
               </CardTitle>
               <CardDescription>Invite evaluators to projects.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center">
                 <Button variant="outline">Invite Evaluators</Button>{/* Placeholder Link */}
            </CardContent>
         </Card>

          {/* Help & Support Card */}
         <Card className="flex flex-col">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Help & Support
               </CardTitle>
               <CardDescription>Find answers or get in touch.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center items-center space-y-2">
                 <Button variant="link" size="sm">Read FAQ</Button>{/* Placeholder Link */}
                 <Button variant="link" size="sm">Contact Support</Button>{/* Placeholder Link */}
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
