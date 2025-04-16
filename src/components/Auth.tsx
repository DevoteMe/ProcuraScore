// Placeholder Auth component - Bypassing actual auth for development
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

const Auth: React.FC = () => {
  const navigate = useNavigate();

  const handleDevLogin = () => {
    // In development, directly navigate to the user dashboard
    // NOTE: This bypasses all auth checks. Protected routes must also be adjusted.
    console.warn('Bypassing user authentication for development.');
    navigate('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
       <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">User Login/Signup (Dev Mode)</CardTitle>
          <CardDescription>Authentication checks are bypassed in development.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <Button onClick={handleDevLogin} className="w-full">
             Proceed to User Dashboard
           </Button>
           {/* You could add separate buttons for different user roles if needed */}
        </CardContent>
        {/* Original form removed */}
      </Card>
    </div>
  );
};

export default Auth;
