import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getDeviceFingerprint } from "../lib/fingerprint";

const AuthContext = createContext();

var isRefreshingToken = false;
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [affiliate, setAffiliate] = useState(() => {
    return localStorage.getItem("affiliate") || null;
  });
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

  const checkAuthStatus = async () => {
    try {
      console.log("checkAuthStatus");
      const fp = await getDeviceFingerprint();
      const response = await axios.post(
        `${BASE_URL}/auth/refresh-web`,
        { fingerprint: fp },
        {
          headers: {
            "Content-Type": "application/json",
            "device-fingerprint": fp,
            businessId: "1",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUser(response.data.data.user);
        
        // ✅ อัพเดต localStorage ถ้ามี token ใหม่มาจาก response
        if (response.data.data.tokens?.accessToken) {
          localStorage.setItem("accessToken", response.data.data.tokens.accessToken);
        }
        if (response.data.data.tokens?.refreshToken) {
          localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken);
        }
        
        return true; // ✅ เพิ่ม return
      } else {
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      console.log(`checkAuthStatus error: ${error}`);
      return false;
    }
  };

  const login = async (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    console.log("User Data:", userData);
    // ❌ ไม่เรียก checkAuthStatus() ระหว่าง login เพราะจะทำให้เกิด token mismatch
    await checkAuthStatus();
  };

  const refreshToken = async () => {
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      try {
        // ✅ ให้ใช้ cookie แทน localStorage เพื่อความ sync
        // const accessToken = localStorage.getItem("accessToken");
        // const refreshToken = localStorage.getItem("refreshToken");
        const role = localStorage.getItem("role");

        const fp = await getDeviceFingerprint();
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-web`,
          {
            fingerprint: fp,
            role: role,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "device-fingerprint": fp,
              businessId: "1",
              // ❌ ลบ Authorization header ออก ให้ใช้ cookie แทน
              // Authorization: `Bearer ${accessToken}`,
              // refreshToken: refreshToken,
            },
            withCredentials: true,
          }
        );
        
        if (response.status === 200) {
          setIsLoggedIn(true);
          setUser(response.data.data.user);
          console.log("200 refreshToken data.user:", response.data.data.user);
          
          // ✅ อัพเดต localStorage ถ้ามี token ใหม่มาจาก response
          if (response.data.data.tokens?.accessToken) {
            localStorage.setItem("accessToken", response.data.data.tokens.accessToken);
          }
          if (response.data.data.tokens?.refreshToken) {
            localStorage.setItem("refreshToken", response.data.data.tokens.refreshToken);
          }
          
          // ❌ ไม่เรียก checkAuthStatus() เพิ่มเพราะจะทำให้เกิด infinite loop
          await checkAuthStatus();
          isRefreshingToken = false;
        } else {
          setIsLoggedIn(false);
          setUser(null);
          isRefreshingToken = false;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        setIsLoggedIn(false);
        setUser(null);
        console.log("refreshToken ไม่สำเร็จ");
        isRefreshingToken = false;
      }
    }
  };

  const logout = async () => {
    try {
      // await axios.post(`${BASE_URL}/auth/logout-web`, {
      //   withCredentials: true,
      // });
      const fp = await getDeviceFingerprint();
      const response = await axios.post(
        `${BASE_URL}/auth/logout`,
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
      setUser(null);
      //window.location.reload();
      navigate("/");
      console.log("logout success");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const updateAffiliate = (newAffiliate) => {
    setAffiliate(newAffiliate);
    if (newAffiliate) {
      localStorage.setItem("affiliate", newAffiliate);
    } else {
      localStorage.removeItem("affiliate");
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        user,
        refreshToken,
        checkAuthStatus,
        affiliate,
        setAffiliate: updateAffiliate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
