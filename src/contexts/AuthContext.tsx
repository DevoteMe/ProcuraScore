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
          // Fetch from 'profiles' table or wherever you store additional user info and roles
          // Ensure RLS allows the logged-in user to read their own profile.
          const { data, error } = await supabase
              .from('profiles') // Assuming a 'profiles' table
              .select(`
                  id,
                  full_name,
                  avatar_url,
                  raw_user_meta_data->>'roles' as roles,
                  tenant_memberships ( tenant_id, role )
              `) // Adjust select based on your schema
              .eq('id', userId)
              .single(); // Fetch a single profile matching the user ID

          if (error) {
              // Don't throw, maybe profile doesn't exist yet or RLS issue
              console.warn('Error fetching user details:', error.message);
              // Set basic details from auth user if profile fetch fails
              const authUser = (await supabase.auth.getUser()).data.user;
              setUserDetails({ id: userId, email: authUser?.email, roles: authUser?.app_metadata?.roles || [] });
              return;
          }

          if (data) {
              // Combine auth email with profile data
               const authUser = (await supabase.auth.getUser()).data.user;
               // Ensure roles are parsed correctly (might be JSON string)
               let parsedRoles = data.roles;
               if (typeof parsedRoles === 'string') {
                   try {
                       parsedRoles = JSON.parse(parsedRoles);
                   } catch (e) {
                       console.error("Failed to parse roles from metadata:", e);
                       parsedRoles = []; // Default to empty array on parse error
                   }
               }
               // Fallback to app_metadata if profile roles are missing/empty
               if (!parsedRoles || parsedRoles.length === 0) {
                   parsedRoles = authUser?.app_metadata?.roles || [];
               }


              setUserDetails({
                  id: data.id,
                  email: authUser?.email, // Get email from auth session
                  full_name: data.full_name,
                  avatar_url: data.avatar_url,
                  roles: Array.isArray(parsedRoles) ? parsedRoles : [], // Ensure roles is an array
                  tenant_memberships: data.tenant_memberships || []
              });
          } else {
               // Handle case where profile doesn't exist but no error occurred
               const authUser = (await supabase.auth.getUser()).data.user;
               setUserDetails({ id: userId, email: authUser?.email, roles: authUser?.app_metadata?.roles || [] });
          }

      } catch (error: any) {
          console.error('Unexpected error fetching user details:', error.message);
          setUserDetails({ id: userId, roles: [] }); // Set minimal details on error
      }
  };


  useEffect(() => {
    setLoading(true);
    // 1. Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
          fetchUserDetails(session.user.id).finally(() => setLoading(false));
      } else {
          setLoading(false); // No user, stop loading
      }
    }).catch(error => {
        console.error("Error getting initial session:", error);
        setLoading(false);
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
          await fetchUserDetails(currentUser.id);
          setLoading(false); // Stop loading after fetching details
        } else {
          setUserDetails(null); // Clear details on logout
          setLoading(false); // Stop loading if no user
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // State updates are handled by onAuthStateChange listener
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
