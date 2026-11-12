import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDB } from '../services/storage';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize session
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile && profile.is_active) {
              setUser({ ...profile, email: session.user.email });
            } else {
              await supabase.auth.signOut();
              setUser(null);
            }
          }
        } else {
          // Check local session
          const savedUserId = localStorage.getItem('labtrack_current_user_id');
          if (savedUserId) {
            const profiles = localDB.getProfiles();
            const found = profiles.find((p) => p.id === savedUserId);
            if (found && found.is_active) {
              setUser(found);
            } else {
              localStorage.removeItem('labtrack_current_user_id');
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile && profile.is_active) {
            setUser({ ...profile, email: session.user.email });
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // First try email login; if user entered username, resolve email via profiles or username mapping
        let emailToUse = identifier;
        if (!identifier.includes('@')) {
          // Look up user's email or format standard
          const { data: matchedProfile } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('username', identifier.trim().toLowerCase())
            .single();

          if (!matchedProfile) {
            throw new Error('Username tidak ditemukan dalam sistem.');
          }
          // In Supabase, if username is used, the email is username@labtrack.com or stored email
          emailToUse = `${identifier.trim().toLowerCase()}@labtrack.com`;
        }

        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password || 'admin123',
        });

        if (authErr) {
          throw new Error('Kredensial login salah. Silakan periksa username/email dan password.');
        }

        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profErr || !profile) {
          throw new Error('Data profil pengguna tidak ditemukan.');
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          throw new Error('Akun Anda telah dinonaktifkan oleh Administrator. Hubungi admin lab.');
        }

        setUser({ ...profile, email: authData.user.email });
      } else {
        // Local mode login
        const profiles = localDB.getProfiles();
        const cleanIdent = identifier.trim().toLowerCase();
        const found = profiles.find(
          (p) =>
            p.username.toLowerCase() === cleanIdent ||
            (p.email && p.email.toLowerCase() === cleanIdent)
        );

        if (!found) {
          throw new Error('Username atau email tidak terdaftar.');
        }

        if (!found.is_active) {
          throw new Error('Akun Anda telah dinonaktifkan oleh Administrator.');
        }

        // Demo password check (for mock mode)
        if (password) {
          const validPass =
            (found.role === 'admin' && (password === 'admin123' || password === 'admin')) ||
            (found.role === 'staff' && (password === 'staff123' || password === 'staff'));
          if (!validPass) {
            throw new Error('Password salah. Gunakan password default: admin123 (admin) atau staff123 (staff).');
          }
        }

        localStorage.setItem('labtrack_current_user_id', found.id);
        setUser(found);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('labtrack_current_user_id');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        logout,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

