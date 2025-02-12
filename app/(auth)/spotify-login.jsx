import React, { useEffect, useState } from "react";
import { View, Button, Text } from "react-native";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { StyleSheet } from "react-native";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = ["user-read-email", "user-top-read"];

export default function SpotifyLogin() {
  const SpotifyID = process.env.SPOTIFY_CLIENT_ID;
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await AsyncStorage.getItem("spotify_token");
      if (storedToken) setToken(storedToken);
    };
    getToken();
  }, []);

  const handleLogin = async () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${encodeURIComponent(
      SPOTIFY_REDIRECT_URI
    )}&scope=${SCOPES.join("%20")}`;

    const result = await AuthSession.startAsync({ authUrl });

    if (result.type === "success") {
      setToken(result.params.access_token);
      await AsyncStorage.setItem("spotify_token", result.params.access_token);
    }
  };

  return (
    <View style={styles.container}>
      {token ? (
        <Text>Logged in! Token stored.</Text>
      ) : (
        <Button
          title="Login with Spotify"
          onPress={handleLogin}
        />
      )}
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
