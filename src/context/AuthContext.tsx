import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../supabase/client';
import { signInWithEmail, signUpWithEmail, signOut, resetPassword as resetPw } from '../supabase/auth';
import { showError, showSuccess } from '../utils/toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      showSuccess('Welcome back!');
    } catch (err: any) {
      showError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
      showSuccess('Account created! Check your email for verification.');
    } catch (err: any) {
      showError(err.message || 'Signup failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
      showSuccess('Logged out');
    } catch (err: any) {
      showError(err.message || 'Logout failed');
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await resetPw(email);
      showSuccess('Password reset link sent to your email');
    } catch (err: any) {
      showError(err.message || 'Failed to send reset link');
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}