import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import axios from "axios";

function UserEvents() {
  const { t, i18n } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("deals");
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const [useID, setUseID] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      setUseID(user.id);
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
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  return (
    <>
      <div className="w-full p-4">
        <div className="text-xl font-CerFont text-white text-center flex justify-center">
          {t("profile.bookedActivities")}
        </div>

        <div className="overflow-x-auto mt-4">
          {orders.length === 0 ? (
            <div className="text-white text-center text-sm italic opacity-20">
              {i18n.language === "th"
                ? "( ยังไม่มี Event ที่จองไว้ )"
                : "( No booked events yet )"}
            </div>
          ) : (
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">
                    {t("profile.activityName")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t("profile.bookingDate")}
                  </th>
                  <th className="px-4 py-2 text-left">{t("profile.price")}</th>
                  <th className="px-4 py-2 text-left">
                    {t("profile.duration")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t("profile.location")}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t("profile.paymentStatus")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const schedule = getScheduleDetails(
                    order.scheduleId,
                    order.activityId.schedule
                  );
                  return (
                    <tr key={order._id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {index + 1}. {order.activityId.name}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(order.bookingDate).toLocaleDateString(
                          i18n.language === "th" ? "th-TH" : "en-GB"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {schedule ? schedule.cost : t("profile.notFound")}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {schedule
                          ? `${formatTime(schedule.startTime)} - ${formatTime(
                              schedule.endTime
                            )}`
                          : t("profile.notFound")}
                      </td>
                      <td className="px-4 py-2">
                        {order.activityId.location.name}
                      </td>
                      <td className="px-4 py-2">
                        {order.status === "paid"
                          ? t("profile.paid")
                          : t("profile.unpaid")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default UserEvents;
