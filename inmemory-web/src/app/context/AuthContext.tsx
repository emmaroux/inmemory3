'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken as setAuthToken, removeToken } from '../utils/auth';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      setAuthToken(newToken);
    } else {
      removeToken();
    }
    setTokenState(newToken);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Réponse Strapi:', data);

      if (response.ok) {
        const { jwt, user } = data;
        
        // Stocker les données de manière atomique
        await Promise.all([
          new Promise<void>((resolve) => {
            localStorage.setItem('user', JSON.stringify(user));
            resolve();
          }),
          new Promise<void>((resolve) => {
            setToken(jwt);
            resolve();
          })
        ]);
        
        setUser(user);
        
        // Vérifier que le token est bien stocké
        const storedToken = localStorage.getItem('token');
        console.log('Token stocké avec succès:', storedToken === jwt);
        
        return { user, token: jwt };
      } else {
        if (data.error) {
          console.error('Erreur détaillée:', data.error);
          throw new Error(
            data.error.message || 
            (data.error.details?.errors?.[0]?.message) || 
            'Erreur de connexion'
          );
        } else {
          throw new Error('Erreur de connexion inconnue');
        }
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.jwt);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error(data.error?.message || 'Erreur d\'inscription');
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 