import React from 'react';
import { useAuth } from './contexts/AuthContext'; // Use the custom hook
import LandingPage from './components/LandingPage'; // Import the LandingPage component
import Dashboard from './components/Dashboard';
import { ThemeProvider } from './components/theme-provider';

function App() {
  const { session, loading } = useAuth(); // Get session and loading state from context

  if (loading) {
    return (
       <div className="flex justify-center items-center min-h-screen">
         <div>Loading application...</div> {/* Or a proper loading spinner */}
       </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* Removed container mx-auto p-4 min-h-screen from here as LandingPage/Dashboard might want full control */}
      {!session ? <LandingPage /> : <Dashboard key={session.user.id} session={session} />}
    </ThemeProvider>
  );
}

export default App;
