import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
// import AdminLoginForm from '@/components/admin/AdminLoginForm'; // No longer needed

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDevLogin = () => {
    // In development, directly navigate to the admin dashboard
    // NOTE: This bypasses all auth checks. Protected routes must also be adjusted.
    console.warn('Bypassing admin authentication for development.');
    navigate('/admin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Admin Login (Dev Mode)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Authentication checks are bypassed in development.
        </p>
        <Button onClick={handleDevLogin} className="w-full">
          Proceed to Admin Dashboard
        </Button>
        {/* <AdminLoginForm /> */}
      </div>
    </div>
  );
};

export default AdminLoginPage; 