'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Simplified user data interface
interface UserData {
  role: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  idToken: string | null;
  user: UserData | null;
  login: (authToken: string, idToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  token: null,
  idToken: null,
  user: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedAuthToken = Cookies.get('auth_token');
    const savedIdToken = Cookies.get('id_token'); // This is now the role string

    if (savedAuthToken && savedIdToken) {
      setAuthToken(savedAuthToken);
      setIdToken(savedIdToken);
      setUser({ role: savedIdToken }); // Just store the role
    }
    
    setLoading(false);
  }, []);

  const login = (newAuthToken: string, newIdToken: string) => {
    Cookies.set('auth_token', newAuthToken, { expires: 1 });
    Cookies.set('id_token', newIdToken, { expires: 1 }); // Storing role string
    
    setAuthToken(newAuthToken);
    setIdToken(newIdToken);
    setUser({ role: newIdToken }); // Just store the role
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('id_token');
    setAuthToken(null);
    setIdToken(null);
    setUser(null);
    router.push('/login'); // Keep this as /login
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!authToken, 
      loading, 
      token: authToken,
      idToken,
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
