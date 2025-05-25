import React, { useState, useEffect } from "react";
import CalendarSchedule from "../components/CalendarSchedule";
import ActivitiesForm from "../components/ActivitiesForm";
import UserDeals from "../components/UserDeals";
import UserEvents from "../components/UserEvents";
import UserProfile from "../components/UserProfile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import axios from "axios";

function Profile() {
  const { t, i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("deals");
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user, checkAuthStatus } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const [useID, setUseID] = useState(null);
  const navigate = useNavigate();

  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const valid = await checkAuthStatus();
      if (!valid) {
        alert(
          t("profile.sessionExpired") || "เซสชันหมดอายุ กรุณาล็อกอินอีกครั้ง"
        );
        navigate("/signup");
      } else {
        //alert("welcome_back!"); // ✅ แสดงทุกครั้งที่โฟกัสกลับมา
        console.log("welcome_back!");
      }
    };

    // ตรวจตอนเข้าหน้านี้ครั้งแรก
    check();

    // ตรวจทุกครั้งที่กลับมาโฟกัสหน้าเว็บนี้
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  const handleEventClick = (clickedEvent) => {
    setSelectedEvent(clickedEvent);
    setSelectedDate(new Date(clickedEvent.start));
  };

  const handleCloseForm = () => {
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  return (
    <div className="flex flex-col gap-2 mt-[65px] w-full">
      <div className="flex justify-center">
        <div className="mt-2 flex items-center bg-gray-800 p-2 overflow-x-auto rounded-full space-x-2">
          <button
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
              selectedTab === "deals"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("deals")}
          >
            Deals
          </button>
          <button
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
              selectedTab === "events"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("events")}
          >
            Events
          </button>
          <button
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
              selectedTab === "profile"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("profile")}
          >
            Profile
          </button>
        </div>
      </div>

      <div>
        {selectedTab === "deals" && <UserDeals />}

        {selectedTab === "events" && <UserEvents />}

        {selectedTab === "profile" && <UserProfile />}
      </div>
    </div>
  );
}

export default Profile;
