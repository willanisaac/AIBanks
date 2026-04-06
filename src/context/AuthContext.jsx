import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check localStorage for user and onboarding status
    const storedUser = localStorage.getItem('user');
    const storedOnboarding = localStorage.getItem('hasCompletedOnboarding');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedOnboarding === 'true') {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setHasCompletedOnboarding(false);
    localStorage.removeItem('user');
    localStorage.removeItem('hasCompletedOnboarding');
  };

  const completeOnboarding = (archetype) => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('hasCompletedOnboarding', 'true');
    localStorage.setItem('archetype', archetype);
  };

  const value = {
    user,
    hasCompletedOnboarding,
    login,
    logout,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}