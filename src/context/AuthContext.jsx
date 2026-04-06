import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const register = async (email, password, name) => {
    try {
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              points: 0,
              tier: 'Bronze',
            },
          ]);

        if (profileError) throw profileError;
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const completeOnboarding = async (archetype) => {
    try {
      setError(null);
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({ archetype })
        .eq('id', user.id);

      if (error) throw error;

      setHasCompletedOnboarding(true);
      localStorage.setItem('hasCompletedOnboarding', 'true');
      localStorage.setItem('archetype', archetype);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    hasCompletedOnboarding,
    loading,
    error,
    register,
    login,
    logout,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}