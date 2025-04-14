
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType, UserAuth } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for current user on mount
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { id, email } = session.user;
          if (email) {
            setUser({
              id,
              email,
              username: email.split('@')[0], // Fallback if username is not available
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const { session } = data;
      
      if (session?.user) {
        const { id, email } = session.user;
        if (email) {
          // Get user details from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', id)
            .single();
          
          setUser({
            id,
            email,
            username: profileData?.username || email.split('@')[0],
          });
        }
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully logged in.',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // If user was created, add to profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            email,
            created_at: new Date().toISOString(),
          });
        
        if (profileError) throw profileError;
      }
      
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created.',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
