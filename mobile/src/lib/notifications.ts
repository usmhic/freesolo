import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiFetch } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  // expo-device may not be installed — check safely
  let isDevice = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Device = require("expo-device");
    isDevice = Device.isDevice;
  } catch { /* not installed, assume physical device */ }

  if (!isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "FreeSolo",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#C4A882",
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token     = tokenData.data;
    await apiFetch("/api/users/me/push-token", {
      method: "POST",
      body:   JSON.stringify({ token }),
    });
    return token;
  } catch (e) {
    console.error("Push token registration failed:", e);
    return null;
  }
}
