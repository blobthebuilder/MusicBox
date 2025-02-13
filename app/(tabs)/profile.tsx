import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { Link } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { ThemedText } from "@/components/ThemedText";

const profile = () => {
  const { userToken, spotifyAccessToken, logout } = useAuth();

  const fetchUserProfile = async () => {
    try {
      if (!spotifyAccessToken) {
        console.error("No token found");
        return;
      }

      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      });

      const data = await response.json();
      console.log("User Profile:", data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  return (
    <View style={styles.container}>
      {userToken ? (
        <ThemedText style={styles.text}>You are logged in</ThemedText>
      ) : (
        <Link
          href="/(auth)/sign-in"
          style={styles.text}>
          Sign in
        </Link>
      )}
      <Link
        href="/(auth)/spotify-login"
        style={styles.text}>
        Connect to spotify
      </Link>
      <Button
        title="fetch my profile"
        onPress={fetchUserProfile}
      />
      <Button
        title="Logout"
        onPress={async () => await logout()}
      />
    </View>
  );
};

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

export default profile;
