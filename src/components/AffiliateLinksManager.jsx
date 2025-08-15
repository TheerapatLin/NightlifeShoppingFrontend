import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function AffiliateLinksManager() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [affiliateSettings, setAffiliateSettings] = useState([]);
  const [settings, setSettings] = useState({});
  const [loadingSave, setLoadingSave] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");
  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:5173";

  useEffect(() => {
    const fetchAffiliateActivities = async () => {
      try {
        const fp = await getDeviceFingerprint();
        const res = await axios.get(`${BASE_URL}/activity/affiliate-enabled`, {
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        });
        setActivities(res.data.data || []);
      } catch (error) {
        console.error("Error fetching affiliate activities:", error);
      }
    };

    const fetchAffiliateSettings = async () => {
      try {
        const fp = await getDeviceFingerprint();
        const res = await axios.get(`${BASE_URL}/accounts/affiliate-settings`, {
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        });
        setAffiliateSettings(res.data.data || []);
      } catch (error) {
        console.error("Error fetching affiliate settings:", error);
      }
    };

    fetchAffiliateActivities();
    fetchAffiliateSettings();
  }, []);

  const handleInputChange = (activityId, field, value) => {
    setSettings((prev) => {
      const activity = prev[activityId] || {};
      const activityData = activities.find((a) => a._id === activityId);
      const totalValue = activityData?.affiliate?.totalValue || 0;
      let newValue = parseInt(value) || 0;

      if (newValue < 0) {
        alert(t("affiliate.no_negative_value"));
        return prev;
      }

      if (newValue > totalValue) {
        alert(`${t("affiliate.max_value")} ${totalValue}`);
        return prev;
      }

      if (field === "affiliatorReward") {
        return {
          ...prev,
          [activityId]: {
            ...activity,
            affiliatorReward: newValue,
            customerDiscount: totalValue - newValue,
            budgetApplyMode: activity.budgetApplyMode || "per_order",
          },
        };
      } else if (field === "customerDiscount") {
        return {
          ...prev,
          [activityId]: {
            ...activity,
            customerDiscount: newValue,
            affiliatorReward: totalValue - newValue,
            budgetApplyMode: activity.budgetApplyMode || "per_order",
          },
        };
      }
      return prev;
    });
  };

  const handleModeChange = (activityId, mode) => {
    setSettings((prev) => ({
      ...prev,
      [activityId]: {
        ...(prev[activityId] || {}),
        budgetApplyMode: mode,
      },
    }));
  };

  const handleSave = async (activityId) => {
    // หา activity, userSetting, และ default ตาม activityId
    const activity = activities.find((a) => a._id === activityId);
    const userSetting = affiliateSettings.find(
      (s) => s.activityId?.toString() === activityId?.toString() && s.enabled
    );

    const totalValue = activity?.affiliate?.totalValue || 0;
    const affiliatorReward =
      userSetting?.affiliatorReward ?? activity?.affiliate?.rewardValue ?? 0;
    const customerDiscount =
      userSetting?.customerDiscount ?? totalValue - affiliatorReward;
    const budgetApplyMode =
      settings[activityId]?.budgetApplyMode ||
      userSetting?.budgetApplyMode ||
      activity?.affiliate?.budgetApplyMode ||
      "per_order";

    const setting = settings[activityId] || {};

    setLoadingSave(activityId);
    try {
      const fp = await getDeviceFingerprint();
      await axios.put(
        `${BASE_URL}/accounts/affiliate-setting`,
        {
          activityId,
          customerDiscount: setting.customerDiscount ?? customerDiscount,
          affiliatorReward: setting.affiliatorReward ?? affiliatorReward,
          rewardType: "fixed",
          enabled: true,
          budgetApplyMode,
        },
        {
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        }
      );
      alert(t("affiliate.saved_successfully"));
    } catch (err) {
      console.error(err);
      alert(t("affiliate.save_failed"));
    } finally {
      setLoadingSave(null);
    }
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
      {/* รหัส Affiliate ส่วนตัวของคุณ */}
      <div className="text-center mb-6">
        <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl text-white shadow">
          <div className="text-sm font-medium mb-1">
            {t("affiliate.your_ref_code")}
          </div>
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              readOnly
              value={user?.affiliateCode || ""}
              className="text-sm text-black px-2 py-1 rounded w-[200px] text-center"
            />
            <button
              onClick={() =>
                navigator.clipboard
                  .writeText(user?.affiliateCode || "")
                  .then(() => alert(t("affiliate.copied")))
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              {t("affiliate.copy")}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {activities.map((activity) => {
          const activityId = activity._id;
          const activityCode = activity.activityCode;
          const image =
            activity.image?.[0]?.fileName || "/img/img_placeholder1.gif";
          const name =
            i18n.language === "th"
              ? activity.nameTh || activity.nameEn || t("untitled")
              : activity.nameEn || activity.nameTh || t("untitled");
          const refCode = user?.affiliateCode || "unknown";
          const link = `${FRONTEND_URL}/a/${refCode}${activityCode}`;

          const userSetting = affiliateSettings.find(
            (s) =>
              s.activityId?.toString() === activityId?.toString() && s.enabled
          );

          const totalValue = activity?.affiliate?.totalValue || 0;
          const affiliatorReward =
            userSetting?.affiliatorReward ??
            activity?.affiliate?.rewardValue ??
            0;
          const customerDiscount =
            userSetting?.customerDiscount ?? totalValue - affiliatorReward;
          const budgetApplyMode =
            userSetting?.budgetApplyMode ??
            activity?.affiliate?.budgetApplyMode ??
            "per_order";

          const setting = settings[activityId] || {
            affiliatorReward,
            customerDiscount,
            budgetApplyMode,
          };

          return (
            <div
              key={activityId}
              className="backdrop-blur-lg bg-white/10 p-4 rounded-xl shadow-lg flex flex-col items-center"
              style={{
                backdropFilter: "blur(25px)",
                WebkitBackdropFilter: "blur(25px)",
              }}
            >
              <img
                src={image}
                alt={name}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
              <div className="text-lg font-semibold text-center text-white h-[3.5rem] flex items-center justify-center break-words whitespace-pre-line">
                {name}
              </div>

              <div className="mt-1 text-xs text-center text-gray-300">
                {t("affiliate.total_value")}: {totalValue} THB
              </div>
              <div className="flex w-full gap-2 items-start">
                <div className="flex flex-col items-center">
                  <label className="text-[10px] text-white/80 text-center break-words leading-tight w-full min-h-[30px] flex items-center justify-center">
                    {t("affiliate.customer_discount")}
                  </label>

                  <input
                    type="number"
                    value={setting.customerDiscount}
                    onChange={(e) =>
                      handleInputChange(
                        activityId,
                        "customerDiscount",
                        e.target.value
                      )
                    }
                    className="w-full h-9 rounded bg-white/20 backdrop-blur-[50px] border border-white/30 text-white placeholder-white/80 text-center text-sm"
                    placeholder={t("affiliate.customer_discount")}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-[10px] text-white/80 text-center break-words leading-tight w-full min-h-[30px] flex items-center justify-center">
                    {t("affiliate.your_earning")}
                  </label>
                  <input
                    type="number"
                    value={setting.affiliatorReward}
                    onChange={(e) =>
                      handleInputChange(
                        activityId,
                        "affiliatorReward",
                        e.target.value
                      )
                    }
                    className="w-full h-9 rounded bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/80 text-center text-sm"
                    placeholder={t("affiliate.your_earning")}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-[10px] text-white/80 text-center break-words leading-tight w-full min-h-[30px] flex items-center justify-center">
                    {t("affiliate.mode")}
                  </label>
                  <select
                    value={setting.budgetApplyMode}
                    onChange={(e) =>
                      handleModeChange(activityId, e.target.value)
                    }
                    className="w-[80px] sm:w-[100px] h-9 rounded bg-white/20 backdrop-blur-sm border border-white/30 text-white text-center text-sm"
                  >
                    <option value="per_order">
                      {t("affiliate.mode_per_order")}
                    </option>
                    <option value="per_person">
                      {t("affiliate.mode_per_person")}
                    </option>
                  </select>
                </div>

                <div className="flex flex-col items-center justify-end">
                  <label className="text-[10px] text-transparent min-h-[30px] ">
                    -
                  </label>
                  <button
                    disabled={loadingSave === activityId}
                    onClick={() => handleSave(activityId)}
                    className="w-full h-9 w-[45px] bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm p-1"
                  >
                    {loadingSave === activityId
                      ? t("affiliate.saving")
                      : t("affiliate.save")}
                  </button>
                </div>
              </div>

              <input
                type="text"
                readOnly
                value={link}
                className="mt-2 px-2 py-1 w-full text-sm rounded bg-white/80 text-black"
              />
              <button
                onClick={() =>
                  navigator.clipboard
                    .writeText(link)
                    .then(() => alert(t("affiliate.copied")))
                }
                className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
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

export default AffiliateLinksManager;
