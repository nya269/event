import React, { createContext, useState } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      setToken(accessToken);
      setUser({ email }); // On stocke l'utilisateur
      // On ajoute le token à toutes les futures requêtes automatiquement
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      return { success: true };
    } catch (error) {
      console.error("Erreur login:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Erreur de connexion" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};