import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
import axios from "axios";
import CreateNewProductModal from './CreateNewProductModal';
import { getDeviceFingerprint } from "../lib/fingerprint";
import AddVariantModal from "./AddVariantModal";
import EditProductModal from "./EditProductModal";

const successPopupStyle = {
    position: "fixed",
    bottom: 20, left: 20,
    background: "#28a745",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1200,
    fontSize: 16,
    fontWeight: 600,
    animation: "slideUp 0.3s ease-out"
};

const btnStyle = base => ({
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold", ...base
});

function ProductsConfigShopping() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [variantImageIndex, setVariantImageIndex] = useState(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, productId: null });
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    // const [submitting, setSubmitting] = useState(false);

    const [confirmDeleteVariant, setConfirmDeleteVariant] = useState({ open: false, productId: null, sku: null });
    const [showImageLargerModal, setShowImageLargerModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const getSortedVariantImages = (variant) => {
        if (!variant || !Array.isArray(variant.images)) return [];
        return [...variant.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    };

    const reloadProducts = async () => {
        if (!user?.userId) {
            setError('User not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/shopping/product/creator/${user.userId}`);
            setProducts(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reloadProducts();
    }, [user?.userId]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch {
            return '-';
        }
    };

    const formatPrice = (price, currency) => {
        if (!price) return '-';
        return `${price} ${currency || 'THB'}`;
    };



    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const openVariantModal = (variant) => {
        setSelectedVariant(variant);
        setVariantImageIndex(0);
        setIsVariantModalOpen(true);
    };

    const closeVariantModal = () => {
        setIsVariantModalOpen(false);
        setSelectedVariant(null);
        setVariantImageIndex(0);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const fp = await getDeviceFingerprint();
            const response = await axios.delete(`${BASE_URL}/shopping/product/${productId}`,
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true
                }
            );
            setIsModalOpen(false)
            setSuccessPopup({ show: true, message: "Remove Complete" });
            setTimeout(() => reloadProducts(), 250);
            setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
        }
        catch (error) {
            console.error("Error remove product:", error.response?.data || error);
        }
    }

    const handleDeleteVariant = async (productId, sku) => {
        try {
            console.log(`productId =>${productId}`)
            console.log(`sku => ${sku}`)
            const fp = await getDeviceFingerprint();
            const response = await axios.delete(`${BASE_URL}/shopping/product/variant/delete/${productId}`, {
                data: { skuVariant: sku },  // 👈 ใส่ body ตรงนี้
                headers: { "device-fingerprint": fp },
                withCredentials: true
            }
            );
            setIsVariantModalOpen(false)
            setIsModalOpen(false)
            setSuccessPopup({ show: true, message: "Remove Complete" });
            reloadProducts()
            setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
        }
        catch (error) {
            console.error("Error remove product:", error.response?.data || error);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading products...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex justify-end">
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setIsCreateOpen(true)}
                    style={{
                        ...btnStyle({
                            background: "#635bff",
                            color: "#fff",
                            fontSize: 18,
                            boxShadow: "0 2px 8px rgba(99,91,255,0.15)"
                        })
                    }}
                >
                    Create New Product
                </button>
            </div>
            {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No products found
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Updated At
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title (EN)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description (EN)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tags
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product, index) => (
                                <tr key={product._id || index} className="hover:bg-gray-50 cursor-pointer" onClick={() => openModal(product)}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {product.image && product.image.length > 0 ? (
                                            <img
                                                src={product.image[0].fileName}
                                                alt={product.title?.en || 'Product'}
                                                className="h-12 w-12 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(product.createdAt)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(product.updatedAt)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {product.title?.en || '-'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {product.description?.en || '-'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatPrice(product.originalPrice, product.currency)}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : product.status === 'inactive'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {product.status || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(product.tags) && product.tags.length > 0 ? (
                                                <>
                                                    {product.tags.slice(0, 3).map((tag, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {product.tags.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-200 text-gray-500 rounded text-xs">
                                                            ...
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No tags</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CreateNewProductModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                creatorId={user?.userId}
                onCreated={() => {
                    reloadProducts()
                    setSuccessPopup({ show: true, message: "Create Complete" });
                    reloadProducts()
                    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
                }}
            />

            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
                    <div className="bg-white w-full max-w-5xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">Product Details</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={closeModal}>✕</button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                            {/* Images */}
                            <div>
                                <div className="text-sm font-medium text-gray-500 mb-2">Images</div>
                                <div className="flex gap-3 flex-wrap">
                                    {Array.isArray(selectedProduct.image) && selectedProduct.image.length > 0 ? (
                                        selectedProduct.image.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img.fileName}
                                                alt={`image-${idx}`}
                                                className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    setSelectedImage(img.fileName);
                                                    setShowImageLargerModal(true);
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-gray-400">No images</div>
                                    )}
                                </div>
                            </div>

                            {/* Basic info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Title (EN)</div>
                                    <div className="text-gray-900">{selectedProduct.title?.en || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Title (TH)</div>
                                    <div className="text-gray-900">{selectedProduct.title?.th || '-'}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="text-sm font-medium text-gray-500">Description (EN)</div>
                                    <div className="text-gray-900 whitespace-pre-wrap">{selectedProduct.description?.en || '-'}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="text-sm font-medium text-gray-500">Description (TH)</div>
                                    <div className="text-gray-900 whitespace-pre-wrap">{selectedProduct.description?.th || '-'}</div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Price</div>
                                    <div className="text-gray-900">{formatPrice(selectedProduct.originalPrice, selectedProduct.currency)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Status</div>
                                    <div className="text-gray-900 capitalize">{selectedProduct.status || '-'}</div>
                                </div>
                            </div>

                            {/* Flags */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">isLimited</div>
                                    <div className="text-gray-900">{String(selectedProduct.isLimited ?? '-')}</div>
                                </div>

                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Created At</div>
                                    <div className="text-gray-900">{formatDate(selectedProduct.createdAt)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Updated At</div>
                                    <div className="text-gray-900">{formatDate(selectedProduct.updatedAt)}</div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Tags</div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(selectedProduct.tags) && selectedProduct.tags.length > 0 ? (
                                        selectedProduct.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{tag}</span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400">No tags</span>
                                    )}
                                </div>
                            </div>

                            {/* Variants */}
                            <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Variants</div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(selectedProduct.variants) && selectedProduct.variants.length > 0 ? (
                                        selectedProduct.variants.map((v, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
                                                onClick={() => openVariantModal(v)}
                                            >
                                                {v.sku || `SKU-${idx + 1}`}
                                            </button>
                                        ))
                                    ) : (
                                        <span className="text-gray-400">No variants</span>
                                    )}
                                </div>
                            </div>

                        </div>


                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsEditOpen(true);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                title="Edit Product"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 4h2M4 20h16M4 20l1.5-5.5L16.5 3.5a2.121 2.121 0 013 3L8.5 17.5 4 20z"
                                    />
                                </svg>
                            </button>


                            <button
                                type="button"
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                onClick={() => setShowVariantModal(true)}
                            >
                                Add Variant
                            </button>

                            <button
                                onClick={() => {
                                    setConfirmDelete({ open: true, productId: selectedProduct._id });
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 "
                                title="Delete Product"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>

                    </div>
                </div>
            )}

            <EditProductModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                product={selectedProduct}
                onUpdated={() => {
                    setSuccessPopup({ show: true, message: "Update Complete" });
                    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
                    setTimeout(() => reloadProducts(), 250);
                    setIsModalOpen(false)
                }}
            />

            {/* Image Larger Modal */}
            {showImageLargerModal && selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowImageLargerModal(false)}>
                    <div className="relative max-w-2xl max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-2 shadow-lg transition-colors"
                            onClick={() => setShowImageLargerModal(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Large view"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {isVariantModalOpen && selectedVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeVariantModal}>
                    <div className="bg-white w-full max-w-xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3
                                className="text-lg font-semibold"
                            >
                                Variant Details
                            </h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={closeVariantModal}>✕</button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <div className="text-sm font-medium text-gray-500 mb-2">Images</div>
                                    {(() => {
                                        const images = getSortedVariantImages(selectedVariant);
                                        if (!images.length) {
                                            return <div className="text-gray-400">No images</div>;
                                        }
                                        const current = images[variantImageIndex % images.length];
                                        const showPrevImage = () => setVariantImageIndex((prev) => (prev - 1 + images.length) % images.length);
                                        const showNextImage = () => setVariantImageIndex((prev) => (prev + 1) % images.length);
                                        return (
                                            <div>
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 border rounded text-xs bg-white text-black hover:bg-gray-100"
                                                        onClick={showPrevImage}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                                                        </svg>
                                                    </button>
                                                    <img
                                                        src={current.fileName}
                                                        alt={`${selectedVariant.sku || 'variant'}-${variantImageIndex + 1}`}
                                                        className="h-40 w-40 object-cover rounded"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 border rounded text-xs bg-white text-black hover:bg-gray-100"
                                                        onClick={showNextImage}
                                                        aria-label="Next"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 0 0 .708L10.293 8l-5.647 5.646a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708l-6-6a.5.5 0 0 0-.708 0z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="text-center text-xs text-gray-500 mt-1">
                                                    {variantImageIndex + 1} / {images.length}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">SKU</div>
                                    <div className="text-gray-900">{selectedVariant.sku || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Price</div>
                                    <div className="text-gray-900">{selectedVariant.price != null ? `${selectedVariant.price} ${selectedVariant.currency || 'THB'}` : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Stock</div>
                                    <div className="text-gray-900">{selectedVariant.quantity ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Sold out</div>
                                    <div className="text-gray-900">{selectedVariant.soldQuantity ?? '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Attributes</div>
                                    <div className="text-gray-900">
                                        {selectedVariant.attributes && Object.keys(selectedVariant.attributes).length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                                                    <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{key}: {String(value)}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => {
                                    setConfirmDeleteVariant({ open: true, productId: selectedProduct._id, sku: selectedVariant.sku });
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 "
                                title="Delete Product"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {confirmDelete.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDelete({ open: false, productId: null })}>
                    <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-gray-700">คุณต้องการลบสินค้าใช่หรือไม่?</p>
                            {selectedProduct?.title?.en || selectedProduct?.title?.th ? (
                                <p className="text-sm text-gray-500">{selectedProduct?.title?.en || selectedProduct?.title?.th}</p>
                            ) : null}
                            <p className="text-sm text-red-600">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onClick={() => setConfirmDelete({ open: false, productId: null })}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={() => {
                                    if (confirmDelete.productId) {
                                        handleDeleteProduct(confirmDelete.productId);
                                    }
                                    setConfirmDelete({ open: false, productId: null });
                                }}
                            >
                                ลบสินค้า
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmDeleteVariant.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDeleteVariant({ open: false, productId: null, sku: null })}>
                    <div className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-gray-700">คุณต้องการลบ variant นี้ใช่หรือไม่?</p>
                            {selectedVariant.sku ? (
                                <p className="text-sm text-gray-500">{selectedVariant.sku}</p>
                            ) : null}
                            <p className="text-sm text-red-600">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                        </div>
                        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onClick={() => setConfirmDeleteVariant({ open: false, productId: null, sku: null })}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={() => {
                                    handleDeleteVariant(confirmDeleteVariant.productId, confirmDeleteVariant.sku);
                                    setConfirmDeleteVariant({ open: false, productId: null, sku: null });
                                }}
                            >
                                ลบ variant
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {successPopup.show && (
                <div
                    style={successPopupStyle}
                >
                    {successPopup.message}
                </div>
            )}
            <AddVariantModal
                isOpen={showVariantModal}
                onClose={() => {
                    setShowVariantModal(false)
                }}
                productId={selectedProduct?._id}
                onCompleted={() => {
                    setIsModalOpen(false)
                    setSuccessPopup({ show: true, message: "Add New Variant Complete" });
                    setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
                    setTimeout(() => reloadProducts(), 250);
                }}
            />
        </div>
    );
}

export default ProductsConfigShopping;