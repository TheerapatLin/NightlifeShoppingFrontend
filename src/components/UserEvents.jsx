import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import axios from "axios";

function UserEvents() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

  // ✅ ภาษา
  const isThai = i18n.language === "th" || i18n.language.startsWith("th");

  // ✅ ฟังก์ชันเลือกข้อความตามภาษา
  const pickLangField = (th, en) => {
    const cleanTh = th?.trim?.();
    const cleanEn = en?.trim?.();
    return isThai ? cleanTh || cleanEn : cleanEn || cleanTh;
  };

  useEffect(() => {
    if (user?.userId) {
      fetchOrders(user.userId);
    }
  }, [user]);

  const fetchOrders = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/activity-order/${userId}`, {
        withCredentials: true,
      });
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching activity orders:", error);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(isThai ? "th-TH" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (timeStr) =>
    new Date(timeStr).toLocaleTimeString(isThai ? "th-TH" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getScheduleDetails = (scheduleId, scheduleArray) => {
    return scheduleArray?.find(
      (s) => s._id === scheduleId || s._id === scheduleId?.toString()
    );
  };

  return (
    <div className="w-full p-4">
      <div className="text-xl font-CerFont text-white text-center flex justify-center">
        {t("profile.bookedActivities")}
      </div>

      <div className="overflow-x-auto mt-4">
        {orders.length === 0 ? (
          <div className="text-white text-center text-sm italic opacity-20">
            {isThai
              ? "( ยังไม่มี Event ที่จองไว้ )"
              : "( No booked events yet )"}
          </div>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="px-4 py-2 text-left min-w-[300px] max-w-[300px]">
                  {t("profile.activityName")}
                </th>
                <th className="px-4 py-2 text-left">
                  {t("profile.bookingDate")}
                </th>
                <th className="px-4 py-2 text-left">{t("profile.price")}</th>
                <th className="px-4 py-2 text-left">{t("profile.duration")}</th>
                <th className="px-4 py-2 text-left">{t("profile.location")}</th>
                <th className="px-4 py-2 text-left">
                  {t("profile.paymentStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const activity = order.activityId;
                const schedule = getScheduleDetails(
                  order.scheduleId,
                  activity?.schedule
                );
                const scheduleTime = schedule
                  ? `${formatTime(schedule.startTime)} - ${formatTime(
                      schedule.endTime
                    )}`
                  : "-";

                return (
                  <tr
                    key={order._id}
                    className="text-white shadow-[inset_0px_-1px_0px_rgba(255,255,255,0.3)] hover:bg-white/10 transition-all duration-200"
                  >
                    <td className="px-4 py-4 whitespace-wrap min-w-[320px] max-w-[400px]">
                      {index + 1}.{" "}
                      {pickLangField(activity?.nameTh, activity?.nameEn) ||
                        t("profile.unknownActivity")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {formatDate(order.bookingDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {order.paidAmount
                        ? `${order.paidAmount.toLocaleString()} ฿`
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {scheduleTime}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {activity?.location?.googleMapUrl ? (
                        <a
                          href={activity.location.googleMapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          {pickLangField(
                            activity.location.nameTh,
                            activity.location.nameEn
                          ) || "-"}
                        </a>
                      ) : (
                        pickLangField(
                          activity?.location?.nameTh,
                          activity?.location?.nameEn
                        ) || "-"
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
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
  );
}

export default UserEvents;
