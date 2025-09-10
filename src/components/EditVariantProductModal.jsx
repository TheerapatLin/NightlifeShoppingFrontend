import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDeviceFingerprint } from "../lib/fingerprint";
import imageCompression from "browser-image-compression";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function EditVariantProductModal({ isOpen, onClose, productId, variant, onUpdated }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        sku: '',
        newSku: '',
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
    const [imageEntries, setImageEntries] = useState([]);
    const [indexesDelete, setIndexesDelete] = useState([]);

    useEffect(() => {
        if (variant && isOpen) {
            setForm({
                sku: variant?.sku || '',
                newSku: '',
                attributes: {
                    size: variant?.attributes?.size || '',
                    color: variant?.attributes?.color || '',
                    material: variant?.attributes?.material || ''
                },
                price: variant?.price != null ? String(variant.price) : '',
                quantity: variant?.quantity != null ? String(variant.quantity) : '',
                soldQuantity: variant?.soldQuantity != null ? String(variant.soldQuantity) : ''
            });
            setError(null);
            setIndexesDelete([]); // Reset indexes to delete
            // initialize images from existing variant
            const initialImages = Array.isArray(variant.images)
                ? variant.images.slice(0, 6).map((img, index) => ({ kind: 'existing', order: index, previewUrl: img.fileName }))
                : [];
            setImageEntries(initialImages);
        }
    }, [variant, isOpen]);

    if (!isOpen || !variant) return null;

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
            const payload = {
                sku: form.sku,
                newSku: form.newSku?.trim() ? form.newSku.trim() : null,
                attributes: {
                    size: form.attributes.size,
                    color: form.attributes.color,
                    material: form.attributes.material
                },
                price: form.price !== '' ? Number(form.price) : undefined,
                quantity: form.quantity !== '' ? Number(form.quantity) : undefined,
                soldQuantity: form.soldQuantity !== '' ? Number(form.soldQuantity) : undefined,
                indexesDelete: indexesDelete.length > 0 ? indexesDelete : undefined,
            };

            console.log(`imageEntries.length => ${imageEntries.length}`)
            console.log(`indexesDelete => ${JSON.stringify(indexesDelete, null, 2)}`)
             
            // prepare and upload images if any entries exist
            if (imageEntries) {
                              // compress files like AddVariantModal
                const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
                const compressedFiles = await Promise.all(
                    imageEntries
                        .filter(entry => entry.kind === 'new' && entry.file) // only compress new files
                        .map(entry => imageCompression(entry.file, options))
                );
                const formData = new FormData();
                compressedFiles.forEach((f) => formData.append('image', f));
                formData.append('userId', user.userId);
                const skuForImages = payload.newSku?.trim ? payload.newSku : form.sku;
                formData.append('sku', skuForImages);
                formData.append('indexes', indexesDelete);
                console.log(`IF indexesDelete => ${JSON.stringify(indexesDelete, null, 2)}`)

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

            await axios.patch(
                `${BASE_URL}/shopping/product/variant/edit/${productId}`,
                payload,
                {
                    headers: { 'device-fingerprint': fp },
                    withCredentials: true,
                }
            );

            if (typeof onUpdated === 'function') onUpdated();
            if (typeof onClose === 'function') onClose();
        } catch (err) {
            console.error('Error updating variant:', err.response?.data || err);
            setError(err.response?.data?.error || 'Failed to update variant');
        } finally {
            setSubmitting(false);
        }
    };

    const removeImageAtIndex = (index) => {
        const toRemove = imageEntries[index];
        if (toRemove && toRemove.kind === 'new' && toRemove.previewUrl) {
            URL.revokeObjectURL(toRemove.previewUrl);
        }
        
        // Add order to indexesDelete for API deletion (only for existing images)
        if (toRemove && toRemove.kind === 'existing') {
            setIndexesDelete((prev) => [...prev, toRemove.order]);
        }
        
        // Remove from display
        setImageEntries((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Edit Variant</h3>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0"
                >
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                    )}

                    <p className="text-sm text-gray-600 mb-2">สามารถใส่รูปได้สูงสุด 6 รูป</p>
                    {imageEntries.length === 6 && (
                        <p className="text-sm text-red-600 mb-2">คุณไม่สามารถเพิ่มรูปมากไปกว่านี้ได้แล้ว</p>
                    )}

                    <div className="w-full flex justify-center">
                        <div className="grid grid-cols-3 gap-2 w-64">
                            {imageEntries.map((entry, idx) => (
                                <div key={idx} className="relative w-full h-20 bg-gray-100 overflow-hidden rounded">
                                    <img src={entry.previewUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        className="absolute top-1 left-1 w-3 h-3 rounded bg-red-600 text-white flex items-center justify-center shadow-md"
                                        aria-label={`remove image ${idx + 1}`}
                                        onClick={() => removeImageAtIndex(idx)}
                                    >
                                        ×
                                    </button>
                                </div>)
                            )}
                            {imageEntries.length < 6 && (
                                <button
                                    type="button"
                                    className="w-full h-20 flex items-center justify-center bg-black text-white rounded hover:opacity-90"
                                    onClick={() => document.getElementById('edit-variant-file-input')?.click()}
                                >
                                    <span className="text-xl">+</span>
                                </button>
                            )}
                        </div>
                        <input
                            id="edit-variant-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                if (imageEntries.length >= 6) return;
                                const url = URL.createObjectURL(file);
                                setImageEntries((prev) => [...prev, { kind: 'new', order: prev.length, file, previewUrl: url }]);
                                e.target.value = '';
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Current SKU</label>
                            <input name="sku" value={form.sku} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-gray-100" disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">New SKU</label>
                            <input name="newSku" value={form.newSku} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Price</label>
                            <input name="price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" step="0.01" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                            <input name="quantity" value={form.quantity} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Sold Quantity</label>
                            <input name="soldQuantity" value={form.soldQuantity} onChange={handleChange} className="w-full border rounded px-3 py-2" type="number" min="0" placeholder="0" />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-md font-medium text-gray-700 mb-3">Attributes</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Size</label>
                                <input name="attributes.size" value={form.attributes.size} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., S, M, L, XL" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
                                <input name="attributes.color" value={form.attributes.color} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., Red, Blue, Black" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Material</label>
                                <input name="attributes.material" value={form.attributes.material} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., Cotton, Polyester" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
                            onClick={() => {
                                // cleanup object URLs for new images
                                setImageEntries(() => {
                                    return Array.isArray(variant.images)
                                        ? variant.images.slice(0, 6).map((img, index) => ({ kind: 'existing', order: index, previewUrl: img.fileName }))
                                        : [];
                                });
                                setIndexesDelete([]); // Reset indexes to delete
                                onClose();
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditVariantProductModal;


