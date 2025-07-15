// AffiliatePayoutDetailModal.jsx (สมบูรณ์ ใช้งานจริงได้ทันที)
import React from "react";
import ReactModal from "react-modal";
import { useTranslation } from "react-i18next";

const AffiliatePayoutDetailModal = ({
  isOpen,
  onRequestClose,
  payout,
  activity,
}) => {
  const { t, i18n } = useTranslation();

  if (!payout) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat(i18n.language === "th" ? "th-TH" : "en-US", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const name =
    i18n.language === "th" ? activity?.nameTh || "-" : activity?.nameEn || "-";
  const userName = payout.userName || "-";
  const date = new Date(payout.date).toLocaleDateString(i18n.language);
  const paymentMethod = payout.method || "-";
  const status = payout.status || "-";
  const type = payout.type || "Affiliate";
  const profileImageSrc =
    payout.userProfileImage || "/img/img_placeholder1.gif";

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-white rounded-2xl p-6 max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto text-black shadow-2xl"
      overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xl font-bold mb-1">
          {formatCurrency(payout.amount)}
        </div>
        <div className="text-sm text-gray-600">
          {t("affiliate.scheduled_for")}: {date}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <div className="text-sm font-semibold mb-1">
          {t("affiliate.payment_method")}
        </div>
        <div className="text-sm text-gray-700">{paymentMethod}</div>
      </div>

      {/* User & Activity */}
      <div className="flex gap-4 mb-4">
        <img
          src={profileImageSrc}
          alt={userName}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="text-base font-semibold mb-1">{name}</div>
          <div className="text-sm text-gray-600">{userName}</div>
          <div className="text-sm text-gray-600 mt-1">
            {t("affiliate.status")}: {status}
          </div>
          <div className="text-sm text-gray-600">
            {t("affiliate.type")}: {type}
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>{t("affiliate.full_price")}</span>
          <span>{formatCurrency(payout.originalPrice || 0)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>{t("affiliate.discount")}</span>
          <span>-{formatCurrency(payout.affiliateDiscountAmount || 0)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span>{t("affiliate.reward")}</span>
          <span>{formatCurrency(payout.affiliateRewardAmount || 0)}</span>
        </div>
        <div className="border-t border-gray-300 my-2"></div>
        <div className="flex justify-between font-semibold text-base">
          <span>{t("affiliate.total")}</span>
          <span>
            {formatCurrency(
              payout.paidAmount ?? payout.amount ?? 0 // ✅ ใช้ paidAmount เป็นหลัก
            )}
          </span>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onRequestClose}
        className="mt-2 w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
      >
        {t("affiliate.close")}
      </button>
    </ReactModal>
  );
};

export default AffiliatePayoutDetailModal;
