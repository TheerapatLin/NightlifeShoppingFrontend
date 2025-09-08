import React, { useState } from 'react';
import axios from "axios";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function CreateNewProductModal({ isOpen, onClose, creatorId, onCreated }) {
    const [form, setForm] = useState({
        titleEn: '',
        titleTh: '',
        descEn: '',
        descTh: '',
        originalPrice: '',
        currency: 'THB',
        categoryId: '',
        tags: '',
        status: 'inactive',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

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
            await axios.post(`${BASE_URL}/shopping/product`,
                {
                    creatorId: user.userId,
                    title: { en: form.titleEn.trim(), th: form.titleTh.trim() },
                    description: { en: form.descEn.trim(), th: form.descTh.trim() },
                    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                    currency: form.currency || 'THB',
                    categoryId: form.categoryId.trim(),
                    tags: form.tags
                        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
                        : [],
                    status: form.status || 'inactive'
                }, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            });
            
            if (typeof onClose === 'function') onClose();
        } catch (err) {
            console.error("Error creating product:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Create New Product</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">title.en</label>
                            <input name="titleEn" value={form.titleEn} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Title in English" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">title.th</label>
                            <input name="titleTh" value={form.titleTh} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Title in Thai" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">description.en</label>
                            <textarea name="descEn" value={form.descEn} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Description in English" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">description.th</label>
                            <textarea name="descTh" value={form.descTh} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Description in Thai" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">originalPrice</label>
                            <input name="originalPrice" value={form.originalPrice} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" placeholder="0.00" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">currency</label>
                            <input name="currency" value={form.currency} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="THB" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">categoryId</label>
                            <input name="categoryId" value={form.categoryId} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Category ObjectId" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">tags</label>
                            <input name="tags" value={form.tags} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="comma,separated,tags" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateNewProductModal;


