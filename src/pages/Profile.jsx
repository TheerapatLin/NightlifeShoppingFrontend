import React, { useState, useEffect } from "react";
import CalendarSchedule from "../components/CalendarSchedule";
import ActivitiesForm from "../components/ActivitiesForm";
import UserDeals from "../components/UserDeals";
import UserEvents from "../components/UserEvents";
import UserProfile from "../components/UserProfile";
import AffiliateLinks from "../components/AffiliateLinks";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import SlotDetailModal from "../components/SlotDetailModal";
// import axios from "axios";
import axios from "axios";
import dayjs from "dayjs";

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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  const [hasWelcomed, setHasWelcomed] = useState(false);

  // Profile.jsx
  const fetchActivitySlots = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/activity-slot`, {
        withCredentials: true,
      });

      const mappedEvents = res.data.map((slot) => ({
        id: slot._id,
        title: slot.activityId?.nameTh || slot.activityId?.nameEn || "กิจกรรม",
        start: slot.startTime,
        end: slot.endTime,
        extendedProps: {
          description: slot.notes,
          expenses: slot.cost,
          participantLimit: slot.participantLimit,
          location: slot.location,
          creator: slot.creator,
          activityId: slot.activityId?._id,
          slotId: slot._id,
        },
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error fetching activity slots:", err);
    }
  };

  useEffect(() => {
    fetchActivitySlots();
  }, []);

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
    setSelectedSlot(clickedEvent);
    setIsSlotModalOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  return (
    <>
      {isSlotModalOpen && selectedSlot && (
        <SlotDetailModal
          open={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          slot={selectedSlot}
          refreshSlots={fetchActivitySlots}
        />
      )}
      <div className="flex flex-col gap-2 mt-[65px] w-full">
        <div className="flex justify-center">
          <div className="mt-2 flex items-center bg-gray-800 p-2 overflow-x-auto rounded-full space-x-2">
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
            {(user?.role == "admin" ||
              user?.role == "affiliator_host" ||
              user?.role == "host_affiliator" ||
              user?.role == "affiliator") && (
              <button
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
                  selectedTab === "affiliate"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedTab("affiliate")}
              >
                Affiliate
              </button>
            )}
            {(user?.role == "admin" || user?.role == "host") && (
              <button
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
                  selectedTab === "scheduler"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedTab("scheduler")}
              >
                Scheduler
              </button>
            )}
          </div>
        </div>

        <div>
          {selectedTab === "deals" && <UserDeals />}

          {selectedTab === "events" && <UserEvents />}

          {selectedTab === "profile" && <UserProfile />}

          {selectedTab === "affiliate" && <AffiliateLinks />}

          {selectedTab === "scheduler" &&
            (user?.role == "admin" || user?.role == "host") && (
              <>
                <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 w-full">
                  <div className="w-full lg:w-[70%]">
                    <CalendarSchedule
                      onDateSelect={handleDateSelect}
                      events={events}
                      onEventClick={handleEventClick}
                    />
                  </div>
                  <div className="w-full lg:w-[30%] bg-white rounded-lg p-2 mt-2 lg:mt-0">
                    <ActivitiesForm
                      selectedDate={selectedDate}
                      selectedEvent={selectedEvent}
                      onClose={handleCloseForm}
                      refreshSlots={fetchActivitySlots} // ✅ ส่งไป
                    />
                  </div>
                </div>
              </>
            )}
        </div>
      </div>
    </>
  );
}

export default Profile;
