import { saveStudentPushToken } from "@/lib/student-portal-api";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function syncStudentPush(enabled: boolean) {
  if (!enabled) {
    return;
  }
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Notification permission was not granted.");
  }
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  await saveStudentPushToken({
    token: token.data,
    platform: Platform.OS,
    enabled: true,
  });
}
