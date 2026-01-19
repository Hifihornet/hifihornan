import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null; data: { user: User | null } | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log("Signing up with:", { email, displayName }); // Debug logging
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    
    console.log("Sign up result:", { data, error }); // Debug logging
    
    // After successful signup, create profile
    if (!error && data.user) {
      console.log("Creating profile for user:", data.user.id);
      console.log("Display name to save:", displayName);
      
      try {
        // Först försök att uppdatera metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { display_name: displayName }
        });
        
        if (metadataError) {
          console.error("Error updating user metadata:", metadataError);
        } else {
          console.log("User metadata updated successfully");
        }
        
        // Sedan skapa/uppdatera profil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            display_name: displayName,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });
        
        if (profileError) {
          console.error("Error creating/updating profile:", profileError);
        } else {
          console.log("Profile created/updated successfully with display_name:", displayName);
        }
      } catch (err) {
        console.error("Error in profile creation:", err);
      }
    }
    
    return { error, data: data ? { user: data.user } : null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Even if signOut fails on server (e.g., session already expired),
      // we still want to clear the local state
      console.log("Sign out error (continuing anyway):", error);
    }
    // Always clear local state regardless of API result
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
