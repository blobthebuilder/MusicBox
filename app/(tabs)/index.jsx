import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Button } from "react-native";

export default function HomeScreen() {
  const { clientAccessToken } = useAuth();

  useEffect(() => {
    getTopSongs();
  }, [clientAccessToken]);

  const getTopSongs = async () => {
    try {
      const response = await fetch(
        "https://api.spotify.com/v1/playlists/3soOBVgcGcNnW8WVaxP9Ig",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${clientAccessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.items) {
        const songs = data.items.map((item) => ({
          name: item.track.name,
          artist: item.track.artists.map((artist) => artist.name).join(", "),
          album: item.track.album.name,
          image: item.track.album.images[0]?.url,
          url: item.track.external_urls.spotify,
        }));

        console.log("Top Songs:", songs);
        return songs;
      } else {
        console.log("data", data);
      }
    } catch (error) {
      console.log("Error fetching top songs", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <Button
          title="get top songs"
          onPress={() => getTopSongs()}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
