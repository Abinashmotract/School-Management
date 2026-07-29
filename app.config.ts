import type { ConfigContext, ExpoConfig } from "expo/config";
import fs from "fs";
import path from "path";

const ROOT = __dirname;
const BRANDING_DIR = path.join(ROOT, "assets", "branding");

function brandingOrFallback(fileName: string, fallbackRelative: string) {
  const branded = path.join(BRANDING_DIR, fileName);
  if (fs.existsSync(branded) && fs.statSync(branded).size > 0) {
    return `./assets/branding/${fileName}`;
  }
  return fallbackRelative.startsWith("./") ? fallbackRelative : `./${fallbackRelative}`;
}

/**
 * Sync config only — Expo CLI here does not accept Promise-returning app.config.
 * Branding images are prepared by `scripts/prepare-branding.mjs` before `eas build`.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const appName = process.env.SCHOOL_APP_NAME || "SchoolAppF";
  const slug = process.env.SCHOOL_SLUG || "SchoolAppF";
  const scheme = process.env.SCHOOL_SCHEME || "schoolappf";
  const androidPackage = process.env.SCHOOL_ANDROID_PACKAGE || "com.edvanceos.schoolapp";
  const iosBundleId = process.env.SCHOOL_IOS_BUNDLE_ID || "com.edvanceos.schoolapp";
  const apiUrl =
    process.env.SCHOOL_API_URL || process.env.EXPO_PUBLIC_API_URL || "https://api.edvanceos.com/api";
  const projectId = process.env.EAS_PROJECT_ID || "d3c1f79d-9091-468c-8a8c-15c5eb8da623";
  const institutionId = process.env.SCHOOL_INSTITUTION_ID || "";

  const icon = brandingOrFallback("icon.png", "./assets/images/icon.png");
  const splash = brandingOrFallback("splash.png", "./assets/images/splash-icon.png");

  return {
    ...config,
    name: appName,
    slug,
    version: "1.0.0",
    orientation: "portrait",
    icon,
    scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: iosBundleId,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: icon,
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: androidPackage,
      usesCleartextTraffic: true,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: splash,
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiUrl,
      institutionId,
      router: {},
      eas: {
        projectId,
      },
    },
  };
};
