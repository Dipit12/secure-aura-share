import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AccessContext } from '@/types';
import { contextService } from '@/services/context-service';
import { awsService } from '@/services/aws-service';

interface AppContextType {
  user: User | null;
  currentContext: AccessContext | null;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentContext, setCurrentContext] = useState<AccessContext | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!awsService.isConfigured());

  useEffect(() => {
    // Check if we have a stored demo user
    const storedUser = localStorage.getItem('demo-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Get current context
    contextService.getCurrentContext().then(setCurrentContext);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo authentication
    const demoUser: User = {
      id: 'demo-user',
      email,
      name: email.split('@')[0],
      trustedDevices: ['device-123', 'device-456'],
    };
    
    setUser(demoUser);
    localStorage.setItem('demo-user', JSON.stringify(demoUser));
    
    // Refresh context on login
    const ctx = await contextService.getCurrentContext();
    setCurrentContext(ctx);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo-user');
  };

  const handleSetDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentContext,
        isDemoMode,
        setDemoMode: handleSetDemoMode,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
