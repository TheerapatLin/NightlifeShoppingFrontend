import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function EditProductModal({ isOpen, onClose, product, onUpdated }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        titleEn: '',
        titleTh: '',
        descEn: '',
        descTh: '',
        originalPrice: '',
        status: 'inactive',
        tags: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (product && isOpen) {
            setForm({
                titleEn: product?.title?.en || '',
                titleTh: product?.title?.th || '',
                descEn: product?.description?.en || '',
                descTh: product?.description?.th || '',
                originalPrice: product?.originalPrice != null ? String(product.originalPrice) : '',
                status: product?.status || 'inactive',
                tags: Array.isArray(product?.tags) ? product.tags : [],
            });
            setError(null);
        }
    }, [product, isOpen]);

    if (!isOpen || !product) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRemoveTag = (indexToRemove) => {
        setForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, idx) => idx !== indexToRemove),
        }));
    };

    const handleAddTag = () => {
        const value = String(newTag).trim();
        if (!value) return;
        setForm((prev) => ({
            ...prev,
            tags: prev.tags.includes(value) ? prev.tags : [...prev.tags, value],
        }));
        setNewTag('');
    };

    const handleNewTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            const fp = await getDeviceFingerprint();
            const payload = {
                creatorId: user.userId,
                title: {
                    en: form.titleEn.trim(),
                    th: form.titleTh.trim()
                },
                description: {
                    en: form.descEn.trim(),
                    th: form.descTh.trim()
                },
                originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
                tags: form.tags,
                status: form.status || 'inactive',
            };

            await axios.patch(
                `${BASE_URL}/shopping/product/${product._id}`,
                payload,
                {
                    headers: { 'device-fingerprint': fp },
                    withCredentials: true,
                }
            );

            if (typeof onUpdated === 'function') onUpdated();
            if (typeof onClose === 'function') onClose();
        } catch (err) {
            console.error('Error updating product:', err.response?.data || err);
            setError('Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Edit Product</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Title (EN)</label>
                            <input name="titleEn" value={form.titleEn} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Title in English" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Title (TH)</label>
                            <input name="titleTh" value={form.titleTh} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Title in Thai" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Description (EN)</label>
                            <textarea name="descEn" value={form.descEn} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Description in English" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">Description (TH)</label>
                            <textarea name="descTh" value={form.descTh} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Description in Thai" />
                        </div>
                    </div>

                    {/* Tags display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Tags</label>
                        <div className="flex flex-wrap">
                            {Array.isArray(form.tags) && form.tags.length > 0 ? (
                                form.tags.map((tag, idx) => (
                                    <div key={`${tag}-${idx}`} className="inline-flex items-center bg-white border border-black rounded px-2 py-1 mr-2 mb-2">
                                        <span className="text-sm mr-2">{String(tag)}</span>
                                        <button type="button" aria-label="remove tag" onClick={() => handleRemoveTag(idx)} className="text-black w-5 h-5 flex items-center justify-center leading-none">
                                            ✕
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 mr-2 mb-2">No tags</div>
                            )}
                            {/* New tag input and add button at the end */}
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={handleNewTagKeyDown}
                                placeholder="เพิ่มแท็ก"
                                className="h-8 px-2 mr-2 mb-2 border border-black rounded bg-white text-sm"
                                style={{ minWidth: 100 }}
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 border border-black rounded px-2 py-1 mr-2 mb-2 text-black"
                                title="Add tag"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Price</label>
                            <input name="originalPrice" value={form.originalPrice} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" placeholder="0.00" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button type="button" className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProductModal;


