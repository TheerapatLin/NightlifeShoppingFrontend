import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

function AffiliateLinks() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [affiliateSettings, setAffiliateSettings] = useState([]);
  const [settings, setSettings] = useState({});
  const [loadingSave, setLoadingSave] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [affiliateDiscountInfo, setAffiliateDiscountInfo] = useState(null);
  const [affiliateSummary, setAffiliateSummary] = useState({
    orders: [],
    totalEarnings: 0,
    totalDiscountGiven: 0,
    totalOrders: 0,
    totalReward: 0,
    totalWithdrawn: 0,
  });

  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");
  const FRONTEND_URL =
    import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:5173";

  useEffect(() => {
    const fetchAffiliateSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await axios.get(`${BASE_URL}/accounts/affiliate-summary`, {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        });
        const fetched = res.data || {};
        fetched.orders = Array.isArray(fetched.orders) ? fetched.orders : [];
        setAffiliateSummary(fetched);
      } catch (error) {
        console.error("Error fetching affiliate summary:", error);
        alert(t("affiliate.failed_to_load_summary"));
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchAffiliateSummary();
  }, []);

  useEffect(() => {
    const affiliateRefData = JSON.parse(localStorage.getItem("affiliateRef"));
    const ref = affiliateRefData?.ref;

    const fetchAffiliateDiscount = async () => {
      if (!ref || !activities.length) return;

      // ดึงส่วนลดของทุก activity (หรือเฉพาะตัวที่คุณต้องการ)
      for (const activity of activities) {
        try {
          const res = await axios.get(
            `${BASE_URL}/accounts/affiliate-discount`,
            {
              params: {
                affiliateCode: ref,
                activityId: activity._id,
              },
            }
          );

          // บันทึกข้อมูลแต่ละอันไว้ใน state ตาม activityId
          setAffiliateDiscountInfo((prev) => ({
            ...prev,
            [activity._id]: res.data,
          }));
        } catch (err) {
          console.warn(
            `ไม่พบ affiliate setting สำหรับ activity ${activity._id}`
          );
        }
      }
    };

    fetchAffiliateDiscount();
  }, [activities]);

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

    const fetchAffiliateSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/accounts/affiliate-settings`, {
          headers: { "device-fingerprint": "12345678" },
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(t("affiliate.copied"));
    });
  };

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
          },
        };
      } else if (field === "customerDiscount") {
        return {
          ...prev,
          [activityId]: {
            ...activity,
            customerDiscount: newValue,
            affiliatorReward: totalValue - newValue,
          },
        };
      }
      return prev;
    });
  };

  const handleSave = async (activityId) => {
    const setting = settings[activityId];
    if (!setting) return;
    setLoadingSave(activityId);
    try {
      await axios.put(
        `${BASE_URL}/accounts/affiliate-setting`,
        {
          activityId,
          customerDiscount: setting.customerDiscount,
          affiliatorReward: setting.affiliatorReward,
          rewardType: "fixed",
          enabled: true,
        },
        {
          headers: { "device-fingerprint": "12345678" },
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
      {loadingSummary ? (
        <div className="text-center text-white">{t("loading")}</div>
      ) : (
        affiliateSummary && (
          <div className="text-center mb-4">
            <div
              className="backdrop-blur-md bg-white/20 text-white rounded-xl shadow p-4 flex flex-col items-center w-fit mx-auto"
              style={{ maxWidth: "90%", minWidth: "260px" }}
            >
              <div className="text-base font-semibold mb-1">
                👥 {affiliateSummary.totalOrders || 0}{" "}
                {t("affiliate.used_link")}
              </div>
              <div className="text-base font-semibold mb-1">
                💰 {affiliateSummary.totalReward || 0} THB{" "}
                {t("affiliate.earned")}
              </div>
              <div className="text-base font-semibold mb-2">
                💸 {affiliateSummary.totalWithdrawn || 0} THB{" "}
                {t("affiliate.withdrawn")}
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="px-4 py-2 bg-white text-purple-700 rounded shadow hover:bg-gray-100 text-sm font-medium"
              >
                {t("affiliate.view_details")}
              </button>
            </div>
          </div>
        )
      )}

      <div className="text-white text-center mb-4 flex items-end justify-center gap-2">
        <span className="text-sm opacity-80">
          {t("affiliate.your_ref_code")}
        </span>
        <span className="text-xl font-bold tracking-wide">
          {user?.affiliateCode}
        </span>
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

          const setting = settings[activityId] || {
            affiliatorReward,
            customerDiscount,
          };

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

              <div className="mt-2 w-full text-xs text-center text-gray-300">
                {t("affiliate.total_value")}: {totalValue} THB
              </div>

              <div className="flex gap-2 mt-2 w-full items-end">
                <div className="flex-1">
                  <label className="text-xs">
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
                    className="w-full px-2 py-1 rounded text-black text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs">
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
                    className="w-full px-2 py-1 rounded text-black text-sm"
                  />
                </div>
                <button
                  disabled={loadingSave === activityId}
                  onClick={() => handleSave(activityId)}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {loadingSave === activityId
                    ? t("affiliate.saving")
                    : t("affiliate.save")}
                </button>
              </div>

              <input
                type="text"
                readOnly
                value={link}
                className="mt-2 px-2 py-1 w-full text-sm text-black rounded"
              />
              <button
                onClick={() => copyToClipboard(link)}
                className="mt-1 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {t("affiliate.copy_link")}
              </button>
            </div>
          );
        })}
      </div>

      <ReactModal
        isOpen={isSummaryModalOpen}
        onRequestClose={() => setIsSummaryModalOpen(false)}
        className="bg-white/100 backdrop-blur-lg rounded-xl p-4 w-full max-w-md mx-auto max-h-[85vh] shadow-lg"
        overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50"
      >
        {/* Header: จะไม่เลื่อนตามตาราง */}
        <h2 className="text-lg font-bold mb-2 text-center">
          {t("affiliate.summary_title")}
        </h2>

        {/* ตารางอยู่ในส่วนที่ scroll แยก */}
        <div className="overflow-x-auto w-full rounded-md">
          {affiliateSummary.orders.length === 0 ? (
            <div className="text-center text-sm py-4">
              {t("affiliate.no_records")}
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-2 text-left">{t("date")}</th>
                  <th className="p-2 text-left">{t("activity")}</th>
                  <th className="p-2 text-left">{t("user")}</th>
                  <th className="p-2 text-left">{t("full_price")}</th>
                  <th className="p-2 text-left">{t("discount")}</th>
                  <th className="p-2 text-left">{t("reward")}</th>
                  <th className="p-2 text-left">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {affiliateSummary.orders.map((order) => (
                  <tr key={order._id || order.id} className="border-b">
                    <td className="p-2">
                      {order.date
                        ? new Date(order.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2">{order.activityName || "-"}</td>
                    <td className="p-2">{order.userEmail || "-"}</td>
                    <td className="p-2">{order.originalPrice ?? "-"}</td>
                    <td className="p-2">
                      {order.affiliateDiscountAmount ?? "-"}
                    </td>
                    <td className="p-2">
                      {order.affiliateRewardAmount ?? "-"}
                    </td>
                    <td className="p-2">{order.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ปุ่มปิดอยู่ล่างสุด ไม่เลื่อนตามตาราง */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSummaryModalOpen(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            {t("close")}
          </button>
        </div>
      </ReactModal>
    </>
  );
}

export default AffiliateLinks;
