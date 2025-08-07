// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./public/css/App.css";
import "./public/css/Animation.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import TopNavigation from "./components/TopNavigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ActivityDetails from "./pages/ActivityDetails";
import Payment from "./pages/Payment";
import CompletePage from "./pages/CompletePayment";
import Event from "./views/Event";
import Nightclub from "./views/ManageProfile";
import Venues from "./views/Venues";
import Deals from "./views/Deals";
import News from "./views/News";
import InfoEvent from "./views/info_event";
import InfoVenues from "./views/info_venues";
import InfoDeals from "./views/info_deals";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import CartProvider from "./context/CartContext";
import SignUpForm from "./views/SignUp";
import ResetPassword from "./views/ResetPassword";
import ManageProfile from "./views/ManageProfile";
import MyPurchase from "./views/MY_PURCHASE";
import MyTicket from "./views/MY_TICKET";
import MyVoucher from "./views/MY_VOUCHER";
import MyBooking from "./views/MY_BOOKING";
import MyCoin from "./views/MY_COIN";
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import Videotextnightlife from "../src/components/Videotextnightlife";
import VideotextnightlifeMobile from "../src/components/VideotextnightlifeMobile";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
import { loadStripe } from "@stripe/stripe-js";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import RedirectAffiliate from "./pages/RedirectAffiliate";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <GoogleOAuthProvider clientId="264872388310-dopb96r58u05v3b7ukrjq03u6ktrdh6t.apps.googleusercontent.com">
      <AuthProvider>
        <CartProvider>
          <Router>
            <Elements stripe={stripePromise}>
              <RouteContainer />
            </Elements>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

const MotionPage = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, type: "tween" }}
    >
      {children}
    </motion.div>
  );
};

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

function RouteContainer() {
  const location = useLocation();
  const { width } = useWindowSize();
  const [showReloadNotice, setShowReloadNotice] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/meta.json", { cache: "no-cache" });
        const { version } = await res.json();
        const currentVersion = localStorage.getItem("appVersion");

        if (currentVersion && currentVersion !== version) {
          console.log("🔄 New version detected. Reloading...");
          setShowReloadNotice(true);
          setTimeout(() => {
            localStorage.clear();
            window.location.reload(true);
          }, 1100);
        } else {
          localStorage.setItem("appVersion", version);
        }
      } catch (err) {
        console.warn("⚠️ Version check failed:", err);
      }
    };
    checkVersion();
  }, [location.pathname]);

  return (
    <>
      {showReloadNotice && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 99999998,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#222",
              color: "#fff",
              padding: "5px 15px",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 99999999,
              fontSize: 16,
              textAlign: "center",
            }}
          >
            🔄 Website updated!
            <br />
            Reloading...
          </div>
        </>
      )}
      <TopNavigation duration=".6s" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/a/:shortcode"
            element={
              <MotionPage>
                <RedirectAffiliate />
              </MotionPage>
            }
          />
          <Route
            path="/"
            element={
              <MotionPage>
                <Home />
              </MotionPage>
            }
          />
          <Route
            path="/activityDetails/:id"
            element={
              <MotionPage>
                <ActivityDetails />
              </MotionPage>
            }
          />
          <Route
            path="/event"
            element={
              <MotionPage>
                <Event />
              </MotionPage>
            }
          />
          <Route
            path="/info_event"
            element={
              <MotionPage>
                <InfoEvent />
              </MotionPage>
            }
          />
          <Route
            path="/nightclub"
            element={
              <MotionPage>
                <Nightclub />
              </MotionPage>
            }
          />
          <Route
            path="/venues"
            element={
              <MotionPage>
                <Venues />
              </MotionPage>
            }
          />
          <Route
            path="/info_venues/:venue_id"
            element={
              <MotionPage>
                <InfoVenues />
              </MotionPage>
            }
          />
          <Route
            path="/deals"
            element={
              <MotionPage>
                <Deals />
              </MotionPage>
            }
          />
          <Route
            path="/info_deals"
            element={
              <MotionPage>
                <InfoDeals />
              </MotionPage>
            }
          />
          <Route
            path="/news"
            element={
              <MotionPage>
                <News />
              </MotionPage>
            }
          />
          <Route
            path="/signup"
            element={
              <MotionPage>
                <SignUpForm />
              </MotionPage>
            }
          />
          <Route
            path="/reset-password"
            element={
              <MotionPage>
                <ResetPassword />
              </MotionPage>
            }
          />
          <Route
            path="/profile"
            element={
              <MotionPage>
                <Profile />
              </MotionPage>
            }
          />
          <Route
            path="/ManageProfile"
            element={
              <MotionPage>
                <ManageProfile />
              </MotionPage>
            }
          />
          <Route
            path="/MyPurchase"
            element={
              <MotionPage>
                <MyPurchase />
              </MotionPage>
            }
          />
          <Route
            path="/MyTicket"
            element={
              <MotionPage>
                <MyTicket />
              </MotionPage>
            }
          />
          <Route
            path="/MyVoucher"
            element={
              <MotionPage>
                <MyVoucher />
              </MotionPage>
            }
          />
          <Route
            path="/MyBooking"
            element={
              <MotionPage>
                <MyBooking />
              </MotionPage>
            }
          />
          <Route
            path="/mingle-options"
            element={
              <MotionPage>
                <Videotextnightlife />
              </MotionPage>
            }
          />
          <Route
            path="/mingle-options-mobile"
            element={
              <MotionPage>
                <VideotextnightlifeMobile />
              </MotionPage>
            }
          />
          <Route
            path="/profile"
            element={
              <MotionPage>
                <Profile />
              </MotionPage>
            }
          />
          <Route
            path="/MyCoin"
            element={
              <MotionPage>
                <MyCoin />
              </MotionPage>
            }
          />
          <Route
            path="/payment/*"
            element={
              <MotionPage>
                <Payment />
              </MotionPage>
            }
          />
          <Route
            path="/order-complete"
            element={
              <MotionPage>
                <CompletePage />
              </MotionPage>
            }
          />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default App;
