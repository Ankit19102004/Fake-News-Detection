import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');

  // Mock checking login state
  useEffect(() => {
    const savedUser = localStorage.getItem('truthx_auth');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
      setUser(parsedUser);

      const userApiKey = localStorage.getItem(`truthx_api_key_${parsedUser.email}`);
      if (userApiKey) {
        setApiKey(userApiKey);
      }
    }
  }, []);

  const login = async (email, password) => {
    // Mock login just sets the state
    if (email && password) {
      const mockUser = { email, name: email.split('@')[0] };
      setIsAuthenticated(true);
      setUser(mockUser);
      localStorage.setItem('truthx_auth', JSON.stringify(mockUser));

      // Fetch or generate user specific API Key
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/generate_key`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user_id: email })
        });
        const data = await response.json();

        if (data.status === "success" && data.api_key) {
          setApiKey(data.api_key);
          localStorage.setItem(`truthx_api_key_${email}`, data.api_key);
        }
      } catch (error) {
        console.error("Error fetching API Key:", error);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setApiKey('');
    localStorage.removeItem('truthx_auth');
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    if (user && user.email) {
      localStorage.setItem(`truthx_api_key_${user.email}`, key);
    }
  };

  const removeApiKey = () => {
    setApiKey('');
    if (user && user.email) {
      localStorage.removeItem(`truthx_api_key_${user.email}`);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, apiKey, login, logout, saveApiKey, removeApiKey }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
