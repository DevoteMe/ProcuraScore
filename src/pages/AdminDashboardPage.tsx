import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p>Welcome to the ProcuraScore Admin Panel.</p>
      {/* Add summary widgets or key stats here later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold">Tenants</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage customer tenants.</p>
            {/* Placeholder for count or link */}
         </div>
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold">Users</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage all users.</p>
            {/* Placeholder for count or link */}
         </div>
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-semibold">Licenses</h3>
            <p className="text-gray-600 dark:text-gray-400">Oversee licenses.</p>
            {/* Placeholder for count or link */}
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 