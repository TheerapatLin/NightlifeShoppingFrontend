import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { useAuth } from "../context/AuthContext";
import imageCompression from "browser-image-compression";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function CreateNewProductModal({ isOpen, onClose, creatorId, onCreated }) {
    const { i18n } = useTranslation();

    const [form, setForm] = useState({
        titleEn: '',
        titleTh: '',
        descEn: '',
        descTh: '',
        originalPrice: '',
        tags: '',
        status: 'inactive',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    useEffect(() => {
        if (isOpen) {
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!creatorId) {
            setError('User not found');
            return;
        }
        try {
            setSubmitting(true);
            setError(null);
            const fp = await getDeviceFingerprint();
            const response = await axios.post(`${BASE_URL}/shopping/product`,
                {
                    creatorId: user.userId,
                    title: { en: form.titleEn.trim(), th: form.titleTh.trim() },
                    description: { en: form.descEn.trim(), th: form.descTh.trim() },
                    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                    tags: form.tags
                        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
                        : [],
                    status: form.status || 'inactive'
                }, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            });


            if (imageFile) {
                const compressedFile = await imageCompression(imageFile, {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 512,
                    useWebWorker: true,
                });
                const formData = new FormData();
                formData.append('image', compressedFile);      // ต้องเป็น File/Blob
                formData.append('userId', user.userId);
                const newproductId = response.data.newProduct._id
                const resImage = await axios.patch(`${BASE_URL}/shopping/product/add-image/${newproductId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "device-fingerprint": fp,
                        },
                        withCredentials: true,
                    })
                setImagePreview(null)
                setImageFile(null)
            }

            if (typeof onClose === 'function') onClose();
            if (typeof onCreated === 'function') onCreated();
        } catch (err) {
            console.error("Error creating product:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={() => {
                    onClose()
                }}
            >
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold">
                            {(i18n.language === "th" ? 'สร้างสินค้าใหม่' : 'Create New Product')}
                        </h3>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; onClose(); }}>✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                            {(i18n.language === "th" ? 'รูปภาพแสดงสินค้า' : 'Image')}
                        </p>
                        <div className="w-full flex justify-center">
                            <label
                                htmlFor="profile-upload"
                                className={`flex items-center justify-center w-32 h-32 ${imagePreview ? '' : 'bg-black'} text-white rounded-md cursor-pointer hover:opacity-90 transition overflow-hidden`}
                                aria-label="Upload image"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl">+</span>
                                )}
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) {
                                        setImageFile(file);
                                        const url = URL.createObjectURL(file);
                                        setImagePreview((prev) => {
                                            if (prev) URL.revokeObjectURL(prev);
                                            return url;
                                        });
                                    } else {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'ชื่อสินค้า (EN)' : 'Title (EN)')}
                                </label>
                                <input name="titleEn" value={form.titleEn} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Title in English" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'ชื่อสินค้า (TH)' : 'Title (TH)')}
                                </label>
                                <input name="titleTh" value={form.titleTh} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Title in Thai" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'คำอธิบายสินค้า (EN)' : 'Description (EN)')}
                                </label>
                                <textarea name="descEn" value={form.descEn} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Description in English" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'คำอธิบายสินค้า (TH)' : 'Description (TH)')}
                                </label>
                                <textarea name="descTh" value={form.descTh} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Description in Thai" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'ราคา' : 'Price')}
                                </label>
                                <input name="originalPrice" value={form.originalPrice} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" placeholder="0.00" required />
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'ป้ายชื่อ' : 'Tags')}
                                </label>
                                <input
                                    name="tags"
                                    value={form.tags}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder={(i18n.language === "th" ? 'ตัวอย่าง: ตุ๊กตา,เสื้อผ้า,กางเกง' : 'Exp: Doll,Cloth,Pants')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    {(i18n.language === "th" ? 'สถานะ' : 'Status')}
                                </label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                {(i18n.language === "th" ? 'ยกเลิก' : 'Cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                                disabled={submitting}
                            >
                                {submitting ? (i18n.language === "th" ? 'กำลังสร้าง' : 'Creating') : (i18n.language === "th" ? 'สร้าง' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </>
    );
}

export default CreateNewProductModal;


