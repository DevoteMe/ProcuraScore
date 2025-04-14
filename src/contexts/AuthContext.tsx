// 4. React Frontend Structure - Example Auth Context
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient'; // Adjust path as needed

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null; // Replace 'any' with your actual Profile type
  memberships: any[]; // Replace 'any' with TenantMembership type
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  loading: boolean;
  setSelectedTenantId: (tenantId: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null); // Replace 'any'
  const [memberships, setMemberships] = useState<any[]>([]); // Replace 'any'
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      setLoading(true);
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserData(currentSession.user);
        } else {
          // Clear user-specific data if no session
          setProfile(null);
          setMemberships([]);
          setIsPlatformAdmin(false);
          setSelectedTenantId(null);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
        // Clear data on error as well
        setSession(null);
        setUser(null);
        setProfile(null);
        setMemberships([]);
        setIsPlatformAdmin(false);
        setSelectedTenantId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log("Auth state changed:", _event, newSession ? newSession.user.id : 'No session');
      setLoading(true);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchUserData(newSession.user);
      } else {
        // Clear user-specific data on logout
        setProfile(null);
        setMemberships([]);
        setIsPlatformAdmin(false);
        setSelectedTenantId(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (currentUser: User) => {
     try {
        // Check platform admin status
        const adminStatus = currentUser.user_metadata?.is_platform_admin === true || currentUser.app_metadata?.claims_admin === true;
        setIsPlatformAdmin(adminStatus);

        // Fetch profile (example) - Replace with your actual profile fetching logic
        // const { data: profileData, error: profileError } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', currentUser.id)
        //   .single();
        // if (profileError) console.error("Profile fetch error:", profileError);
        // setProfile(profileData);
        setProfile({ id: currentUser.id, email: currentUser.email }); // Simplified

        // Fetch tenant memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('tenant_memberships')
          .select('tenant_id, role') // Adjust columns as needed
          .eq('user_id', currentUser.id);

        if (membershipError) throw membershipError;
        setMemberships(membershipData || []);

        // Set selected tenant - prioritize existing selection, then first membership, then null
        setSelectedTenantId(prevSelected => {
            if (prevSelected && membershipData?.some(m => m.tenant_id === prevSelected)) {
                return prevSelected; // Keep current selection if still valid
            }
            return membershipData?.[0]?.tenant_id ?? null; // Default to first or null
        });

     } catch (error) {
        console.error("Error fetching user data:", error);
        // Handle error state appropriately
        setMemberships([]);
        setIsPlatformAdmin(false);
        setSelectedTenantId(null);
     }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // State updates handled by onAuthStateChange listener
  };

  const value = {
    session,
    user,
    profile,
    memberships,
    isPlatformAdmin,
    selectedTenantId,
    loading,
    setSelectedTenantId,
    logout,
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
