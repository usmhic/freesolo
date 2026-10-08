import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Same palette as web/lib/listings.ts `coverGradient`, so a listing without a
// photo gets the same cover on the site and in the app.
const COVERS: [string, string][] = [
  ["#2B2118", "#B8976A"],
  ["#1E2A24", "#6B8F71"],
  ["#1B2633", "#4A7FA5"],
  ["#2E1A12", "#8B4513"],
  ["#231F2E", "#8A7FA8"],
  ["#2A2420", "#C9A27A"],
];

export function coverColors(id: string): [string, string] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COVERS[h % COVERS.length];
}

/** The host's photo when there is one; otherwise a gradient with the listing's emoji. */
export function ListingCover({
  listing,
  style,
  emojiSize = 44,
  children,
}: {
  listing: { id: string; emoji?: string | null; coverImage?: string | null };
  style?: ViewStyle;
  emojiSize?: number;
  children?: React.ReactNode;
}) {
  return (
    <View style={[styles.wrap, style]}>
      {listing.coverImage ? (
        <Image source={{ uri: listing.coverImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={coverColors(listing.id)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.center]}
        >
          <Text style={{ fontSize: emojiSize }}>{listing.emoji ?? "🧭"}</Text>
        </LinearGradient>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", position: "relative" },
  center: { alignItems: "center", justifyContent: "center" },
});
