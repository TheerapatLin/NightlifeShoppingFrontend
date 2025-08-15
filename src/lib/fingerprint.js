// lib/fingerprint.js
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const KEY = "device_fingerprint_v1";

export async function getDeviceFingerprint() {
  const cached = localStorage.getItem(KEY);
  if (cached) return cached; // ใช้ของเดิมก่อน

  const fp = await FingerprintJS.load();
  const { visitorId } = await fp.get();

  localStorage.setItem(KEY, visitorId); // เก็บไว้ใช้ครั้งต่อไป
  return visitorId;
}
