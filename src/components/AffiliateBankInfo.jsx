import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // 👈 ใช้สำหรับอ่าน user.email

ReactModal.setAppElement("#root");

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");

const THAI_BANKS = [
  { code: "KTB", name: "Krungthai Bank", logo: "/img/bank-logos/ktb_logo.png" },
  {
    code: "SCB",
    name: "Siam Commercial Bank",
    logo: "/img/bank-logos/scb_logo.png",
  },
  {
    code: "KBANK",
    name: "Kasikorn Bank",
    logo: "/img/bank-logos/kbank_logo.png",
  },
  { code: "BAY", name: "Krungsri", logo: "/img/bank-logos/bay_logo.png" },
  { code: "BBL", name: "Bangkok Bank", logo: "/img/bank-logos/bbl_logo.jpg" },
  { code: "OTHER", name: "Other", logo: "" },
];

const AffiliateBankInfo = () => {
  const { t } = useTranslation();
  const { user } = useAuth(); // 👈 ดึง user จาก context

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("SCB");
  const [otherBankName, setOtherBankName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [modalType, setModalType] = useState(null); // "save" | "cancel"

  const selectedBank = THAI_BANKS.find((b) => b.code === bankCode);

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/accounts/affiliate-bank-info`,
          {
            headers: { "device-fingerprint": "12345678" },
            withCredentials: true,
          }
        );
        const data = res.data || {};
        setAccountName(data.accountName || "");
        setAccountNumber(data.accountNumber || "");
        setBankCode(data.bankCode || "SCB");
        setOtherBankName(data.bankCode === "OTHER" ? data.bankName || "" : "");
        setContactEmail(data.contactEmail || user?.email || "");
      } catch (err) {
        console.error("Failed to load bank info:", err);
        setContactEmail(user?.email || "");
      } finally {
        setLoading(false);
      }
    };
    fetchBankInfo();
  }, [user?.email]);

  const handleSaveConfirmed = async () => {
    const bankNameToSave =
      bankCode === "OTHER" ? otherBankName?.trim() : selectedBank?.name || "";

    if (
      !accountName ||
      !accountNumber ||
      !bankCode ||
      !bankNameToSave ||
      !contactEmail
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const payload = {
      accountName,
      accountNumber,
      bankCode,
      bankName: bankNameToSave,
      contactEmail,
    };

    try {
      await axios.put(`${BASE_URL}/accounts/affiliate-bank-info`, payload, {
        headers: { "device-fingerprint": "12345678" },
        withCredentials: true,
      });

      alert("✅ Bank info saved successfully.");
      setEditing(false);
      setModalType(null);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("❌ Failed to save bank info.");
    }
  };

  const handleCancelConfirmed = () => {
    setEditing(false);
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="text-white text-center py-10">Loading bank info...</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-white p-4">
      <h2 className="text-xl font-semibold mb-4">Bank Account Information</h2>

      <div className="bg-white text-black p-4 rounded-xl shadow space-y-4">
        {/* Account Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Account Name</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            disabled={!editing}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Bank</label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            disabled={!editing}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {THAI_BANKS.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>

          {bankCode === "OTHER" ? (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">
                Specify Bank Name
              </label>
              <input
                type="text"
                value={otherBankName}
                onChange={(e) => setOtherBankName(e.target.value)}
                disabled={!editing}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Enter your bank name"
              />
            </div>
          ) : selectedBank?.logo ? (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <img
                src={selectedBank.logo}
                alt={selectedBank.name}
                className="w-6 h-6"
              />
              <span>{selectedBank.name}</span>
            </div>
          ) : null}
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Account Number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={!editing}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Contact Email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={!editing}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setModalType("cancel")}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => setModalType("save")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ReactModal
        isOpen={!!modalType}
        onRequestClose={() => setModalType(null)}
        className="bg-white p-6 rounded-xl text-black w-full max-w-sm mx-auto shadow"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          {modalType === "save" ? "Confirm Save Changes?" : "Discard Changes?"}
        </h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={() =>
              modalType === "save"
                ? handleSaveConfirmed()
                : handleCancelConfirmed()
            }
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Confirm
          </button>
          <button
            onClick={() => setModalType(null)}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </ReactModal>
    </div>
  );
};

export default AffiliateBankInfo;
