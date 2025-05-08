import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [userDeals, setUserDeals] = useState([]);

  const fetchUserDeals = async (userID) => {
    try {
      const response = await axios.get(`${BASE_URL}/user-deal/${userID}`, {
        headers: { "device-fingerprint": "12345678" },
        withCredentials: true,
      });
      setUserDeals(response.data);
    } catch (error) {
      console.error("Error fetching user deals:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserDeals(user.userId);
    }
  }, [user]);

  const getScheduleDetails = (scheduleId, schedules) => {
    return schedules.find((schedule) => schedule._id === scheduleId);
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}${
      i18n.language === "th" ? "น." : ""
    }`;
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center px-4 sm:px-8 md:px-16 lg:px-32">
      {/* 🎯 ดีลที่เคยซื้อ */}
      <div className="w-full bg-white rounded-lg p-4">
        <span className="text-xl font-CerFont ml-4">{t("profile.purchasedDeals")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {userDeals.map((userDeal) => (
            <div
              key={userDeal._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {userDeal.dealId?.images?.[0] && (
                <img
                  src={userDeal.dealId.images[0]}
                  alt="Deal Preview"
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <div className="font-bold mb-2">
                {userDeal.dealId?.title?.[i18n.language] || t("profile.noTitle")}
              </div>
              <div className="text-sm text-gray-600">
                {userDeal.pricePaid === 0
                  ? t("profile.claimedOn")
                  : t("profile.purchasedOn")}
                :{" "}
                {new Date(userDeal.claimedAt).toLocaleDateString(
                  i18n.language === "th" ? "th-TH" : "en-GB"
                )}
              </div>
              <div className="text-sm text-gray-600">
                {t("profile.status")}: {t(userDeal.isUsed ? "profile.used" : "profile.unused")}
              </div>
              <div className="text-sm text-gray-600">
                {t("profile.paidPrice")}:{" "}
                {userDeal.pricePaid === 0
                  ? t("profile.free")
                  : `${userDeal.pricePaid} ${t("profile.currency")}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 ตารางกิจกรรมที่จอง */}
      <div className="w-full bg-white rounded-lg p-4">
        <span className="text-xl font-CerFont ml-4">{t("profile.bookedActivities")}</span>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">{t("profile.activityName")}</th>
                <th className="px-4 py-2 text-left">{t("profile.bookingDate")}</th>
                <th className="px-4 py-2 text-left">{t("profile.price")}</th>
                <th className="px-4 py-2 text-left">{t("profile.duration")}</th>
                <th className="px-4 py-2 text-left">{t("profile.location")}</th>
                <th className="px-4 py-2 text-left">{t("profile.paymentStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const schedule = getScheduleDetails(order.scheduleId, order.activityId.schedule);
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
                        ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`
                        : t("profile.notFound")}
                    </td>
                    <td className="px-4 py-2">{order.activityId.location.name}</td>
                    <td className="px-4 py-2">
                      {order.status === "paid" ? t("profile.paid") : t("profile.unpaid")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
