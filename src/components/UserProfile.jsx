import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Pencil, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import imageCompression from "browser-image-compression";

function UserProfile() {
  const { user } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");
  const OSS_URL = import.meta.env.VITE_IMAGE_OSS_URL;
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

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
        birthday: data.userData?.birthday
          ? data.userData.birthday.slice(0, 10)
          : "",
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImageFile(file);
    setPreviewImageUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      // 1. ถ้ามีรูป → อัปโหลดก่อน
      if (selectedImageFile) {
        const compressedFile = await imageCompression(selectedImageFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 512,
          useWebWorker: true,
        });

        const imageForm = new FormData();
        imageForm.append("profileImage", compressedFile);

        await axios.put(
          `${BASE_URL}/accounts/upload-profile-image`,
          imageForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "device-fingerprint": "12345678",
            },
            withCredentials: true,
          }
        );
      }

      // 2. อัปเดตข้อมูลฟอร์ม
      await axios.put(`${BASE_URL}/accounts/update`, formData, {
        headers: { "device-fingerprint": "12345678" },
        withCredentials: true,
      });

      setEditMode(false);
      setSelectedImageFile(null);
      setPreviewImageUrl(null);
      setImageTimestamp(Date.now());
      fetchProfile();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  if (!profile)
    return (
      <div className="text-white text-center text-base">
        {t("profile.loading")}
      </div>
    );

  // รูปจริงจาก DB หรือ fallback
  const profileImageUrl = (() => {
    if (previewImageUrl) return previewImageUrl;

    const raw = profile.userData?.profileImage;
    
    if (
      typeof raw === "string" &&
      raw.trim() !== "" &&
      raw !== "null" &&
      raw !== "undefined"
    ) {
      // ถ้าเป็น URL จาก Google หรือเว็บอื่น
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
      }

      // ถ้าเป็น path ที่มาจากระบบ OSS ของเรา
      if (raw.startsWith("profile") || raw.startsWith("/profile")) {
        const normalized = raw.startsWith("/") ? raw : `/${raw}`;
        return `${OSS_URL}${normalized}?t=${imageTimestamp}`;
      }
    }

    // fallback กรณีไม่มีรูป หรือมีค่า null/undefined/ว่าง
    return "/img/img_placeholder1.gif";
  })();

  return (
    <div className="max-w-xl mx-auto mt-0 p-10 space-y-4">
      <div className="relative flex justify-center mb-6 mt-[-18px]">
        <div className="relative w-32 h-32 group">
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />

          {editMode && (
            <>
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full cursor-pointer transition-all"
              >
                <Camera className="h-6 w-6 text-white opacity-90 group-hover:opacity-100" />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{t("profile.title")}</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1 bg-white text-black rounded px-2 py-1 border border-yellow-500 text-sm font-medium"
        >
          <Pencil size={16} />
          {t("profile.edit")} {/* คุณมี i18n อยู่แล้ว */}
        </button>
      </div>

      <Field
        label={t("profile.name")}
        name="name"
        value={formData.name}
        editable={editMode}
        onChange={handleChange}
      />
      {!editMode && <hr className="border-t border-white/20 my-3" />}
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
      {!editMode && <hr className="border-t border-white/20 my-3" />}
      <Field
        label={t("profile.birthday")}
        name="birthday"
        value={formData.birthday}
        editable={editMode}
        onChange={handleChange}
        type="date"
      />
      {!editMode && <hr className="border-t border-white/20 my-3" />}
      <Field
        label={t("profile.nationality")}
        name="nationality"
        value={formData.nationality}
        editable={editMode}
        onChange={handleChange}
      />
      {!editMode && <hr className="border-t border-white/20 my-3" />}
      <Field
        label={t("profile.nationalId")}
        name="nationalId"
        value={formData.nationalId}
        editable={editMode}
        onChange={handleChange}
      />
      {!editMode && <hr className="border-t border-white/20 my-3" />}
      <Field
        label={t("profile.email")}
        value={profile.user.email}
        editable={false}
        type="text"
      />

      {editMode && (
        <div className="text-center">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-base"
          >
            {t("profile.saveChanges")}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  editable,
  type = "text",
  options = [],
}) {
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
      <label className="block text-sm text-gray-300 uppercase tracking-wide mb-1">
        {label}
      </label>
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
