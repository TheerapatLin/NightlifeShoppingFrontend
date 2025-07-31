import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Pencil, Trash, Plus } from "lucide-react";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";

const DiscountCodeManager = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");

  const [codes, setCodes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const formatDate = (date) => date.toISOString().substring(0, 10);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(today.getMonth() + 3);

  const defaultFormData = {
    code: "",
    discountType: "amount",
    discountValue: 0,
    eventIdsInorExclude: "all",
    eventIds: [],
    userRestrictionMode: "all",
    allowedUserEmails: [],
    blockedUserEmails: [],
    validFrom: formatDate(oneMonthAgo), // ✅ ถูกต้อง
    validUntil: formatDate(threeMonthsLater), // ✅ ถูกต้อง
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/discount-code`, {
        headers: {
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      setCodes(res.data.codes);
    } catch (err) {
      console.error("Failed to fetch discount codes", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/activity`, {
        headers: {
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      const result = Array.isArray(res.data) ? res.data : res.data.activities;
      setActivities(
        (result || []).sort((a, b) => {
          const nameA = (a.nameTh || a.nameEn || "").toLowerCase();
          const nameB = (b.nameTh || b.nameEn || "").toLowerCase();
          return nameA.localeCompare(nameB);
        })
      );
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await fetchCodes();
        if (user?.role === "superadmin") {
          await fetchActivities();
        }
      } finally {
        if (isMounted) setLoading(false); // NEW: ปิดโหลดเมื่อดึงเสร็จ
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const openModal = (code = null) => {
    setIsModalOpen(true);
    if (code) {
      setIsEditing(true);
      setSelectedCode(code);
      setFormData({
        ...code,
        eventIds: (code.eventIds || []).map((id) =>
          typeof id === "object" && id._id ? id._id.toString() : id.toString()
        ),
        eventIdsInorExclude: code.eventIdsInorExclude || "all",
        userRestrictionMode: code.userRestrictionMode || "all",
        allowedUserEmails: code.allowedUserEmails || [],
        blockedUserEmails: code.blockedUserEmails || [],
        validFrom: code.validFrom ? formatDate(new Date(code.validFrom)) : "",
        validUntil: code.validUntil
          ? formatDate(new Date(code.validUntil))
          : "",
      });
    } else {
      setIsEditing(false);
      setSelectedCode(null);
      setFormData(defaultFormData); // ← ใช้ default ที่มี validFrom/Until แล้ว
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      };

      if (isEditing && selectedCode?._id) {
        await axios.put(
          `${BASE_URL}/discount-code/${selectedCode._id}`,
          formData,
          config
        );
      } else {
        await axios.post(`${BASE_URL}/discount-code`, formData, config);
      }

      closeModal();
      fetchCodes();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error occurred.";

      // ถ้ามีคำว่า "already exists" → แจ้งเตือนชัดเจน
      if (msg.toLowerCase().includes("already exists")) {
        alert("❗ โค้ดนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น");
      } else {
        alert(`ไม่สามารถบันทึกได้: ${msg}`);
      }

      console.error("Save failed", msg);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this code?");
    if (!confirmed) return;
    try {
      await axios.delete(`${BASE_URL}/discount-code/${id}`, {
        headers: {
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      fetchCodes();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ⬇️⬇️⬇️ วาง “ก่อน return หลัก” ตรงนี้ ⬇️⬇️⬇️
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 text-white">
        <div className="flex justify-center items-center h-40">
          <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 text-white">
      <div className="flex justify-between items-center mt-6 mb-4">
        <h2 className="text-2xl font-bold">Discount Codes</h2>
        <button
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-1"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      <div className="space-y-3">
        {codes.map((code) => (
          <div
            key={code._id}
            className="bg-white text-black p-4 rounded-md flex justify-between items-center"
          >
            <div>
              <div className="font-bold text-lg">{code.code}</div>
              <div className="text-sm text-gray-600">
                {code.discountType} - {code.discountValue}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                onClick={() => openModal(code)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(code._id)}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Discount Code"
        // className="bg-white text-black max-w-xl mx-auto mt-[10vh] p-6 rounded shadow-lg max-h-[80vh] overflow-y-auto"
        className="bg-white text-black max-w-xl mx-auto mt-[10vh] p-6 rounded shadow-lg max-h-[80vh] overflow-y-auto min-h-[300px]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <h3 className="text-xl font-bold mb-4">
          {isEditing ? "Edit Discount Code" : "Create New Discount Code"}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block font-medium mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full border px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Type</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full border px-3 py-2"
            >
              <option value="amount">Amount</option>
              <option value="percent">Percent</option>
              <option value="fixed_price">Fixed Price</option>
              <option value="free">Free</option>
              <option value="bonus_only">Bonus Only</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Value</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              className="w-full border px-3 py-2"
            />
          </div>

          {/* 🔽 แทรกตรงนี้เลย */}
          <div>
            <label className="block font-medium mb-1">
              User Restriction Mode
            </label>
            <select
              name="userRestrictionMode"
              value={formData.userRestrictionMode}
              onChange={handleChange}
              className="w-full border px-3 py-2"
            >
              <option value="all">All Users</option>
              <option value="include">Include Only These Emails</option>
              <option value="exclude">Exclude These Emails</option>
            </select>
          </div>

          {formData.userRestrictionMode !== "all" && (
            <div className="mt-3">
              <label className="block font-medium mb-1">
                {formData.userRestrictionMode === "include"
                  ? "Allowed Emails"
                  : "Blocked Emails"}
              </label>
              <div className="space-y-2">
                {(formData.userRestrictionMode === "include"
                  ? formData.allowedUserEmails
                  : formData.blockedUserEmails
                ).map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => {
                          const key =
                            prev.userRestrictionMode === "include"
                              ? "allowedUserEmails"
                              : "blockedUserEmails";
                          const updatedList = [...prev[key]];
                          updatedList[index] = value;
                          return { ...prev, [key]: updatedList };
                        });
                      }}
                      className="flex-1 border px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const key =
                            prev.userRestrictionMode === "include"
                              ? "allowedUserEmails"
                              : "blockedUserEmails";
                          const updatedList = [...prev[key]];
                          updatedList.splice(index, 1);
                          return { ...prev, [key]: updatedList };
                        });
                      }}
                      className="px-2 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => {
                      const key =
                        prev.userRestrictionMode === "include"
                          ? "allowedUserEmails"
                          : "blockedUserEmails";
                      return { ...prev, [key]: [...prev[key], ""] };
                    });
                  }}
                  className="text-blue-600 underline text-sm"
                >
                  + Add Email
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">
              Acitivty Restriction Mode
            </label>
            <select
              name="eventIdsInorExclude"
              value={formData.eventIdsInorExclude}
              onChange={handleChange}
              className="w-full border px-3 py-2"
            >
              <option value="all">All</option>
              <option value="include">Include Only</option>
              <option value="exclude">Exclude These</option>
            </select>
          </div>

          {user?.role === "superadmin" && (
            <div>
              <label className="block font-medium mb-1">
                Select Activities
              </label>
              <div className="max-h-[200px] overflow-y-auto border px-3 py-2 rounded">
                {activities.map((activity) => {
                  const activityId = activity._id.toString();
                  const isChecked = formData.eventIds.includes(activityId);

                  return (
                    <label key={activityId} className="block mb-1">
                      <input
                        type="checkbox"
                        value={activityId}
                        checked={isChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => {
                            const currentIds = prev.eventIds.map((id) =>
                              id.toString()
                            );
                            return {
                              ...prev,
                              eventIds: checked
                                ? [...currentIds, activityId]
                                : currentIds.filter((id) => id !== activityId),
                            };
                          });
                        }}
                      />{" "}
                      {activity.nameTh || activity.nameEn || "Unnamed"}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Valid From</label>
          <input
            type="date"
            name="validFrom"
            value={formData.validFrom}
            onChange={handleChange}
            className="w-full border px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Valid Until</label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            className="w-full border px-3 py-2"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded bg-gray-400 text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DiscountCodeManager;
