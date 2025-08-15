// src/lib/api.js
import axios from "axios";
import { getDeviceFingerprint } from "./fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ใส่ header ให้ทุก request
api.interceptors.request.use(async (config) => {
  const fp = await getDeviceFingerprint();
  config.headers = {
    ...(config.headers || {}),
    "device-fingerprint": fp,
    // ถ้า backend ต้องใช้ businessId ติดทุกครั้ง ใส่ตรงนี้เลย
    businessId: "1",
  };
  return config;
});

export default api;
