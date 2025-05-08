import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "./ProfilePage.css";

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [userDeals, setUserDeals] = useState([]);
  const [flipStates, setFlipStates] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [countdowns, setCountdowns] = useState({});

  const fetchUserDeals = async (userID) => {
    try {
      const response = await axios.get(`${BASE_URL}/user-deal/${userID}`, {
        headers: { "device-fingerprint": "12345678" },
        withCredentials: true,
      });

      const deals = response.data;
      setUserDeals(deals);

      const initialSerials = {};
      const initialCountdowns = {};
      const initialFlip = {};

      deals.forEach((deal) => {
        if (deal.useSerialNumber !== null) {
          initialSerials[deal._id] = deal.useSerialNumber;
          initialFlip[deal._id] = false;
        }

        if (deal.activeSessionExpiresAt) {
          const expiresAt = new Date(deal.activeSessionExpiresAt);
          const now = new Date();
          const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
          initialCountdowns[deal._id] = diff;

          const interval = setInterval(() => {
            setCountdowns((prev) => {
              const updated = { ...prev };
              const newDiff = Math.max(0, updated[deal._id] - 1);
              updated[deal._id] = newDiff;
              if (newDiff <= 0) clearInterval(interval);
              return updated;
            });
          }, 1000);
        }
      });

      setSerialNumbers(initialSerials);
      setCountdowns(initialCountdowns);
      setFlipStates(initialFlip);
    } catch (error) {
      console.error("Error fetching user deals:", error);
    }
  };

  const handleUseDeal = async (userDealId) => {
    const confirm = window.confirm("คุณต้องการใช้ดีลนี้หรือไม่?");
    if (!confirm) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/user-deal/start-session`,
        { userDealId },
        {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        }
      );

      const { serialNumber, expiresAt } = response.data;

      setSerialNumbers((prev) => ({ ...prev, [userDealId]: serialNumber }));
      setFlipStates((prev) => ({ ...prev, [userDealId]: true }));

      if (expiresAt) {
        const target = new Date(expiresAt);
        const interval = setInterval(() => {
          const now = new Date();
          const diff = Math.max(0, Math.floor((target - now) / 1000));
          setCountdowns((prev) => ({ ...prev, [userDealId]: diff }));
          if (diff <= 0) clearInterval(interval);
        }, 1000);
      }
    } catch (error) {
      alert(error.response?.data?.error || "ไม่สามารถเริ่มใช้งานดีลได้");
    }
  };

  useEffect(() => {
    if (user) fetchUserDeals(user.userId);
  }, [user]);

  const formatTime = (time) => {
    const date = new Date(time);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}${i18n.language === "th" ? "น." : ""}`;
  };

  const getScheduleDetails = (scheduleId, schedules) => {
    return schedules.find((s) => s._id === scheduleId);
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center px-4 sm:px-8 md:px-16 lg:px-32">
      {/* 🎯 ดีลที่เคยซื้อ */}
      <div className="w-full bg-white rounded-lg p-4">
        <span className="text-xl font-CerFont ml-4">
          {t("profile.purchasedDeals")}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {userDeals.map((userDeal) => {
            const isFlipped = flipStates[userDeal._id];
            const serial = serialNumbers[userDeal._id];
            const countdown = countdowns[userDeal._id];

            const isUsedOrStarted =
              userDeal.isUsed || userDeal.isActiveSession || serial;

            return (
              <div
                key={userDeal._id}
                className={`flip-card ${isFlipped ? "flipped" : ""}`}
              >
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front">
                    {userDeal.dealId?.images?.[0] && (
                      <img
                        src={userDeal.dealId.images[0]}
                        alt="Deal Preview"
                        className="w-full h-32 object-cover rounded mb-2"
                        onClick={() => {
                          if (isUsedOrStarted) {
                            setFlipStates((prev) => ({
                              ...prev,
                              [userDeal._id]: true,
                            }));
                          }
                        }}
                      />
                    )}
                    <div className="font-bold mb-2">
                      {userDeal.dealId?.title?.[i18n.language] ||
                        t("profile.noTitle")}
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
                      {t("profile.status")}:{" "}
                      {t(
                        userDeal.isUsed ||
                          userDeal.isActiveSession ||
                          serialNumbers[userDeal._id]
                          ? "profile.used"
                          : "profile.unused"
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      {t("profile.paidPrice")}:{" "}
                      {userDeal.pricePaid === 0
                        ? t("profile.free")
                        : `${userDeal.pricePaid} ${t("profile.currency")}`}
                    </div>

                    {!isUsedOrStarted ? (
                      <button
                        onClick={() => handleUseDeal(userDeal._id)}
                        className="mt-3 px-4 py-2 rounded text-white w-full bg-green-600 hover:bg-green-700"
                      >
                        ใช้ดีลนี้
                      </button>
                    ) : (
                      <button
                        className="mt-3 px-4 py-2 rounded text-white w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() =>
                          setFlipStates((prev) => ({
                            ...prev,
                            [userDeal._id]: true,
                          }))
                        }
                      >
                        ดูรหัส / QR
                      </button>
                    )}
                  </div>

                  {/* Back */}
                  <div className="flip-card-back text-center">
                    <button
                      className="absolute top-2 right-3 text-gray-500 text-xl font-bold"
                      onClick={() =>
                        setFlipStates((prev) => ({
                          ...prev,
                          [userDeal._id]: false,
                        }))
                      }
                    >
                      ×
                    </button>
                    <div className="text-lg font-bold">
                      หมายเลขดีล: {serial !== undefined ? serial : "-"}
                    </div>
                    {serial && (
                      <div className="mt-2 mx-auto w-[150px]">
                        <QRCode
                          value={`${window.location.origin}/check-deal/${serial}`}
                          size={150}
                        />
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-700">
                      {countdown !== undefined
                        ? `เวลาที่เหลือ: ${Math.floor(countdown / 60)}:${(
                            countdown % 60
                          )
                            .toString()
                            .padStart(2, "0")} นาที`
                        : "ใช้ได้ไม่มีหมดอายุ"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎯 ตารางกิจกรรมที่จอง */}
      <div className="w-full bg-white rounded-lg p-4">
        <span className="text-xl font-CerFont ml-4">
          {t("profile.bookedActivities")}
        </span>
        <div className="overflow-x-auto mt-4">
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
                <th className="px-4 py-2 text-left">{t("profile.duration")}</th>
                <th className="px-4 py-2 text-left">{t("profile.location")}</th>
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
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
