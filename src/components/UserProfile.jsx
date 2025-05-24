// src/components/UserProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

function UserProfile() {
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/accounts/me`, {
        headers: { "device-fingerprint": "12345678" },
        withCredentials: true,
      });
      const { data } = res.data;
      setProfile(data);
      setFormData({
        name: data.user.name || "",
        gender: data.userData?.gender || "unspecified",
        birthday: data.userData?.birthday ? data.userData.birthday.slice(0, 10) : "",
        nationality: data.userData?.nationality || "",
        nationalId: data.userData?.nationalId || "",
      });
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  useEffect(() => {
    if (user?.userId) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`${BASE_URL}/accounts/update`, formData, {
        headers: { "device-fingerprint": "12345678" },
        withCredentials: true,
      });
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (!profile) return <div className="text-white text-center text-base">{t("profile.loading")}</div>;

  return (
    <div className="max-w-xl mx-auto mt-4 p-10 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t("profile.title")}</h2>
        <button onClick={() => setEditMode(!editMode)} className="bg-white text-black rounded p-1 border border-yellow-500">
          <Pencil size={20} />
        </button>
      </div>

      <Field label={t("profile.name")} name="name" value={formData.name} editable={editMode} onChange={handleChange} />
      <Field
        label={t("profile.gender.label")}
        name="gender"
        value={formData.gender}
        editable={editMode}
        onChange={handleChange}
        type="select"
        options={[
          { value: "unspecified", label: t("profile.gender.unspecified") },
          { value: "male", label: t("profile.gender.male") },
          { value: "female", label: t("profile.gender.female") },
          { value: "other", label: t("profile.gender.other") },
        ]}
      />
      <Field
        label={t("profile.birthday")}
        name="birthday"
        value={formData.birthday}
        editable={editMode}
        onChange={handleChange}
        type="date"
      />
      <Field label={t("profile.nationality")} name="nationality" value={formData.nationality} editable={editMode} onChange={handleChange} />
      <Field label={t("profile.nationalId")} name="nationalId" value={formData.nationalId} editable={editMode} onChange={handleChange} />
      <Field label={t("profile.email")} value={profile.user.email} editable={false} type="text" />

      {editMode && (
        <div className="text-center">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-base">
            {t("profile.saveChanges")}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, editable, type = "text", options = [] }) {
  const formatDate = (raw) => {
    if (!raw) return "-";
    const date = new Date(raw);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-300 uppercase tracking-wide mb-1">{label}</label>
      {editable ? (
        type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-white text-black px-3 py-2 rounded-none border border-gray-400 text-base"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-white text-black px-3 py-2 rounded-none border border-gray-400 text-base"
          />
        )
      ) : (
        <div className="text-white text-base font-medium">
          {type === "date" ? formatDate(value) : value || "-"}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
