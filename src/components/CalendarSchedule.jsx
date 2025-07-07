//CalendarSchedule.jsx
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import "../public/css/Calendar.css";
import axios from "axios";

function CalendarSchedule({ onDateSelect, events, onEventClick }) {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

  //วันที่เอาเมาส์ไปคลิก
  const handleDateClick = (info) => {
    //เอาแค่วันที่
    const { dateStr } = info;
    //ส่งวันที่ผ่านpropsไปที่ไฟล์Profile
    onDateSelect(dateStr);
  };

  // เมื่อคลิกที่กิจกรรม
  const handleEventClick = async (info) => {
    const event = info.event;
    const eventId = event.id;

    try {
      // เรียก API เพื่อตรวจสอบกิจกรรมด้วย eventId
      const response = await axios.get(`${BASE_URL}/activity-slot/${eventId}`, {
        withCredentials: true,
      });

      const fetchedEvent = response.data;

      if (fetchedEvent) {
        // ส่งข้อมูลที่ดึงมาไปยังฟังก์ชัน onEventClick ผ่าน props
        onEventClick({
          id: fetchedEvent._id,
          title:
            fetchedEvent.activityId?.nameTh ||
            fetchedEvent.activityId?.nameEn ||
            "กิจกรรม",
          start: fetchedEvent.startTime,
          end: fetchedEvent.endTime,
          parentId: fetchedEvent.parentSlotId,
          extendedProps: {
            description: fetchedEvent.notes,
            expenses: fetchedEvent.cost,
            participantLimit: fetchedEvent.participantLimit,
            location: fetchedEvent.location,
            creator: fetchedEvent.creator,
            activityId: fetchedEvent.activityId?._id,
            slotId: fetchedEvent._id,
          },
        });
      } else {
        console.log("onEventClick Error!!!");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // การปรับการแสดงผลของกิจกรรม
  const renderEventContent = (eventInfo) => {
    const view = eventInfo.view.type;
    const maxTitleLength = 15; // กำหนดความยาวสูงสุดของชื่อกิจกรรม

    let title = eventInfo.event.title;
    if (title.length > maxTitleLength) {
      title = title.substring(0, maxTitleLength) + "...";
    }

    return (
      <div className="flex items-center overflow-hidden">
        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 flex-shrink-0"></span>
        <span className="font-medium truncate">{title}</span>
        {view !== "dayGridMonth" && (
          <span className="ml-2 flex-shrink-0">{eventInfo.timeText}</span>
        )}
      </div>
    );
  };

  return (
    <div className="h-[80vh] bg-white p-3 rounded-lg">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="100%"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        events={events}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        eventContent={renderEventContent}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </div>
  );
}

export default CalendarSchedule;
