import React, { useEffect, useState } from "react";
import AffiliatePayoutDetailModal from "./AffiliatePayoutDetailModal";
import axios from "axios";
import ReactModal from "react-modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

ReactModal.setAppElement("#root");

const AffiliateEarningsDashboard = () => {
  const { t } = useTranslation();
  const [affiliateSummary, setAffiliateSummary] = useState({
    orders: [],
    totalOrders: 0,
    totalReward: 0,
    totalWithdrawn: 0,
    upcomingPayouts: [],
    monthlyData: [],
  });
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/accounts/affiliate-summary`, {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        });
        const fetched = res.data || {};
        const orders = Array.isArray(fetched.orders) ? fetched.orders : [];

        // Generate upcomingPayouts from orders
        const upcomingPayouts = orders.map((order) => {
          const orderDate = new Date(order.date);
          const day = orderDate.getDate();
          const payoutDate = new Date(orderDate);

          if (day <= 15) {
            payoutDate.setMonth(orderDate.getMonth() + 1);
            payoutDate.setDate(1);
          } else {
            payoutDate.setMonth(orderDate.getMonth() + 2);
            payoutDate.setDate(1);
          }

          return {
            status: "Scheduled",
            date: payoutDate,
            originalDate: orderDate,
            amount: order.affiliateRewardAmount ?? 0,
            method: "Bank Transfer",
            type: "Affiliate",
            activityId: order.activityId?._id || order.activityId || null,
            orderId: order._id,
            originalPrice: order.originalPrice ?? 0,
            paidAmount: order.paidAmount ?? 0,
            affiliateDiscountAmount: order.affiliateDiscountAmount ?? 0,
            affiliateRewardAmount: order.affiliateRewardAmount ?? 0,
            userName: order.userName || "-",
            userEmail: order.userEmail || "-",
            userProfileImage: order.userProfileImage || null,
          };
        });

        // Generate 12-monthlyData (Jan-Dec) for the chart
        const monthLabels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthlyMap = {};
        monthLabels.forEach((m) => (monthlyMap[m] = 0)); // init all months = 0

        upcomingPayouts.forEach((payout) => {
          const month = payout.date.toLocaleString("default", {
            month: "short",
          });
          monthlyMap[month] += payout.amount;
        });

        const monthlyData = monthLabels.map((month) => ({
          month,
          earning: monthlyMap[month],
        }));

        setAffiliateSummary({
          orders,
          totalOrders: fetched.totalOrders || 0,
          totalReward: fetched.totalReward || 0,
          totalWithdrawn: fetched.totalWithdrawn || 0,
          upcomingPayouts,
          monthlyData,
        });
      } catch (error) {
        console.error("Error fetching affiliate summary:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/activity`, {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        });
        setActivities(res.data.data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchSummary();
    fetchActivities();
  }, []);

  return (
    <>
      <div className="text-white p-4 max-w-4xl mx-auto">
        {/* Summary */}
        <div className="mb-10 max-w-5xl mx-auto px-4">
          <div className="text-white text-lg sm:text-xl font-medium mb-2">
            Earnings
          </div>
          <div className="text-white text-4xl sm:text-6xl font-normal mb-3">
            You’ve made
            <br />
            <span className="text-lime-200 font-normal">
              ฿
              {Number(affiliateSummary.totalReward || 0).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>{" "}
            this month
          </div>
          <div className="text-white text-xl sm:text-2xl font-medium mb-6">
            Upcoming{" "}
            <span className="text-lime-200 font-semibold">
              ฿
              {affiliateSummary.upcomingPayouts
                .reduce((acc, payout) => acc + payout.amount, 0)
                .toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-4 mb-4 text-black">
          <div className="text-lg font-semibold mb-2">Earnings Chart</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={affiliateSummary.monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earning" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Payouts */}
        {/* Upcoming Payouts */}
        <div className="bg-white rounded-xl p-4 mb-4 text-black">
          <div className="text-lg font-semibold mb-2">
            {t("affiliate.upcoming_payouts") || "Upcoming Payouts"}
          </div>
          <div className="overflow-x-auto min-h-[150px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Payout Date</th>
                  <th className="p-2 text-left">Booking Date</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Method</th>
                  <th className="p-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {affiliateSummary.upcomingPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <div className="min-h-[150px] flex items-center justify-center text-center text-gray-500">
                        {t("affiliate.no_upcoming_payouts") ||
                          "ยังไม่มีข้อมูลการจอง"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  affiliateSummary.upcomingPayouts.map((payout, idx) => (
                    <tr
                      key={idx}
                      className="border-b cursor-pointer hover:bg-gray-100 transition"
                      onClick={() => {
                        const activity = activities.find(
                          (a) =>
                            a._id?.toString() === payout.activityId?.toString()
                        ); // หรือ map activityId จาก payout มาด้วยตอน fetch
                        setSelectedPayout(payout);
                        setSelectedActivity(activity);
                      }}
                    >
                      <td className="p-2">{payout.status}</td>
                      <td className="p-2">
                        {payout.date.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-2">
                        {payout.originalDate
                          ? new Date(payout.originalDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="p-2">฿{payout.amount}</td>
                      <td className="p-2">{payout.method}</td>
                      <td className="p-2">{payout.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paid Payouts */}

        <div className="bg-white rounded-xl p-4 text-black">
          <div className="text-lg font-semibold mb-2">
            {t("affiliate.paid_payouts") || "Paid Payouts"}
          </div>
          <div className="overflow-x-auto min-h-[150px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Method</th>
                  <th className="p-2 text-left">Transactions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="min-h-[150px] flex items-center justify-center text-center text-gray-500">
                      {t("affiliate.no_paid_payouts") ||
                        "ยังไม่มีข้อมูลการจ่ายออก"}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <ReactModal
          isOpen={isSummaryModalOpen}
          onRequestClose={() => setIsSummaryModalOpen(false)}
          className="bg-white rounded-xl p-4 max-w-2xl mx-auto max-h-[80vh] overflow-y-auto text-black"
          overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        >
          <h2 className="text-lg font-bold mb-2 text-center">Usage Details</h2>
          {affiliateSummary.orders.length === 0 ? (
            <div className="text-center text-sm py-4">No records found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Activity</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Full Price</th>
                  <th className="p-2 text-left">Discount</th>
                  <th className="p-2 text-left">Reward</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {affiliateSummary.orders.map((order, idx) => (
                  <tr key={idx} className="border-b">
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
          <div className="text-center mt-4">
            <button
              onClick={() => setIsSummaryModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </ReactModal>
      </div>
      <AffiliatePayoutDetailModal
        isOpen={!!selectedPayout}
        onRequestClose={() => {
          setSelectedPayout(null);
          setSelectedActivity(null);
        }}
        payout={selectedPayout}
        activity={selectedActivity}
      />
    </>
  );
};

export default AffiliateEarningsDashboard;
