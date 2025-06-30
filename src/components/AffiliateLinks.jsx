import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function AffiliateLinks() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");
  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:5173";

  useEffect(() => {
    const fetchAffiliateActivities = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/activity/affiliate-enabled`, {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        });
        setActivities(res.data.data || []);
      } catch (error) {
        console.error("Error fetching affiliate activities:", error);
      }
    };

    fetchAffiliateActivities();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(t("affiliate.copied"));
    });
  };

  if (activities.length === 0) {
    return (
      <div className="text-white text-center text-base mt-4">
        {t("affiliate.no_affiliate_activities")}
      </div>
    );
  }

  return (
    <>
      <div className="text-white text-center mb-4 flex items-end justify-center gap-2">
        <span className="text-sm opacity-80">{t("affiliate.your_ref_code")}</span>
        <span className="text-xl font-bold tracking-wide">{user?.affiliateCode}</span>
        <button
          onClick={() => copyToClipboard(user?.affiliateCode || "")}
          className="ml-1 text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
        >
          {t("affiliate.copy")}
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {activities.map((activity) => {
          const activityId = activity._id;
          const activityCode = activity.activityCode;
          const image =
            activity.image?.[0]?.fileName || "/img/img_placeholder1.gif";
          const name = activity.nameTh || activity.nameEn || "Untitled";
          const refCode = user?.affiliateCode || "unknown";
          //const link = `${FRONTEND_URL}/activityDetails/${activityId}?ref=${refCode}`;
          const link = `${FRONTEND_URL}/a/${refCode}${activityCode}`;

          return (
            <div
              key={activityId}
              className="bg-gray-800 p-3 rounded-xl shadow-md text-white flex flex-col items-center"
            >
              <img
                src={image}
                alt={name}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <div className="text-lg font-semibold text-center">{name}</div>
              <input
                type="text"
                readOnly
                value={link}
                className="mt-2 px-2 py-1 w-full text-sm text-black rounded"
              />
              <button
                onClick={() => copyToClipboard(link)}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {t("affiliate.copy_link")}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default AffiliateLinks;
