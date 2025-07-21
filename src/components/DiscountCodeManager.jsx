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
  const [formData, setFormData] = useState({
    code: "",
    discountType: "amount",
    discountValue: 0,
    eventIdsInorExclude: "all",
    eventIds: [],
  });

  const fetchCodes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/discount-code`, {
        headers: {
          "Content-Type": "multipart/form-data",
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
          "Content-Type": "multipart/form-data",
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  useEffect(() => {
    fetchCodes();
    if (user?.role === "superadmin") fetchActivities();
  }, [user]);

  const openModal = (code = null) => {
    setIsModalOpen(true);
    if (code) {
      setIsEditing(true);
      setSelectedCode(code);
      setFormData({
        ...code,
        eventIds: code.eventIds || [],
        eventIdsInorExclude: code.eventIdsInorExclude || "all",
      });
    } else {
      setIsEditing(false);
      setSelectedCode(null);
      setFormData({
        code: "",
        discountType: "amount",
        discountValue: 0,
        eventIdsInorExclude: "all",
        eventIds: [],
      });
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
          "Content-Type": "multipart/form-data",
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
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this code?");
    if (!confirmed) return;
    try {
      await axios.delete(`${BASE_URL}/discount-code/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      fetchCodes();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

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
        className="bg-white text-black max-w-xl mx-auto mt-[10vh] p-6 rounded shadow-lg"
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
          <div>
            <label className="block font-medium mb-1">
              Event Restriction Mode
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
                {activities.map((activity) => (
                  <label key={activity._id} className="block mb-1">
                    <input
                      type="checkbox"
                      value={activity._id}
                      checked={formData.eventIds.includes(activity._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          eventIds: checked
                            ? [...prev.eventIds, value]
                            : prev.eventIds.filter((id) => id !== value),
                        }));
                      }}
                    />{" "}
                    {activity.name}
                  </label>
                ))}
              </div>
            </div>
          )}
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
