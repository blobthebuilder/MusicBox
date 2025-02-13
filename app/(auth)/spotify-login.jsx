import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet } from "react-native";
import CryptoJS from "crypto-js";
import { useAuth } from "@/context/AuthContext";

// endpoint
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

export default function SpotifyLogin() {
  const { spotifyLogin } = useAuth();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ["user-read-email", "playlist-modify-public"],
      // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: makeRedirectUri({ native: "myapp://" }), // this is the scheme in app.json
    },
    discovery
  );
  useEffect(() => {
    const fetchToken = async () => {
      if (response?.type === "success") {
        const { code } = response.params;

        try {
          const tokenUrl = "https://accounts.spotify.com/api/token";

          const bodyData = new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: makeRedirectUri({ native: "myapp://" }),
            client_id: CLIENT_ID,
            client_secret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET, // Store this securely
          });

          const tokenResponse = await fetch(tokenUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyData.toString(),
          });

          const tokenData = await tokenResponse.json();
          console.log("Access Token:", tokenData.access_token);

          await spotifyLogin(tokenData.access_token);
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      }
    };

    fetchToken();
  }, [response]);

  return (
    <View style={styles.container}>
      <Button
        disabled={!request}
        title="spotify connect"
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
