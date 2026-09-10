import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Fonts, Spacing } from "../theme";

/**
 * Expo Go-safe wrapper around react-native-maps.
 *
 * react-native-maps is a native module that Expo Go does not bundle, so a
 * plain `import ... from "react-native-maps"` throws while the module graph is
 * still loading. Both map screens are imported eagerly by AppNavigator, which
 * means that throw happens during startup and closes the app before anything
 * renders. Resolving it defensively keeps Expo Go usable — the maps themselves
 * still need a development build.
 */
let Maps: any = null;
try {
  Maps = require("react-native-maps");
} catch {
  Maps = null;
}

const NativeMapView = Maps?.default ?? null;

export const MapsAvailable: boolean = !!NativeMapView;

function MapPlaceholder({ style }: { style?: any }) {
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.emoji}>🗺️</Text>
      <Text style={styles.title}>Map unavailable here</Text>
      <Text style={styles.body}>Maps need a development build — they don't run inside Expo Go.</Text>
    </View>
  );
}

export const MapView = React.forwardRef<any, any>(function MapView(props, ref) {
  if (!NativeMapView) return <MapPlaceholder style={props.style} />;
  return <NativeMapView ref={ref} {...props} />;
});

const Noop = () => null;

export const Marker  = Maps?.Marker  ?? Noop;
export const Callout = Maps?.Callout ?? Noop;

export default MapView;

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.sand,
    padding: Spacing.lg,
  },
  emoji: { fontSize: 40, marginBottom: Spacing.sm },
  title: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.ink },
  body:  {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.muted,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
