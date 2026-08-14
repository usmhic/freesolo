import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Fonts, Spacing, Radius, Shadow } from "../theme";
import { apiFetch } from "../lib/api";

// Shared
import SplashScreen from "../screens/shared/SplashScreen";
import WhoScreen from "../screens/shared/WhoScreen";
// Auth
import HowItWorksScreen from "../screens/auth/HowItWorksScreen";
import TravelerEntryScreen from "../screens/auth/TravelerEntryScreen";
import ApplyScreen from "../screens/auth/ApplyScreen";
import AppliedScreen from "../screens/auth/AppliedScreen";
import SignInScreen from "../screens/auth/SignInScreen";
// Business
import BusinessOnboardingScreen from "../screens/business/BusinessOnboardingScreen";
import BusinessDashboardScreen from "../screens/business/BusinessDashboardScreen";
// Traveler
import FeedScreen from "../screens/traveler/FeedScreen";
import ExperienceDetailScreen from "../screens/traveler/ExperienceDetailScreen";
import BookingScreen from "../screens/traveler/BookingScreen";
import PaymentScreen from "../screens/traveler/PaymentScreen";
import ConfirmedScreen from "../screens/traveler/ConfirmedScreen";
import CreateExperienceScreen from "../screens/traveler/CreateExperienceScreen";
import ProfileScreen from "../screens/traveler/ProfileScreen";
import NotificationsScreen from "../screens/traveler/NotificationsScreen";
import ExploreMapScreen from "../screens/traveler/ExploreMapScreen";
import TravelPlanScreen from "../screens/traveler/TravelPlanScreen";
import UserProfileScreen from "../screens/traveler/UserProfileScreen";
import RateExperienceScreen from "../screens/traveler/RateExperienceScreen";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab icon with optional badge ──────────────────────────────────────────────
function TabIcon({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.38 }}>{emoji}</Text>
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Explore wrapper — forwards trip-plan params (city, filter) to FeedScreen ──
function ExploreWrapper({ navigation, route }: any) {
  const { city = "Lisbon", filter } = route?.params ?? {};
  return <FeedScreen navigation={navigation} route={{ params: { city, filter } }} />;
}

// ── Bottom tab navigator ──────────────────────────────────────────────────────
function TravelerTabs() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const poll = async () => {
      const { data } = await apiFetch<any[]>("/api/notifications");
      if (Array.isArray(data)) setUnread(data.filter((n: any) => !n.read).length);
    };
    poll();
    const interval = setInterval(poll, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreWrapper}
        options={{ title: "Explore", tabBarIcon: (({ focused }: { focused: boolean }) => <TabIcon emoji="🌍" focused={focused} />) as any }}
      />
      <Tab.Screen
        name="Map"
        component={ExploreMapScreen}
        options={{ title: "Map", tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="🗺️" focused={focused} /> }}
      />
      <Tab.Screen
        name="Host"
        component={CreateExperienceScreen}
        options={{ title: "Host", tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="＋" focused={focused} /> }}
      />
      <Tab.Screen
        name="Notifs"
        component={NotificationsScreen}
        options={{ title: "Alerts", tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="🔔" focused={focused} badge={unread} /> }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{ title: "Profile", tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon emoji="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ── Root stack ────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
      <Stack.Screen name="Splash"              component={SplashScreen} />
      <Stack.Screen name="Who"                 component={WhoScreen} />
      <Stack.Screen name="HowItWorks"          component={HowItWorksScreen} />
      <Stack.Screen name="TravelerEntry"       component={TravelerEntryScreen} />
      <Stack.Screen name="Apply"               component={ApplyScreen} />
      <Stack.Screen name="Applied"             component={AppliedScreen} />
      <Stack.Screen name="SignIn"              component={SignInScreen} />
      <Stack.Screen name="BusinessOnboarding"  component={BusinessOnboardingScreen} />
      <Stack.Screen name="BusinessDashboard"   component={BusinessDashboardScreen} />
      {/* Post sign-in trip setup */}
      <Stack.Screen name="TravelPlan"          component={TravelPlanScreen} />
      {/* Authenticated app (bottom tabs) */}
      <Stack.Screen name="Main"                component={TravelerTabs} />
      {/* Modal-style screens */}
      <Stack.Screen name="ExperienceDetail"    component={ExperienceDetailScreen}   options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Booking"             component={BookingScreen}            options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="Payment"             component={PaymentScreen}            options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="Confirmed"           component={ConfirmedScreen}          options={{ animation: "fade" }} />
      <Stack.Screen name="CreateExperience"    component={CreateExperienceScreen} />
      <Stack.Screen name="Notifications"       component={NotificationsScreen} />
      <Stack.Screen name="ExploreMap"          component={ExploreMapScreen}         options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="UserProfile"         component={UserProfileScreen}        options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="RateExperience"      component={RateExperienceScreen}     options={{ animation: "slide_from_bottom" }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.sand,
    height: 84,
    paddingBottom: 20,
    paddingTop: 10,
    ...Shadow.sm,
  },
  tabLabel: { fontFamily: Fonts.bodyMedium, fontSize: 10, marginTop: 2 },
  badge: {
    position: "absolute", top: -4, right: -10,
    backgroundColor: Colors.danger,
    borderRadius: Radius.full, minWidth: 16, height: 16,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
  },
  badgeText: { color: Colors.white, fontSize: 9, fontFamily: Fonts.bodySemiBold },
});
