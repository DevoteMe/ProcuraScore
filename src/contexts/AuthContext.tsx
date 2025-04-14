import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface UserDetails {
  id: string;
  email?: string;
  roles?: string[]; // Add roles
  // Add other profile details you might fetch
  full_name?: string;
  avatar_url?: string;
  tenant_memberships?: { tenant_id: string; role: string }[]; // Example structure
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userDetails: UserDetails | null; // Add userDetails state
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null); // State for profile/roles
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile and roles
  const fetchUserDetails = async (userId: string) => {
      try {
          console.log("Fetching user details for:", userId);
          const { data, error } = await supabase
              .from('profiles') // Assuming a 'profiles' table
              .select('id') //  <--  Simplify select
              .eq('id', userId)
              .single();

          if (error) {
              console.warn('Error fetching user details:', error.message);
              setUserDetails({ id: userId, roles: [] });
              return;
          }

          if (data) {
              console.log("Successfully fetched user details (simplified):", data); // ADDED LOG
              setUserDetails({ id: data.id, roles: [] }); // Simplified details
          } else {
               setUserDetails({ id: userId, roles: [] });
          }

      } catch (error: any) {
          console.error('Error in fetchUserDetails catch block:', error.message); // ADDED LOG for catch block errors
          console.error('Unexpected error fetching user details:', error.message);
      } finally {
          setUserDetails({ id: userId, roles: [] }); // Set minimal details on error
      }
  };


  useEffect(() => {
    setLoading(true);
    console.log("AuthContext useEffect triggered");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (session?.user) {
          fetchUserDetails(session.user.id).finally(() => {
            setLoading(false);
            console.log("Initial user details fetch complete, loading set to false");
          });
      } else {
          setLoading(false);
          setUserDetails(null); // Ensure userDetails is cleared on no session
          setUser(null); // Ensure user is cleared
          console.log("No initial user, loading set to false");
      }
    }).catch(error => {
        console.error("Error getting initial session:", error);
    }).finally(() => { // ADD THIS FINALLY BLOCK
        setLoading(false); // Ensure loading is set to false even on getSession error
        console.log("getSession finally block - setLoading(false)"); // ADDED LOG
    });


    // 2. Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth State Change Event:", _event, session); // Debugging
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          setLoading(true); // Start loading when user changes
          console.log("Auth state changed, fetching user details for:", currentUser.id); // ADDED LOG
          await fetchUserDetails(currentUser.id);
          setLoading(false); // Stop loading after fetching details
          console.log("Auth state change user details fetch complete, loading set to false"); // ADDED LOG
        } else {
          setUserDetails(null); // Clear details on logout
          setLoading(false); // Stop loading if no user
          console.log("Auth state changed, no user, loading set to false"); // ADDED LOG
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
      console.log("AuthContext useEffect cleanup"); // ADDED LOG
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); // Explicitly set session to null on signOut
    setUser(null);     // Explicitly set user to null
    setUserDetails(null); // Clear user details as well
    console.log("signOut function called - session, user, userDetails set to null"); // ADDED LOG
  };

  const value = {
    session,
    user,
    userDetails, // Provide userDetails in context
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
