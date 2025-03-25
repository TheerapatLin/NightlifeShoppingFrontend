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
    await logout();
    navigate("/");
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

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
    <div style={{zIndex: '10000000'}}>
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
                  {isLoggedIn && user?.role === "admin" && (
                    <Link
                      to="/certificate"
                      className={`item02 ${
                        currentPage.name === "certificate" ? "active" : ""
                      }`}
                      style={styles.menuItem}
                    >
                      Certificate
                    </Link>
                  )}
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
                          style={{
                            ...styles.menuItem,
                          }}
                          className={`item02 ${
                            currentPage.name === "profile" ? "active" : ""
                          }`}
                        >
                          <FaUser className="text-lg text-black " />

                          <span className=" text-black">
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
                  width: "auto",
                  height: "100%",
                  justifyContent: "start",
                  alignItems: "start",
                  padding: "8px",
                  margin: "0px",
                }}
              >
                <Link to="/">
                  <img
                    src={Nightlife1_long1}
                    alt="Logo HealWorld"
                    style={{ padding: "2px", height: "90%" }}
                  />
                </Link>
              </div>
              <div style={{ backgroundColor: "transparent" }}>
                <button
                  onClick={() => changeLanguage("en")}
                  style={
                    i18n.language === "en" ? styles.selected : styles.unselected
                  }
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("th")}
                  style={
                    i18n.language === "th" ? styles.selected : styles.unselected
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
          {/* <a href="jaideeipos://ipos/acrossPrintPage?orderId=1233-dsfds-21&businessId=3432403-334-sdsd">
            เปิดแอป JaideeIPOS แบบมี
          </a> */}
          <Link
            to="/"
            className={`item02_m ${currentPage.name === "" ? "active" : ""}`}
          >
            Home
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
                style={styles.menuItem}
                className={`${currentPage.name === "profile" ? "active" : ""}`}
              >
                <FaUser className="text-lg text-black " />
                <span className=" text-black">{user?.name || "ผู้ใช้"}</span>
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
            <Link to="/signup" className="item02" style={styles.menuItem}>
              {i18n.language === "en" ? "Login" : "เข้าสู่ระบบ/ลงทะเบียน"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TopNavigation;
