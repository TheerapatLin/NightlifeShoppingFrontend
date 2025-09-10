import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
import axios from "axios";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { Camera } from "lucide-react";
import imageCompression from "browser-image-compression";

function AddVariantModal({ isOpen, onClose, productId, onCompleted }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        sku: '',
        attributes: {
            size: '',
            color: '',
            material: ''
        },
        price: '',
        quantity: '',
        soldQuantity: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const fileInputRef = useRef(null);

    const removeImageAtIndex = (index) => {
        setImagePreviews((prev) => {
            if (prev[index]) URL.revokeObjectURL(prev[index]);
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
        setImageFiles((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('attributes.')) {
            const attributeName = name.split('.')[1];
            setForm((prev) => ({
                ...prev,
                attributes: {
                    ...prev.attributes,
                    [attributeName]: value
                }
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            const fp = await getDeviceFingerprint();
            const response = await axios.patch(`${BASE_URL}/shopping/product/variant/add/${productId}`, {
                variants: [
                    {
                        sku: form.sku,
                        attributes: form.attributes,
                        price: parseInt(form.price, 10),
                        quantity: parseInt(form.quantity, 10),
                        soldQuantity: parseInt(form.soldQuantity, 10)
                    }
                ]
            }, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            })

            // Upload images for this variant if selected
            if (imageFiles && imageFiles.length) {
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
                const compressedFiles = await Promise.all(
                    imageFiles.map((file) => imageCompression(file, options))
                );
                const formData = new FormData();
                compressedFiles.forEach((f) => formData.append('image', f));
                formData.append('userId', user.userId);
                formData.append('sku', form.sku);

                await axios.patch(
                    `${BASE_URL}/shopping/product/variant/add-image/${productId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'device-fingerprint': fp,
                        },
                        withCredentials: true,
                    }
                );
            }

            if (typeof onClose === 'function') onClose();
            if (typeof onCompleted === 'function') onCompleted();
        } catch (err) {
            console.error("Error creating variant:", err.response?.data || err);
            setError("Failed to create variant");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Add Product Variant</h3>
                    <button className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                            setForm({
                                sku: '',
                                attributes: {
                                    size: '',
                                    color: '',
                                    material: ''
                                },
                                price: '',
                                quantity: '',
                                soldQuantity: ''
                            })
                            // cleanup previews
                            setImagePreviews((prev) => {
                                prev.forEach((u) => URL.revokeObjectURL(u));
                                return [];
                            })
                            setImageFiles([])
                            onClose()
                        }}
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                    )}

                    <p className="text-sm text-gray-600 mb-2">สามารถใส่รูปได้สูงสุด 6 รูป</p>
                    {imagePreviews.length === 6 && (
                        <p className="text-sm text-red-600 mb-2">คุณไม่สามารถเพิ่มรูปมากไปกว่านี้ได้แล้ว</p>
                    )}

                    <div className="w-full flex justify-center">
                        <div className="grid grid-cols-3 gap-2 w-64">
                            {imagePreviews.map((src, idx) => (                                
                                <div key={idx} className="relative w-full h-20 bg-gray-100 overflow-hidden rounded">                                    
                                    <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        className="absolute top-1 left-1 w-3 h-3 rounded bg-red-600 text-white flex items-center justify-center shadow-md"
                                        aria-label={`remove image ${idx + 1}`}
                                        onClick={() => removeImageAtIndex(idx)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {imagePreviews.length < 6 && (
                                <button
                                    type="button"
                                    className="w-full h-20 flex items-center justify-center bg-black text-white rounded hover:opacity-90"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="text-xl">+</span>
                                </button>
                            )}
                        </div>
                        <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                if (imageFiles.length >= 6) return;
                                const url = URL.createObjectURL(file);
                                setImageFiles((prev) => [...prev, file]);
                                setImagePreviews((prev) => [...prev, url]);
                                // clear input to allow selecting the same file name again
                                e.target.value = '';
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">SKU *</label>
                            <input
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Product SKU"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Price</label>
                            <input
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                            <input
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Sold Quantity</label>
                            <input
                                name="soldQuantity"
                                value={form.soldQuantity}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-md font-medium text-gray-700 mb-3">Attributes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Size</label>
                                <input
                                    name="attributes.size"
                                    value={form.attributes.size}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="e.g., S, M, L, XL"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
                                <input
                                    name="attributes.color"
                                    value={form.attributes.color}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="e.g., Red, Blue, Black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Material</label>
                                <input
                                    name="attributes.material"
                                    value={form.attributes.material}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="e.g., Cotton, Polyester"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
                            onClick={() => {
                                setForm({
                                    sku: '',
                                    attributes: {
                                        size: '',
                                        color: '',
                                        material: ''
                                    },
                                    price: '',
                                    quantity: '',
                                    soldQuantity: ''
                                })
                                // cleanup previews
                                setImagePreviews((prev) => {
                                    prev.forEach((u) => URL.revokeObjectURL(u));
                                    return [];
                                })
                                setImageFiles([])
                                onClose()
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={submitting}
                        >
                            {submitting ? 'Adding...' : 'Add Variant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddVariantModal;
