'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  loading: boolean;
  user: UserData | null;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
  loading: true,
  user: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setTokenState(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If token is invalid, log out
        localStorage.removeItem('token');
        setTokenState(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const setToken = (newToken: string) => {
    setTokenState(newToken);
    fetchUserProfile(newToken);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setTokenState(null);
    setUser(null);
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider value={{ token, setToken, logout, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
