// UserDeals.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import "./UserDeals.css";
import { getDeviceFingerprint } from "../lib/fingerprint";

function UserDeals() {
  const { t, i18n } = useTranslation();

  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { user, checkAuthStatus } = useAuth();

  const [userDeals, setUserDeals] = useState([]);
  const [flipStates, setFlipStates] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const [showExpired, setShowExpired] = useState(false);

  const fetchUserDeals = async (userID) => {
    try {
      const fp = await getDeviceFingerprint();
      const response = await axios.get(`${BASE_URL}/user-deal/${userID}`, {
        headers: { "device-fingerprint": fp },
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
    const confirm = window.confirm(t("profile.confirmUse"));
    if (!confirm) return;

    // ตรวจสอบสถานะการล็อกอินและ refresh token

    //await checkAuthStatus();
    //const refreshedUser = useAuth().user;

    // if (!refreshedUser) {
    //   alert(t("profile.sessionExpired")); // ต้องมี translation key นี้
    //   return;
    // }

    try {
      const fp = await getDeviceFingerprint();
      const response = await axios.post(
        `${BASE_URL}/user-deal/start-session`,
        { userDealId },
        {
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        }
      );
      //alert(JSON.stringify(response.data));
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

      const updatedDealRes = await axios.get(
        `${BASE_URL}/user-deal/${user.userId}`,
        {
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        }
      );
      //alert(JSON.stringify(updatedDealRes.data));
      setUserDeals(updatedDealRes.data);
    } catch (error) {
      alert(error.response?.data?.error || t("profile.useFailed"));
    }
  };

  useEffect(() => {
    if (user) fetchUserDeals(user.userId);
  }, [user]);

  const now = new Date();
  const notExpired = userDeals.filter((deal) => {
    const expiresAt = deal.activeSessionExpiresAt
      ? new Date(deal.activeSessionExpiresAt)
      : null;
    return !expiresAt || expiresAt > now;
  });
  const expired = userDeals.filter((deal) => {
    const expiresAt = deal.activeSessionExpiresAt
      ? new Date(deal.activeSessionExpiresAt)
      : null;
    return expiresAt && expiresAt <= now;
  });

  const usedButActive = notExpired.filter((deal) => deal.isActiveSession);
  const unusedActive = notExpired.filter((deal) => !deal.isActiveSession);

  const sortedDeals = [...usedButActive, ...unusedActive];
  const finalDeals = showExpired ? [...sortedDeals, ...expired] : sortedDeals;

  return (
    <div className="flex flex-col gap-4 justify-center items-center px-4 sm:px-8 md:px-16 lg:px-32">
      <div className="w-full p-4">
        <div className="text-xl  text-white text-center flex justify-center">
          {t("profile.purchasedDeals")}
        </div>

        <div className="mt-2 text-sm text-white text-center">
          <label>
            <input
              type="checkbox"
              className="mr-2"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              style={{ transform: "scale(1.4)", accentColor: "white" }}
            />
            {t("profile.showExpiredDeals") || "Show expired deals"}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {finalDeals.length === 0 ? (
            <div className="text-gray-500 col-span-full text-center text-sm sm:text-base italic">
              ( {t("profile.noClaimedDeals")} )
            </div>
          ) : (
            finalDeals.map((userDeal, index) => (
              <React.Fragment key={userDeal._id}>
                {showExpired &&
                  index === sortedDeals.length &&
                  expired.length > 0 && (
                    <div className="col-span-full text-center text-sm text-gray-400 my-2">
                      -----------{" "}
                      {t("profile.expiredDealsHeader") || "Expired Deals"}{" "}
                      -----------
                    </div>
                  )}

                <div
                  className={`flip-card ${
                    flipStates[userDeal._id] ? "flipped" : ""
                  }`}
                >
                  <div className="flip-card-inner">
                    <div className="flip-card-front flex flex-col items-center justify-center text-center px-4">
                      {userDeal.dealId?.images?.[0] && (
                        <img
                          src={userDeal.dealId.images[0]}
                          alt="Deal Preview"
                          className="w-full h-32 object-cover rounded mb-2"
                          onClick={() => {
                            if (
                              userDeal.isUsed ||
                              userDeal.isActiveSession ||
                              serialNumbers[userDeal._id]
                            ) {
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
                      {!userDeal.isUsed && !serialNumbers[userDeal._id] ? (
                        <button
                          onClick={() => handleUseDeal(userDeal._id)}
                          className="mt-3 px-4 py-2 rounded text-white w-full bg-green-600 hover:bg-green-700"
                        >
                          {t("profile.useDeal")}
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
                          {t("profile.viewQR")}
                        </button>
                      )}
                    </div>

                    <div className="flip-card-back relative text-center px-0 py-0 overflow-hidden rounded">
                      <button
                        className="absolute top-2 right-3 text-gray-500 text-xl font-bold z-10"
                        onClick={() =>
                          setFlipStates((prev) => ({
                            ...prev,
                            [userDeal._id]: false,
                          }))
                        }
                      >
                        ×
                      </button>

                      {userDeal.dealId?.images?.[0] && (
                        <img
                          src={userDeal.dealId.images[0]}
                          alt="Deal Preview"
                          className="w-full object-cover"
                          style={{
                            aspectRatio: "1.6",
                            objectFit: "cover",
                            width: "90%",
                          }}
                        />
                      )}

                      <div className="absolute bottom-2 left-5 text-left text-sm text-gray-700 z-10">
                        <div>
                          {t("profile.status")}:{" "}
                          {t(
                            userDeal.isUsed ||
                              userDeal.isActiveSession ||
                              serialNumbers[userDeal._id]
                              ? "profile.used"
                              : "profile.unused"
                          )}
                        </div>
                        <div>
                          {t("profile.usedAt")}:{" "}
                          {userDeal.lastUsedAt
                            ? new Date(userDeal.lastUsedAt).toLocaleString(
                                i18n.language === "th" ? "th-TH" : "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </div>
                      </div>

                      {serialNumbers[userDeal._id] && (
                        <div className="absolute bottom-2 right-2 w-[90px] h-[90px] bg-white p-1 rounded shadow-md z-10">
                          <QRCode
                            value={`${window.location.origin}/check-deal/${
                              userDeal.dealId?.dealPrefix
                            }-${serialNumbers[userDeal._id]
                              .toString()
                              .padStart(4, "0")}`}
                            size={80}
                          />
                        </div>
                      )}

                      <div className="px-4 pt-2 pb-3">
                        <div className="text-lg font-bold">
                          {t("profile.dealSerial")}:{" "}
                          {serialNumbers[userDeal._id] !== undefined &&
                          userDeal.dealId?.dealPrefix
                            ? `${userDeal.dealId.dealPrefix}-${serialNumbers[
                                userDeal._id
                              ]
                                .toString()
                                .padStart(4, "0")}`
                            : "-"}
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {countdowns[userDeal._id] !== undefined
                            ? countdowns[userDeal._id] > 0
                              ? `${t("profile.remainingTime")}: ${Math.floor(
                                  countdowns[userDeal._id] / 60
                                )}:${(countdowns[userDeal._id] % 60)
                                  .toString()
                                  .padStart(2, "0")} ${t("profile.minutes")}`
                              : t("profile.expired")
                            : t("profile.noExpiration")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDeals;
