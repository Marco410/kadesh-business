/**
 * Traduce un user agent a algo legible: sistema, navegador y tipo de dispositivo.
 * Hecho a mano (sin librerías) para no crecer el worker de Cloudflare; cubre lo que usa la gente
 * de Kadesh: Windows, macOS, iOS/iPadOS, Android, Linux y ChromeOS; Chrome, Safari, Edge,
 * Firefox, Samsung Internet, Opera, los navegadores dentro de Facebook/Instagram/WhatsApp y la
 * app móvil (`KadeshPet/<versión>`, o el cliente HTTP de Expo si no lo manda).
 */

export type DeviceKind = "phone" | "tablet" | "desktop" | "unknown";

export type UserAgentInfo = {
  /** "Windows 10/11", "macOS 10.15", "iOS 17.5", "Android 14"… */
  os: string | null;
  /** "Chrome 141", "Safari 18", "Dentro de Instagram"… */
  browser: string | null;
  device: DeviceKind;
  /** "Teléfono", "Tableta", "Computadora". */
  deviceLabel: string | null;
};

const DEVICE_LABELS: Record<DeviceKind, string | null> = {
  phone: "Teléfono",
  tablet: "Tableta",
  desktop: "Computadora",
  unknown: null,
};

function major(version: string | undefined): string {
  return version ? version.split(".")[0] : "";
}

function withVersion(name: string, version: string | undefined): string {
  const v = major(version);
  return v ? `${name} ${v}` : name;
}

function detectOs(ua: string): string | null {
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Windows NT ([\d.]+)/))) {
    const map: Record<string, string> = {
      "10.0": "Windows 10/11",
      "6.3": "Windows 8.1",
      "6.2": "Windows 8",
      "6.1": "Windows 7",
    };
    return map[m[1]] ?? "Windows";
  }
  if ((m = ua.match(/(?:iPhone|iPod).*?OS (\d+)[_.](\d+)/))) return `iOS ${m[1]}.${m[2]}`;
  if ((m = ua.match(/iPad.*?OS (\d+)[_.](\d+)/))) return `iPadOS ${m[1]}.${m[2]}`;
  if ((m = ua.match(/Android ([\d.]+)/))) return withVersion("Android", m[1]);
  if (/CrOS/.test(ua)) return "ChromeOS";
  if ((m = ua.match(/Mac OS X (\d+)[_.](\d+)/))) return `macOS ${m[1]}.${m[2]}`;
  if (/Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  if (/okhttp/i.test(ua)) return "Android";
  if (/CFNetwork|Darwin/.test(ua)) return "iOS";
  return null;
}

function detectBrowser(ua: string): string | null {
  let m: RegExpMatchArray | null;
  // App móvil: `KadeshPet/1.4.0 (iPhone; iOS 17.5)` o `KadeshPet/1.4.0 (Linux; Android 14; SM-S918B; Mobile)`.
  if ((m = ua.match(/KadeshPet\/([\d.]+)/))) return `App Kadesh Pet ${m[1]}`;
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return "Dentro de Facebook";
  if (/Instagram/.test(ua)) return "Dentro de Instagram";
  if (/WhatsApp/.test(ua)) return "Dentro de WhatsApp";
  if (/TikTok|BytedanceWebview|musical_ly/i.test(ua)) return "Dentro de TikTok";
  if (/Expo|okhttp|CFNetwork/i.test(ua) && !/Mozilla/.test(ua)) return "App de Kadesh";
  if ((m = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/))) return withVersion("Edge", m[1]);
  if ((m = ua.match(/(?:OPR|Opera)\/([\d.]+)/))) return withVersion("Opera", m[1]);
  if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return withVersion("Samsung Internet", m[1]);
  if ((m = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/))) return withVersion("Firefox", m[1]);
  if ((m = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/))) return withVersion("Chrome", m[1]);
  if ((m = ua.match(/Version\/([\d.]+).*Safari/))) return withVersion("Safari", m[1]);
  if (/Safari/.test(ua)) return "Safari";
  if (/; wv\)/.test(ua)) return "WebView";
  return null;
}

function detectDevice(ua: string): DeviceKind {
  if (/iPad|Tablet|PlayBook|Silk/.test(ua)) return "tablet";
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|okhttp/i.test(ua)) return "phone";
  if (/Windows NT|Macintosh|CrOS|X11|Linux/.test(ua)) return "desktop";
  return "unknown";
}

export function describeUserAgent(ua: string | null | undefined): UserAgentInfo {
  if (!ua) return { os: null, browser: null, device: "unknown", deviceLabel: null };
  const device = detectDevice(ua);
  return {
    os: detectOs(ua),
    browser: detectBrowser(ua),
    device,
    deviceLabel: DEVICE_LABELS[device],
  };
}

/** "Windows 10/11 · Chrome 141", o `null` si no se reconoce nada. */
export function userAgentSummary(ua: string | null | undefined): string | null {
  const info = describeUserAgent(ua);
  const parts = [info.os, info.browser].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
