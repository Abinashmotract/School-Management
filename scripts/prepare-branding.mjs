#!/usr/bin/env node
/**
 * Downloads school splash/icon into assets/branding before `eas build`.
 * Env: SCHOOL_SPLASH_URL, SCHOOL_ICON_URL
 */
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "branding");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    client
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlink(dest, () => undefined);
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (!res.statusCode || res.statusCode >= 400) {
          file.close();
          fs.unlink(dest, () => undefined);
          reject(new Error(`Download failed ${url} (${res.statusCode})`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(dest, () => undefined);
        reject(err);
      });
  });
}

async function main() {
  ensureDir(OUT_DIR);
  const splashUrl = process.env.SCHOOL_SPLASH_URL || "";
  const iconUrl = process.env.SCHOOL_ICON_URL || "";

  const tryDownload = async (url, dest, label) => {
    if (!/^https?:\/\//i.test(url)) return;
    try {
      const p = await download(url, dest);
      console.log(`${label} ->`, p);
    } catch (err) {
      console.warn(`${label} download failed, using default asset:`, err?.message || err);
      try {
        if (fs.existsSync(dest) && fs.statSync(dest).size === 0) fs.unlinkSync(dest);
      } catch {
        // ignore
      }
    }
  };

  await tryDownload(splashUrl, path.join(OUT_DIR, "splash.png"), "splash");
  await tryDownload(iconUrl, path.join(OUT_DIR, "icon.png"), "icon");

  if (!splashUrl && !iconUrl) {
    console.log("No SCHOOL_SPLASH_URL / SCHOOL_ICON_URL — using default assets");
  } else {
    console.log("Branding prepare done");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
