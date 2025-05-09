import React, { useState, useEffect } from "react";
import CalendarSchedule from "../components/CalendarSchedule";
import ActivitiesForm from "../components/ActivitiesForm";
import UserDeals from "../components/UserDeals";
import UserEvents from "../components/UserEvents";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function Profile() {
  const [selectedTab, setSelectedTab] = useState("deals");
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const [useID, setUseID] = useState(null);

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

        {selectedTab === "events" && (
          <UserEvents />
          // <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 w-full">
          //   <div className="w-full lg:w-[70%]">
          //     <CalendarSchedule
          //       onDateSelect={handleDateSelect}
          //       events={events}
          //       onEventClick={handleEventClick}
          //     />
          //   </div>
          //   <div className="w-full lg:w-[30%] bg-white rounded-lg p-2 mt-2 lg:mt-0">
          //     <ActivitiesForm
          //       selectedDate={selectedDate}
          //       selectedEvent={selectedEvent}
          //       onClose={handleCloseForm}
          //     />
          //   </div>
          // </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
