import React, { useState, useEffect } from "react";
import CalendarSchedule from "../components/CalendarSchedule";
import ActivitiesForm from "../components/ActivitiesForm";
import ProfilePage from "../components/ProfilePage";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// * ต่อจากนี้ผมจะเขียนcomment สำหรับคนที่จะเขียนคนต่อไป และ สำหรับตัวผมเองด้วย เขียนหน้าลืมหลัง เขียนหลังลืมหน้า
// * ถ้านายคิดว่ามันรกลูกตา ก็ติดตั้ง extentionที่ชื่อว่า Hide commentsนะ อิอิ

function Profile() {
  // สำหรับเก็บค่าแท็กที่เลือกว่าจะไป หน้าprofile หรือ activities #defultเป็น profile
  const [selectedTab, setSelectedTab] = useState("profile");
  // สำหรับเก็บวันที่เลือก วันที่เลือกเพื่อสร้างกิจกรรม
  const [selectedDate, setSelectedDate] = useState(null);
  //สำหรับเก็บค่ากิจกรรมที่เราจะสร้าง
  const [events, setEvents] = useState([]);
  //สำหรับเก็บค่ากิจกรรมที่เราสร้างไว้แล้ว เพื่อแก้ไขหรือลบ
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const [useID, setUseID] = useState(null);

  useEffect(() => {
    // ตรวจสอบว่า user ถูกตั้งค่าแล้วก่อนที่จะเรียก fetchActivities
    if (user && user.id) {
      setUseID(user.id);
      // console.log("useID:", user.id);
      fetchActivities(user.id);
    }
  }, [user]);

  const fetchActivities = async (userID) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/activity/creator/${userID}`,
        {
          withCredentials: true,
        }
      );
      // console.log(response.data);
      if (response.data != null) {
        const formattedEvents = response.data.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.activityTime.start,
          end: event.activityTime.end,
          extendedProps: {
            description: event.description,
            expenses: event.cost,
            participantLimit: event.participantLimit,
            images: event.image,
          },
        }));
        setEvents(formattedEvents);
      }
      // console.log("map:",formattedEvents)
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // บันทึกวันที่เลือกไว้ใน State
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
  };

  //รับevents ที่เลือกมาจาก calendar ผ่านprops ที่ส่งกลับมา
  const handleEventClick = (clickedEvent) => {
    //setค่าใน state ของ selectedEvent
    setSelectedEvent(clickedEvent);
    setSelectedDate(new Date(clickedEvent.start));
    console.log("Event Click", clickedEvent);
  };

  //เคลียร์ค่าใน Data และ event ที่อยู่ใน form
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
              selectedTab === "profile"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("profile")}
          >
            profile
          </button>
          {/* <button
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
              selectedTab === "activities"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedTab("activities")}
          >
            activities
          </button> */}
        </div>
      </div>

      <div>
        {selectedTab === "profile" && <ProfilePage />}

        {selectedTab === "activities" && (
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
