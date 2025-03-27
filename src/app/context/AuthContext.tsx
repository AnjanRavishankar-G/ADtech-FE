'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Define token payload interface
interface TokenPayload {
  sub: string;
  email: string;
  name?: string;
  'custom:role'?: string;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
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
    // Check for tokens in cookies
    const savedAuthToken = Cookies.get('auth_token');
    const savedIdToken = Cookies.get('id_token');

    if (savedAuthToken && savedIdToken) {
      setAuthToken(savedAuthToken);
      setIdToken(savedIdToken);
      
      try {
        const decoded = jwtDecode<TokenPayload>(savedIdToken);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded['custom:role']
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const setTokens = (newAuthToken: string, newIdToken: string) => {
    // Store tokens in cookies with 1 day expiry
    Cookies.set('auth_token', newAuthToken, { expires: 1 });
    Cookies.set('id_token', newIdToken, { expires: 1 });
    
    setAuthToken(newAuthToken);
    setIdToken(newIdToken);

    try {
      const decoded = jwtDecode<TokenPayload>(newIdToken);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded['custom:role']
      });
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('id_token');
    setAuthToken(null);
    setIdToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!authToken, 
      loading, 
      token: authToken,
      idToken,
      user, 
      login: setTokens, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
