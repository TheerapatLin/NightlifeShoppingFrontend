import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
      const response = await axios.post(
        `${BASE_URL}/auth/refresh-web`,
        { fingerprint: "12345678" },
        {
          headers: {
            "Content-Type": "application/json",
            "device-fingerprint": "12345678",
            businessId: "1",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUser(response.data.data.user);
        return true; // ✅ เพิ่ม return
      } else {
        setIsLoggedIn(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  };

  const login = async (userData) => {
    setIsLoggedIn(true);
    console.log("User Data:", userData);
    await checkAuthStatus();
  };

  const refreshToken = async () => {
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      // console.log(`try to refresh-token : ${BASE_URL}/auth/refresh-web`);
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-web`,
          {
            fingerprint: "12345678",
          },
          {
            headers: {
              "Content-Type": "application/json",
              "device-fingerprint": "12345678",
              businessId: "1",
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setIsLoggedIn(true);
          setUser(response.data.data.user);
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
        console.log("ไม่สำเร็จ");
        isRefreshingToken = false;
      }
    }
  };

  const logout = async () => {
    try {
      // await axios.post(`${BASE_URL}/auth/logout-web`, {
      //   withCredentials: true,
      // });

      const response = await axios.post(
        `${BASE_URL}/auth/logout`,
        {
          fingerprint: "12345678",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "device-fingerprint": "12345678",
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
