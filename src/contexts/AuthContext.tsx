
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthContextType, UserAuth } from '@/types';

// Mock user data - this would come from a real auth system in production
const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // This is a mock authentication
    // In a real app, this would make an API call to your auth server
    setLoading(true);
    
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          u => u.email === email && u.password === password
        );
        
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 1000); // Simulate network delay
    });
  };

  const register = async (username: string, email: string, password: string) => {
    // This is a mock registration
    // In a real app, this would make an API call to your auth server
    setLoading(true);
    
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find(u => u.email === email);
        
        if (existingUser) {
          setLoading(false);
          reject(new Error('User with this email already exists'));
        } else {
          const newUser = {
            id: (mockUsers.length + 1).toString(),
            username,
            email,
            password
          };
          
          mockUsers.push(newUser);
          
          const { password: _, ...userWithoutPassword } = newUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setLoading(false);
          resolve();
        }
      }, 1000); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
      {children}
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
