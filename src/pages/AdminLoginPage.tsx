import React from 'react';
// Assuming you have a standard login form component
// import LoginForm from '@/components/auth/LoginForm';

const AdminLoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Admin Login
        </h2>
        {/* Render the standard login form here */}
        {/* <LoginForm /> */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
           (Placeholder for Login Form)
        </p>
        {/* Add specific messaging for admins if needed */}
      </div>
    </div>
  );
};

export default AdminLoginPage; 