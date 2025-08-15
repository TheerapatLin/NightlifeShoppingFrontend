import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { getDeviceFingerprint } from "../lib/fingerprint";
//import { useNavigate } from "react-router-dom";

export const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  //let navigate = useNavigate();
  const [csrfToken, setCsrfToken] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fingerprint, setFingerprint] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

  const fetchCsrfToken = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/login`, {
        withCredentials: true,
      });
      setCsrfToken(response.data.csrfToken);
      axios.defaults.headers.common[
        "X-CSRF-Token"
      ] = `${response.data.csrfToken}`;
      axios.defaults.withCredentials = true;
    } catch (err) {
      console.error("Error fetching CSRF token:", err);
    }
  };

  const getFingerprint = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    setFingerprint(result.visitorId);
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/refresh-web`,
        {},
        { withCredentials: true }
      );
      setAccessToken(response.data.data.tokens.accessToken);
      setIsLoggedIn(true);
      console.log("new Access Token : ", response.data.data.tokens.accessToken);
    } catch (err) {
      console.error("Error refreshing access token : ", err);
      setIsLoggedIn(false);
      // จัดการกรณีไม่สามารถรีเฟรช token ได้ (อาจต้องล็อกเอาต์)
    }
  };

  const logout = async (navigate) => {
    try {
      const fp = await getDeviceFingerprint();
      const response = await axios.post(
        `${BASE_URL}/auth/logout-web`,
        {
          fingerprint: fp,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "device-fingerprint": fp,
            businessId: "1",
          },
          withCredentials: true,
        }
      );
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const startAll = async () => {
    await fetchCsrfToken();
    await getFingerprint();
    await refreshAccessToken();
  };

  useEffect(() => {
    startAll();
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        csrfToken,
        fingerprint,
        accessToken,
        isLoggedIn,
        setIsLoggedIn,
        logout,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};
