import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
import axios from "axios";
import CreateNewProductModal from './CreateNewProductModal';
import { getDeviceFingerprint } from "../lib/fingerprint";

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

function ProductsConfigShopping() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryNamesById, setCategoryNamesById] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [variantImageIndex, setVariantImageIndex] = useState(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, productId: null });

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

    // Fetch category names for unique categoryIds and cache them
    useEffect(() => {
        const loadCategoryNames = async () => {
            if (!products || products.length === 0) return;

            const uniqueIds = Array.from(
                new Set(
                    products
                        .map(p => p?.categoryId)
                        .filter(Boolean)
                )
            ).filter(id => !(id in categoryNamesById));

            if (uniqueIds.length === 0) return;

            try {
                const results = await Promise.all(
                    uniqueIds.map(async (id) => {
                        try {
                            const res = await axios.get(`${BASE_URL}/shopping/category/${id}`);
                            const cat = res.data;
                            const name = cat?.name?.en || cat?.name?.th || '-';
                            return [id, name];
                        } catch (err) {
                            console.error('Failed to fetch category', id, err);
                            return [id, '-'];
                        }
                    })
                );

                const mapUpdate = results.reduce((acc, [id, name]) => {
                    acc[id] = name;
                    return acc;
                }, {});

                setCategoryNamesById(prev => ({ ...prev, ...mapUpdate }));
            } catch (err) {
                console.log(`loadCategoryNames Error: ${err}`)
            }
        };

        loadCategoryNames();
    }, [products]);

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
        console.log(`productId => ${productId}`)
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
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
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
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {categoryNamesById[product.categoryId] || product.categoryId || '-'}
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
                onCreated={() => reloadProducts()}
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
                                            <img key={idx} src={img.fileName} alt={`image-${idx}`} className="h-20 w-20 object-cover rounded" />
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

                            {/* Pricing & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Price</div>
                                    <div className="text-gray-900">{formatPrice(selectedProduct.originalPrice, selectedProduct.currency)}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Category</div>
                                    <div className="text-gray-900">{categoryNamesById[selectedProduct.categoryId] || selectedProduct.categoryId || '-'}</div>
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
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Category ID</div>
                                    <div className="text-gray-900">{selectedProduct.categoryId || '-'}</div>
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
                            <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700" onClick={closeModal}>Close</button>
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

            {isVariantModalOpen && selectedVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeVariantModal}>
                    <div className="bg-white w-full max-w-xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold">Variant Details</h3>
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
                                                    <button type="button" className="px-2 py-1 border rounded text-xs bg-black hover:bg-white" onClick={showPrevImage}>

                                                    </button>
                                                    <img
                                                        src={current.fileName}
                                                        alt={`${selectedVariant.sku || 'variant'}-${variantImageIndex + 1}`}
                                                        className="h-40 w-40 object-cover rounded"
                                                    />
                                                    <button type="button" className="px-2 py-1 border rounded text-xs bg-black hover:bg-white" onClick={showNextImage}>

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
                            <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700" onClick={closeVariantModal}>Close</button>
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
            {successPopup.show && (
                <div
                    style={successPopupStyle}
                >
                    {successPopup.message}
                </div>
            )}
        </div>
    );
}

export default ProductsConfigShopping;