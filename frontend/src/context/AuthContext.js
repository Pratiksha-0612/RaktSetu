import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [donor, setDonor] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const logoutAll = () => {
    setDonor(null);
    setRecipient(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ donor, setDonor, recipient, setRecipient, isAdmin, setIsAdmin, logoutAll }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}