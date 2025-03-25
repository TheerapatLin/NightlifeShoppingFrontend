// TopNavigation.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Nightlife1 from "../img/NightLife_logo_1.png";
import Dropdown_link_lang from "./Dropdown_link-lang";
import Dropdown_lang_currency from "./Dropdown_lang-currency";
import Dropdown_Business_customers from "./Dropdown_Business-customers";
import { useGlobalEvent } from "../context/GlobalEventContext";
import ThinBag from "../Helpers/icons/ThinBag";
import Cart from "./Cart";
import { useCart } from "../context/CartContext";
import userData from "../../public/data/data_user.json";
import ProfilePage from "../views/Profile";
import Person1 from "../img/default-profile-image.png";
import { useTranslation } from "react-i18next";

const TopNavigation = ({ duration = "0.6s", type = 3 }) => {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isCartVisible, setCartIsVisible] = useState(false);
  const { isScrolled, currentPage, updateCurrentPage, windowSize } =
    useGlobalEvent();
  const location = useLocation();
  const [totalNumber, setTotalNumber] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { cart, getTotalQuantity } = useCart();
  const currentUser = userData.find((user) => user.userID === "U00005");

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const styles = {
    menuItem: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "15px",
      margin: "0px 10px 0px 0px",
      height: "50px",
      textDecoration: "none",
      transition: `all ${duration} ease`,
    },
    profileImage: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      marginRight: "5px",
    },
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      updateCurrentPage("", 1);
    } else if (path === "/info_event" || path === "/event") {
      updateCurrentPage("event", 2);
    } else if (path === "/nightclub") {
      updateCurrentPage("nightclub", 3);
    } else if (path === "/info_venues" || path === "/venues") {
      updateCurrentPage("venues", 4);
    } else if (path === "/info_deals" || path === "/deals") {
      updateCurrentPage("deals", 5);
    } else if (path === "/news") {
      updateCurrentPage("news", 6);
    } else if (path === "/ManageProfile") {
      updateCurrentPage("ManageProfile", 7);
    } else if (path === "/MyCoin") {
      updateCurrentPage("MyCoin", 8);
    }
  }, [location.pathname]);

  const handleProfileClick = () => {
    setIsProfilePopupOpen(true);
  };
  const handleProfilePopupClose = () => {
    setIsProfilePopupOpen(false);
  };
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div>
      <div className={`top-navigation ${isScrolled ? "scrolled" : ""}`}>
        {windowSize.width > 768 ? (
          <div className="container">
            <div style={{ height: "50px" }}>
              <nav className="menu-bar">
                <a className="title01">
                  <img
                    src={Nightlife1}
                    alt="Logo Night Life"
                    style={{ width: 200 }}
                  />
                </a>

                <div
                  className="group"
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  <Dropdown_lang_currency />
                  <Dropdown_link_lang />
                </div>
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
                  <Link
                    to="/"
                    className={`item02 ${
                      currentPage.name === "" ? "active" : ""
                    }`}
                    style={styles.menuItem}
                  >
                    Home
                  </Link>

                  <Link
                    to="/venues"
                    className={`item02 ${
                      currentPage.name === "venues" ||
                      currentPage.name === "info_venues"
                        ? "active"
                        : ""
                    }`}
                    style={styles.menuItem}
                  >
                    Venues
                  </Link>

                  <Link
                    to="/event"
                    className={`item02 ${
                      currentPage.name === "event" ||
                      currentPage.name === "info_event"
                        ? "active"
                        : ""
                    }`}
                    style={styles.menuItem}
                  >
                    Events
                  </Link>

                  {/* <Link
                    to="/nightclub"
                    className={`item02 ${currentPage.name === "nightclub" ? "active" : ""}`}
                    style={styles.menuItem}
                  >
                    NightClubs
                  </Link> */}

                  <Link
                    to="/deals"
                    className={`item02 ${
                      currentPage.name === "deals" ||
                      currentPage.name === "info_deals"
                        ? "active"
                        : ""
                    }`}
                    style={styles.menuItem}
                  >
                    Deals
                  </Link>

                  <Link
                    to="/news"
                    className={`item02 ${
                      currentPage.name === "news" ? "active" : ""
                    }`}
                    style={styles.menuItem}
                  >
                    News
                  </Link>
                  <Dropdown_Business_customers />
                  <div style={{ marginLeft: "auto" }} />

                  <div
                    className="cart-wrapper group relative py-4"
                    onClick={() => {
                      setCartIsVisible(!isCartVisible);
                    }}
                  >
                    <div className="cart relative cursor-pointer">
                      <a>
                        <span>
                          <ThinBag />
                        </span>
                      </a>
                      <span
                        className={`w-[20px] h-[20px] rounded-full  absolute  flex justify-center items-center text-[9px] ${
                          type === 3 ? "bg-qh3-blue text-white" : "bg-qyellow"
                        }`}
                        style={{
                          fontSize: "12.5px",
                          top: "-10px",
                          right: "-12px",
                          fontWeight: "bold",
                          color: "black",
                        }}
                      >
                        {getTotalQuantity()}
                      </span>
                    </div>

                    {/* <div className="fixed left-0 top-0 w-full h-full z-40"></div> */}
                    {/* hidden group-hover:block" */}
                    <div style={{ backgroundColor: "green" }}>
                      <Cart
                        type={type}
                        cart={cart}
                        className={`absolute -right-[45px] top-11 z-50 ${
                          isCartVisible ? "" : "hidden"
                        }`}
                      />
                    </div>
                  </div>
                  <div style={{ marginLeft: "0px" }} />
                  <div style={styles.menuItem}>
                    <a
                      href="/signup"
                      className={`item02 ${
                        currentPage.name === "signup" ? "active" : ""
                      }`}
                      style={styles.menuItem}
                    >
                      Sign Up
                    </a>
                  </div>

                  <div style={styles.menuItem}>
                    <a
                      className={`item02 ${
                        currentPage.name === "profile" ? "active" : ""
                      }`}
                      style={styles.menuItem}
                      onClick={handleProfileClick}
                    >
                      <img
                        src={currentUser ? currentUser.profileImage : Person1}
                        alt="Profile"
                        style={styles.profileImage}
                      />
                      {currentUser ? currentUser.userName : "Profile name"}
                    </a>
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
                    src={Nightlife1}
                    alt="Logo Night Life"
                    style={{ padding: "4px", height: "100%" }}
                  />
                </Link>
              </div>

              <div
                style={{
                  minWidth: "50px",
                  fontSize: "40px",
                  color: "rgb(255,255,255)",
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
          onClick={handleDrawerClose}
        >
          <Link
            to="/"
            className={`item02_m ${currentPage.name === "" ? "active" : ""}`}
          >
            Home
          </Link>

          <Link
            to="/venues"
            className={`item02_m ${
              currentPage.name === "venues" ? "active" : ""
            }`}
          >
            Venues
          </Link>

          <Link
            to="/event"
            className={`item02_m ${
              currentPage.name === "event" ? "active" : ""
            }`}
          >
            Events
          </Link>

          <Link
            to="/deals"
            className={`item02_m ${
              currentPage.name === "deals" ? "active" : ""
            }`}
          >
            Deals
          </Link>

          <Link
            to="/news"
            className={`item02_m ${
              currentPage.name === "news" ? "active" : ""
            }`}
          >
            ข่าวสาร
          </Link>

          <Link to="/profile" className={`item02_m`}>
            Profile
          </Link>
        </div>
      )}

      {isProfilePopupOpen && <ProfilePage onClose={handleProfilePopupClose} />}
    </div>
  );
};

export default TopNavigation;
