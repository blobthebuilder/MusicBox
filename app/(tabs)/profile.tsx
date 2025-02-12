import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { ThemedText } from "@/components/ThemedText";

const profile = () => {
  const { userToken } = useAuth();
  console.log(process.env.EXPO_PUBLIC_BACKEND_URL);
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
