import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface UserDetails {
  id: string;
  email?: string;
  // We might still fetch other details later, but roles/admin status comes from session
  full_name?: string;
  avatar_url?: string;
  tenant_memberships?: { tenant_id: string; role: string }[];
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userDetails: UserDetails | null;
  isPlatformAdmin: boolean; // Add platform admin status flag
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
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false); // Initialize admin state
  const [loading, setLoading] = useState(true);

  // Function to fetch non-role user details (if needed later)
  const fetchExtraUserDetails = async (userId: string) => {
    // Placeholder: Fetch full_name, avatar_url etc. from 'profiles' if needed
    // For now, just set basic details.
    console.log("[AuthContext] Fetching extra user details for:", userId);
    // Example: const { data, error } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).single();
    setUserDetails({ id: userId }); // Set minimal details
  };

  // Function to update auth state including isPlatformAdmin
  const updateAuthState = async (currentSession: Session | null) => {
    console.log("[AuthContext] updateAuthState called with session:", currentSession ? 'Exists' : 'None');
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    // Determine Platform Admin status directly from session
    const isAdmin = currentUser?.app_metadata?.claims_admin === true;
    setIsPlatformAdmin(isAdmin);
    console.log(`[AuthContext] Auth state updated. User: ${currentUser?.id}, IsAdmin: ${isAdmin}`); // Log admin status

    if (currentUser) {
      await fetchExtraUserDetails(currentUser.id); // Fetch other details if needed
    } else {
      setUserDetails(null); // Clear details on logout
      console.log("[AuthContext] User details cleared.");
    }
  };

  useEffect(() => {
    setLoading(true);
    console.log("[AuthContext] useEffect triggered - Initial Load");
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log("[AuthContext] Initial session fetched:", initialSession ? 'Exists' : 'None');
      await updateAuthState(initialSession); // Update state based on initial session
      console.log("[AuthContext] Initial updateAuthState complete.");
    }).catch(error => {
      console.error("[AuthContext] Error getting initial session:", error);
      updateAuthState(null); // Ensure state is cleared on error
    }).finally(() => {
      setLoading(false);
      console.log("[AuthContext] Initial session processing complete, loading set to false.");
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log("[AuthContext] onAuthStateChange Event:", _event, newSession ? 'New Session' : 'No Session');
        setLoading(true); // Set loading during transition
        console.log("[AuthContext] onAuthStateChange: setLoading(true)");
        await updateAuthState(newSession); // Update state based on new session
        setLoading(false); // Unset loading after update
        // Log the state *after* it's been updated and loading is set to false
        console.log(`[AuthContext] onAuthStateChange: updateAuthState complete. Final state - Loading: ${loading}, Session: ${session ? 'Exists' : 'None'}, User: ${user?.id}, IsAdmin: ${isPlatformAdmin}`);
        console.log("[AuthContext] onAuthStateChange: setLoading(false)");
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
      console.log("[AuthContext] useEffect cleanup - Unsubscribed from auth changes.");
    };
  }, []); // Run only once on mount

  const signOut = async () => {
    console.log("[AuthContext] signOut function called"); // Log before calling Supabase
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("[AuthContext] Error signing out:", error);
        } else {
            console.log("[AuthContext] supabase.auth.signOut() successful (listener should handle state update)");
        }
    } catch (error) {
        console.error("[AuthContext] Exception during signOut:", error);
    }
    // No need to manually set state here, onAuthStateChange will trigger updateAuthState(null)
  };

  const value = {
    session,
    user,
    userDetails,
    isPlatformAdmin, // Provide admin status
    loading,
    signOut,
  };

  // Log context value right before providing it
  // console.log("[AuthContext] Providing context value:", value);

  // Render children only when loading is false? Let's reconsider this.
  // It might be better to let ProtectedRoute handle the loading state display.
  // If we keep this, a brief flash of loading might occur even if ProtectedRoute also shows loading.
  // Let's allow children to render even during loading, ProtectedRoute will gate access.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
