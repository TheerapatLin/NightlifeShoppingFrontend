// TopNavigation.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown_link_lang from "./Dropdown_link-lang";
import Dropdown_lang_currency from "./Dropdown_lang-currency";
import Dropdown_Business_customers from "./Dropdown_Business-customers";
import { useGlobalEvent } from "../context/GlobalEventContext";
import ThinBag from "../Helpers/icons/ThinBag";
import Cart from "../pages/Cart";
import { useCart } from "../context/CartContext";
import Nightlife1 from "../img/NightLife_logo_1.png";
import Nightlife1_long1 from "../img/NightLife_logo_1.png";

import axios from "axios";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { getDeviceFingerprint } from "../lib/fingerprint";

const TopNavigation = ({ duration = "0.6s", type = 3 }) => {
  const [isCartVisible, setCartIsVisible] = useState(false);
  const { isScrolled, currentPage, updateCurrentPage, windowSize } =
    useGlobalEvent();
  const location = useLocation();
  const [totalNumber, setTotalNumber] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { cart, getTotalQuantity } = useCart();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [hasUserDeals, setHasUserDeals] = useState(false);
  const [isDealPromptVisible, setIsDealPromptVisible] = useState(false);
  const [hidePromptTimer, setHidePromptTimer] = useState(null);
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const isAtThePageThatShowsDeal =
    location.pathname === "/profile" ||
    location.pathname.startsWith("/activityDetails");
  const [isProfileHover, setIsProfileHover] = useState(false);

  const styles = {
    menuItem: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "15px",
      margin: "0px 10px 0px 0px",
      height: "40px",
      textDecoration: "none",
      transition: `all ${duration} ease`,
    },
    selected: {
      color: "white",
      backgroundColor: "transparent",
      textDecoration: "underline",
      fontWeight: "bold",
    },
    unselected: {
      color: "gray",
      backgroundColor: "transparent",
      textDecoration: "none",
      fontWeight: "normal",
    },
  };

  const handleLogout = async () => {
    localStorage.removeItem("appliedDiscountCode");
    localStorage.removeItem("discountCodeTimestamp");
    await logout();
    navigate("/");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  const expandPromptWithTimeout = () => {
    setIsPromptExpanded(true);

    if (hidePromptTimer) clearTimeout(hidePromptTimer);

    const timer = setTimeout(() => {
      // ✅ ปล่อยให้ DOM มีเวลาคิด แล้วค่อย animate
      requestAnimationFrame(() => {
        setIsPromptExpanded(false);
      });
    }, 4000);

    setHidePromptTimer(timer);
  };

  useEffect(() => {
    if (hasUserDeals && isLoggedIn && !isAtThePageThatShowsDeal) {
      setIsDealPromptVisible(true);
      setIsPromptExpanded(true);

      const timer = setTimeout(() => {
        setIsPromptExpanded(false); // shrink after 4s
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [hasUserDeals, isLoggedIn, isAtThePageThatShowsDeal]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // ดึง user id จาก context ในสโคปนี้ (ไม่พึ่งตัวแปรชื่อ userId ภายนอก)
        const uid = user?.userId || user?._id || user?.user?._id;
        if (!isLoggedIn || !uid) {
          if (!cancelled) setHasUserDeals(false);
          return;
        }

        // ถ้ายังไม่ได้ทำ interceptor ให้ใส่ header เอง
        const fp = await getDeviceFingerprint();

        const res = await axios.get(`${BASE_URL}/user-deal/${uid}`, {
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        });

        if (!cancelled) {
          setHasUserDeals(Array.isArray(res.data) && res.data.length > 0);
        }
      } catch (err) {
        if (!cancelled) setHasUserDeals(false);
        console.error("Error checking user deals:", err?.response?.data || err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, user]); // ✅ ผูกกับ user แทน userId ที่หายไป

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lang =
      params.get("lang") ??
      localStorage.getItem("language") ??
      navigator.language.split("-")[0];

    if (lang.startsWith("en") || lang.startsWith("th")) {
      changeLanguage(lang.split("-")[0]);
    }

    // Remove the language parameter from the URL
    if (params.has("lang")) {
      params.delete("lang");
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setIsDrawerOpen(false); // ✅ ปิด drawer เมื่อเปลี่ยนหน้า

    const path = location.pathname;
    if (path === "/") {
      updateCurrentPage("", 1);
    } else if (path === "/globalwarming") {
      updateCurrentPage("globalwarming", 2);
    } else if (path === "/Activity") {
      updateCurrentPage("Activity", 2);
    } else if (path === "/volunteer") {
      updateCurrentPage("volunteer", 3);
    } else if (path === "/handicap") {
      updateCurrentPage("handicap", 4);
    } else if (path === "/news") {
      updateCurrentPage("news", 5);
    } else if (path === "/certificate") {
      updateCurrentPage("certificate", 6);
    } else if (path === "/profile") {
      updateCurrentPage("profile", 7);
    }
  }, [location.pathname]);

  return (
    <>
      <div style={{ zIndex: "10000000" }}>
        <div className={`top-navigation ${isScrolled ? "scrolled" : ""}`}>
          {windowSize.width > 768 ? (
            <div className="container">
              <div style={{ height: "10px" }}>
                <nav className="menu-bar">
                  {/* <div className="group" style={{ display: "flex", flexDirection: "row" }}>
                  <Dropdown_lang_currency />
                  <Dropdown_link_lang />
                </div> */}
                </nav>
              </div>

              <div style={{ height: "50px" }}>
                <nav
                  className={`menu-bar ${
                    isScrolled ? "scrolled" : "not-scrolled"
                  }`}
                >
                  <div
                    className="group"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      width: "100%",
                      height: "20px",
                      padding: "0px",
                      margin: "0px",
                    }}
                  >
                    <div
                      style={{
                        width: "300px",
                        height: "200%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={Nightlife1}
                        alt="Logo HealWorld"
                        style={{ height: "35px" }}
                      />
                    </div>
                    {/* <div style={{ width: "50px", height: "200%", display: "flex", justifyContent: "center" }}>
                    <div className="vertical-divider"></div>
                  </div> */}
                    <Link
                      to="/"
                      className={`item02 ${
                        currentPage.name === "" ? "active" : ""
                      }`}
                      style={styles.menuItem}
                    >
                      Home
                    </Link>
                    {/* <Link
                    to="/Activity"
                    className={`item02 ${
                      currentPage.name === "Activity" ? "active" : ""
                    }`}
                    style={styles.menuItem}
                  >
                    Activity
                  </Link> */}
                    {/* {isLoggedIn && user?.role === "admin" && (
                      <Link
                        to="/certificate"
                        className={`item02 ${
                          currentPage.name === "certificate" ? "active" : ""
                        }`}
                        style={styles.menuItem}
                      >
                        Certificate
                      </Link>
                    )} */}
                    <div className="ml-auto" />
                    <div
                      style={{
                        ...styles.menuItem,
                      }}
                      className="lg:mr-6"
                    >
                      {isLoggedIn ? (
                        <>
                          <Link
                            to={"/profile"}
                            onMouseEnter={() => setIsProfileHover(true)}
                            onMouseLeave={() => setIsProfileHover(false)}
                            style={{
                              ...styles.menuItem,
                              color: isProfileHover ? "#00FF66" : "white",
                              textDecoration: isProfileHover
                                ? "underline"
                                : "none",
                              transition:
                                "color 0.2s ease, text-decoration 0.2s ease",
                            }}
                            className={`item02 ${
                              currentPage.name === "profile" ? "active" : ""
                            }`}
                          >
                            <FaUser
                              className="text-lg"
                              style={{
                                color: isProfileHover ? "#00FF66" : "white",
                              }}
                            />
                            <span
                              style={{
                                color: isProfileHover ? "#00FF66" : "white",
                                textDecoration: isProfileHover
                                  ? "underline"
                                  : "none",
                              }}
                            >
                              {user?.name || "ผู้ใช้"}
                            </span>
                          </Link>

                          <a
                            href="#"
                            className=" px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 no-underline"
                            onClick={handleLogout}
                          >
                            Logout
                          </a>
                        </>
                      ) : (
                        <Link
                          to="/signup"
                          className="item02"
                          style={{ ...styles.menuItem, width: "100%" }}
                        >
                          {i18n.language === "en"
                            ? "Login/Register"
                            : "เข้าสู่ระบบ/ลงทะเบียน"}
                        </Link>
                      )}
                    </div>
                    <div style={styles.menuItem}>
                      <button
                        onClick={() => changeLanguage("en")}
                        style={
                          i18n.language === "en"
                            ? styles.selected
                            : styles.unselected
                        }
                      >
                        EN
                      </button>
                      <button
                        onClick={() => changeLanguage("th")}
                        style={
                          i18n.language === "th"
                            ? styles.selected
                            : styles.unselected
                        }
                      >
                        TH
                      </button>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          ) : (
            <div
              style={{
                flexDirection: "column",
                padding: "0px",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                className="group"
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "auto",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "8px",
                    margin: "0px",
                  }}
                >
                  <Link to="/">
                    <img
                      src={Nightlife1_long1}
                      alt="Logo HealWorld"
                      style={{ padding: "2px", height: "40px" }}
                    />
                  </Link>
                </div>
                <div style={{ backgroundColor: "transparent" }}>
                  <button
                    onClick={() => changeLanguage("en")}
                    style={
                      i18n.language === "en"
                        ? styles.selected
                        : styles.unselected
                    }
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage("th")}
                    style={
                      i18n.language === "th"
                        ? styles.selected
                        : styles.unselected
                    }
                  >
                    TH
                  </button>
                </div>
                <div
                  style={{
                    minWidth: "50px",
                    fontSize: "40px",
                    color: "rgb(100,100,255)",
                  }}
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                >
                  ☰
                </div>
              </div>
            </div>
          )}
        </div>
        {windowSize.width <= 768 && (
          <div
            className={`drawer ${isScrolled ? "scrolled" : ""}`}
            style={{ left: !isDrawerOpen ? windowSize.width : "0px" }}
          >
            <Link
              to="/"
              className={`item02_m ${currentPage.name === "" ? "active" : ""}`}
            >
              <span style={{ fontSize: "18px" }}>Home</span>
            </Link>

            {/* <Link
            to="/Activity"
            className={`item02_m ${
              currentPage.name === "Activity" ? "active" : ""
            }`}
          >
            Activity
          </Link> */}

            {isLoggedIn ? (
              <div className="flex flex-col justify-center items-center">
                <Link
                  to={"/profile"}
                  className={`${
                    currentPage.name === "profile" ? "active" : ""
                  }`}
                  style={{
                    ...styles.menuItem,
                    margin: "10px",
                    fontWeight: "bold",
                  }}
                >
                  <FaUser className="text-lg text-black " />
                  <span className=" text-black" style={{ fontSize: "24px" }}>
                    {user?.name || "ผู้ใช้"}
                  </span>
                </Link>

                <a
                  href="#"
                  className="inline-block px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 no-underline"
                  onClick={handleLogout}
                >
                  Logout
                </a>
              </div>
            ) : (
              <Link
                to="/signup"
                className="item02"
                style={{ ...styles.menuItem, fontSize: "20px" }}
              >
                {i18n.language === "en" ? "Login" : "เข้าสู่ระบบ/ลงทะเบียน"}
              </Link>
            )}
          </div>
        )}
      </div>
      {windowSize.width <= 768 && isDealPromptVisible && (
        <div
          onClick={() => {
            if (!isPromptExpanded) {
              expandPromptWithTimeout(); // ✅ ขยายและเริ่มนับใหม่
            } else {
              if (hidePromptTimer) clearTimeout(hidePromptTimer); // ยกเลิกก่อน navigate
              navigate("/profile?tab=userdeal");
            }
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: 0,
            transform: `
    ${
      hasUserDeals && isLoggedIn && !isAtThePageThatShowsDeal
        ? isPromptExpanded
          ? "translateX(0%) scaleX(1)"
          : "translateX(75%) scaleX(1)"
        : "translateX(120%) scaleX(1)"
    }
  `,
            transformOrigin: "right center", // 🔥 หดจากด้านขวา
            transition: "transform 0.4s ease",
            willChange: "transform",
            backgroundColor: "white",
            color: "black",
            padding: "10px 16px", // ✅ ไม่ต้องเปลี่ยนขนาด padding
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: "50px",
            borderBottomLeftRadius: "50px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          🎟{" "}
          <span
            style={{
              opacity: isPromptExpanded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            {t("profile.purchasedDeals")}
          </span>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
