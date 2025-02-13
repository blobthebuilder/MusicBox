import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);

  // Load token from SecureStore when the app starts
  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      setUserToken(token);
    };
    loadToken();
  }, []);

  // Save token to SecureStore when logging in
  const login = async (token) => {
    await SecureStore.setItemAsync("userToken", token);
    setUserToken(token);
  };

  // Remove token from SecureStore when logging out
  const logout = async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("spotifyAccessToken");
    setUserToken(null);
  };

  const spotifyLogin = async (token) => {
    await SecureStore.setItemAsync("spotifyAccessToken", token);
    setSpotifyAccessToken(token);
  };

  return (
    <AuthContext.Provider
      value={{ userToken, spotifyAccessToken, login, logout, spotifyLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
