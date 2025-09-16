import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { useAuth } from '../context/AuthContext';

const ShoppingOrderIdManagerModal = ({ isOpen, onClose, orderId }) => {
    const { user } = useAuth();
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [productDetails, setProductDetails] = useState({});
    const [productLoading, setProductLoading] = useState(false);
    const [buyerLoading, setBuyerLoading] = useState(false);
    const [buyerError, setBuyerError] = useState(null);
    const [buyerName, setBuyerName] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!isOpen || !orderId) return;
            setLoading(true);
            setError(null);
            try {
                const fp = await getDeviceFingerprint();
                const res = await axios.get(`${BASE_URL}/shopping/order/id/${orderId}`,
                    {
                        headers: { "device-fingerprint": fp },
                        withCredentials: true,
                        params: { userId: user?.userId }
                    }
                );
                setOrder(res.data);
            } catch (err) {
                setError(err?.response?.data?.message || err.message || "Failed to load order");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [isOpen, orderId]);

    const getProductIdFromItem = (it) => {
        return it?.product?._id || it?.productId || it?.product?.id || it?.product || null;
    };

    useEffect(() => {
        const loadProducts = async () => {
            if (!order || !Array.isArray(order.items) || order.items.length === 0) return;
            const uniqueIds = [...new Set(order.items.map((it) => getProductIdFromItem(it)).filter(Boolean))];
            if (uniqueIds.length === 0) return;
            setProductLoading(true);
            try {
                const fp = await getDeviceFingerprint();
                const results = await Promise.all(
                    uniqueIds.map(async (id) => {
                        try {
                            const res = await axios.get(`${BASE_URL}/shopping/product/${id}`,
                                {
                                    headers: { "device-fingerprint": fp },
                                    withCredentials: true,
                                }
                            );
                            return [id, res.data];
                        } catch (e) {
                            return null;
                        }
                    })
                );
                const map = {};
                results.forEach((entry) => {
                    if (entry && entry[0]) {
                        map[entry[0]] = entry[1];
                    }
                });
                if (Object.keys(map).length > 0) {
                    setProductDetails((prev) => ({ ...prev, ...map }));
                }
            } finally {
                setProductLoading(false);
            }
        };
        loadProducts();
    }, [order]);

    useEffect(() => {
        const loadBuyer = async () => {
            if (!order || !order.userId) return;
            setBuyerLoading(true);
            setBuyerError(null);
            try {
                const fp = await getDeviceFingerprint();
                const res = await axios.get(`${BASE_URL}/accounts/getuserweb/${order.userId}`, {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                });
                const data = res?.data || {};
                const nameCandidate = data?.authenticated_user?.name || null;
                setBuyerName(nameCandidate);
            } catch (err) {
                setBuyerError(err?.response?.data?.message || err.message || "Failed to load buyer");
                console.log(`Failed to load buyer:`, err?.response?.data?.message || err)
            } finally {
                setBuyerLoading(false);
            }
        };
        loadBuyer();
    }, [order, user?.userId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white w-[95%] max-w-3xl rounded-lg shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Order Detail</h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-black">✕</button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {loading && <div className="text-sm text-gray-600">Loading...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {!loading && !error && order && (
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500">Order ID</div>
                                <div className="text-sm text-black break-all">{order._id}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">Buyer</div>
                                    <div className="text-sm text-black  ">{buyerLoading ? 'Loading...' : (buyerName || '-')}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Status</div>
                                    <div className="text-sm text-black  ">{order.status || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Original Price</div>
                                    <div className="text-sm text-black ">{order.originalPrice} THB</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Paid At</div>
                                    <div className="text-sm text-black ">{order.paidAt || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Created At</div>
                                    <div className="text-sm text-black ">{order.createdAt || order.createAt || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Updated At</div>
                                    <div className="text-sm text-black ">{order.updatedAt || order.updateAt || '-'}</div>
                                </div>
                            </div>

                            {order.paymentMetadata && (
                                <div>
                                    <div className="text-sm font-semibold mb-1">Payment</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-500">Brand</div>
                                            <div className="text-sm text-black " >{order.paymentMetadata.brand || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Last 4</div>
                                            <div className="text-sm text-black ">{order.paymentMetadata.last4 ? `•••• ${order.paymentMetadata.last4}` : '-'}</div>
                                        </div>
                                        {order.paymentMetadata.receiptUrl && (
                                            <p className="text-black">
                                                <div className="text-xs text-gray-500">ใบเสร็จ
                                                    <a
                                                        href={order.paymentMetadata.receiptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        ดูใบเสร็จ
                                                    </a>
                                                </div>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {order.ShippingAddress && (
                                <div>
                                    <div className="text-sm font-semibold mb-1">Address</div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500">Address Name</div>
                                            <div className="font-medium text-sm text-black ">{order.ShippingAddress.addressName || '-'}</div>
                                        </div>
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500">Status</div>
                                            <div className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {order.ShippingAddress.addressStatus || '-'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-500">Address Details</div>
                                            <div className="text-sm">
                                                {order.ShippingAddress.address?.address && (
                                                    <div className="font-medium text-sm text-black ">{order.ShippingAddress.address.address}</div>
                                                )}
                                                <div className="flex gap-2 font-medium text-sm text-black ">
                                                    {order.ShippingAddress.address?.city && (
                                                        <span>{order.ShippingAddress.address.city}</span>
                                                    )}
                                                    {order.ShippingAddress.address?.province && (
                                                        <span>{order.ShippingAddress.address.province}</span>
                                                    )}
                                                    {order.ShippingAddress.address?.country && (
                                                        <span>{order.ShippingAddress.address.country}</span>
                                                    )}
                                                </div>
                                                {order.ShippingAddress.address?.description && (
                                                    <div className="text-xs text-black  mt-1">
                                                        {order.ShippingAddress.address.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {Array.isArray(order.items) && order.items.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-1 text-black ">Items</div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full table-auto text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-black ">Product</th>
                                                    <th className="px-3 py-2 text-left text-black ">Variant</th>
                                                    <th className="px-3 py-2 text-left text-black ">Qty</th>
                                                    <th className="px-3 py-2 text-left text-black ">Price</th>
                                                    <th className="px-3 py-2 text-left text-black ">Status</th>
                                                    <th className="px-3 py-2 text-left text-black ">Admin Note</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((it, idx) => {
                                                    const productId = getProductIdFromItem(it);
                                                    const product = productId ? productDetails[productId] : null;
                                                    const productTitle = product?.title?.en || product?.title || product?.name || (productLoading ? 'Loading...' : '-');

                                                    let variantSku = '-';
                                                    if (product && Array.isArray(product.variants)) {
                                                        if (typeof it?.variantIndex === 'number') {
                                                            variantSku = product.variants[it.variantIndex]?.sku || '-';
                                                        } else if (it?.variant?.sku) {
                                                            variantSku = it.variant.sku;
                                                        } else if (it?.variant?.name) {
                                                            const matched = product.variants.find((v) => v?.name === it.variant.name);
                                                            variantSku = matched?.sku || '-';
                                                        } else if (it?.variantId) {
                                                            const matched = product.variants.find((v) => v?._id === it.variantId);
                                                            variantSku = matched?.sku || '-';
                                                        }
                                                    }

                                                    return (
                                                        <tr key={idx} className="border-b">
                                                            <td className="px-3 py-2 text-black ">{productTitle}</td>
                                                            <td className="px-3 py-2 text-black ">{variantSku}</td>
                                                            <td className="px-3 py-2 text-black ">{it.quantity ?? '-'}</td>
                                                            <td className="px-3 py-2 text-black ">{it.originalPrice ?? '-'}</td>
                                                            <td className="px-3 py-2 text-black ">{it.status ?? 'preparing'}</td>
                                                            <td className="px-3 py-2 text-black ">{
                                                                Array.isArray(it?.adminNote) && it.adminNote.length > 0
                                                                    ? (typeof it.adminNote[0] === 'string' ? it.adminNote[0] : (it.adminNote[0]?.message || '-'))
                                                                    : '-'
                                                            }</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="text-sm font-semibold mb-1 text-black ">Admin Notes</div>
                                <div className="text-sm text-black ">
                                    {Array.isArray(order.adminNote) && order.adminNote.length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-1">
                                            {order.adminNote.map((n, i) => (
                                                <li key={i}>{typeof n === 'string' ? n : (n?.message || '-')}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm font-semibold mb-1">Raw</div>
                                <pre className="text-xs bg-gray-100 rounded p-3 overflow-x-auto text-black ">
                                    {JSON.stringify(order, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShoppingOrderIdManagerModal;


