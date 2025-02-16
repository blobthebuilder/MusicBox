import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { encode } from "base-64";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState(null);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState(null);
  const [clientAccessToken, setClientAccessToken] = useState(null);

  // Load token from SecureStore when the app starts
  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      const accessToken = await SecureStore.getItemAsync("spotifyAccessToken");
      const refreshToken = await SecureStore.getItemAsync(
        "spotifyRefreshToken"
      );
      const clientToken = await SecureStore.getItemAsync("clientAccessToken");

      setUserToken(token);
      setSpotifyAccessToken(accessToken);
      setSpotifyRefreshToken(refreshToken);
      setClientAccessToken(clientToken);

      if (accessToken) {
        checkAndRefreshToken(); // 🔄 Refresh token if needed
      }

      if (!clientToken) {
        getClientToken();
      }
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
    await SecureStore.deleteItemAsync("spotifyRefreshToken");

    setUserToken(null);
    setSpotifyAccessToken(null);
    setSpotifyRefreshToken(null);
  };

  // log in to your spotify account
  const spotifyLogin = async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync("spotifyAccessToken", accessToken);
    await SecureStore.setItemAsync("spotifyRefreshToken", refreshToken);

    setSpotifyAccessToken(accessToken);
    setSpotifyRefreshToken(refreshToken);
  };

  // refresh spotify token
  const refreshSpotifyToken = async () => {
    if (!spotifyRefreshToken) {
      console.log("No refresh token available");
      return;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: spotifyRefreshToken,
          client_id: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
          client_secret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET,
        }).toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        await SecureStore.setItemAsync("spotifyAccessToken", data.access_token);
        setSpotifyAccessToken(data.access_token);
        console.log("Spotify token refreshed!");
      } else {
        console.log("Failed to refresh token", data);
      }
    } catch (error) {
      console.log("Error refreshing Spotify token:", error);
    }
  };

  // ⏳ Check and refresh token on app start
  const checkAndRefreshToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("spotifyAccessToken");
      if (!token) return;

      // Simulating token expiry check - Call refresh if needed
      refreshSpotifyToken();
    } catch (error) {
      console.error("Error checking token:", error);
    }
  };

  const getClientToken = async () => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            encode(
              `${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
        },
        body: "grant_type=client_credentials",
      });
      const data = await response.json();
      console.log("Client Access Token:", data.access_token);
      setClientAccessToken(data.access_token);
    } catch (error) {
      console.log("Error getting client token", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        spotifyAccessToken,
        spotifyRefreshToken,
        clientAccessToken,
        login,
        logout,
        spotifyLogin,
        refreshSpotifyToken,
      }}>
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
