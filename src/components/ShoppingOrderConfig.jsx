import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDeviceFingerprint } from "../lib/fingerprint";
import { useTranslation } from "react-i18next";


const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

// ----- Constants & Utilities -----
const STATUS_OPTIONS = [
    'preparing',
    'packed',
    'pending',
    'picked',
    'transit',
    'hub',
    'delivering',
    'delivered',
    'failed',
    'cancelled',
    'returning'
];

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

const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
}).format(amount);

const buildAdminNotePayload = (notes) => (Array.isArray(notes) ? notes : [])
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .map(message => ({ message }));

const extractNoteMessages = (notes) => Array.isArray(notes)
    ? notes.map(n => (typeof n === 'string' ? n : (n?.message || ''))).filter(Boolean)
    : [];

const getFPConfig = async () => {
    const fp = await getDeviceFingerprint();
    return { headers: { 'device-fingerprint': fp }, withCredentials: true };
};

function ShoppingOrderConfig({ onOrdersUpdate }) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productDetails, setProductDetails] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editStatus, setEditStatus] = useState('preparing');
    const [editAdminNotes, setEditAdminNotes] = useState([]);
    const [newAdminNote, setNewAdminNote] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    // Order-level admin note edit states
    const [isEditOrderNoteOpen, setIsEditOrderNoteOpen] = useState(false);
    const [editOrderAdminNotes, setEditOrderAdminNotes] = useState([]);
    const [newOrderAdminNote, setNewOrderAdminNote] = useState('');
    const [savingOrderNote, setSavingOrderNote] = useState(false);
    const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const fetchProductDetails = async (productId) => {
        if (!productId || productDetails[productId]) {
            return productDetails[productId];
        }

        try {
            const config = await getFPConfig();
            const res = await axios.get(`${BASE_URL}/shopping/product/${productId}`, config);

            const product = res.data;
            setProductDetails(prev => ({
                ...prev,
                [productId]: {
                    title: product.title?.en || 'Unknown Product',
                    creatorName: product.creator?.name || 'Unknown Creator'
                }
            }));

            return {
                title: product.title?.en || 'Unknown Product',
                creatorName: product.creator?.name || 'Unknown Creator'
            };
        } catch (err) {
            console.error(`Failed to fetch product ${productId}:`, err);
            setProductDetails(prev => ({
                ...prev,
                [productId]: {
                    title: 'Unknown Product',
                    creatorName: 'Unknown Creator'
                }
            }));
            return {
                title: 'Unknown Product',
                creatorName: 'Unknown Creator'
            };
        }
    };

    const loadOrders = async () => {
        if (!user?.userId) {
            setLoading(false);
            setOrders([]);
            setError('User not found');
            return [];
        }
        try {
            setLoading(true);
            const config = await getFPConfig();
            const res = await axios.get(`${BASE_URL}/shopping/creator-creatororder/${user.userId}`, config);
            const data = res?.data;
            const ordersArray = Array.isArray(data?.order) ? data.order : [];
            setOrders(ordersArray);
            setError(null);

            // Fetch product details for all orders
            const productPromises = ordersArray.map(order =>
                order.productId ? fetchProductDetails(order.productId) : Promise.resolve(null)
            );
            await Promise.all(productPromises);

            // Notify parent component about orders update
            if (onOrdersUpdate) {
                onOrdersUpdate();
            }
            return ordersArray;
        } catch (err) {
            setOrders([]);
            const message = err?.response?.data?.message || err?.message || 'Failed to fetch orders';
            setError(message);
            console.log(`Failed to fetch orders: ${message}`)
        } finally {
            setLoading(false);
        }
        return [];
    };

    const openEditItem = (item) => {
        setEditingItem(item);
        setEditStatus(item?.status || 'preparing');
        // Compose admin notes from order-level adminNote that are related (if any); default to empty
        setEditAdminNotes(extractNoteMessages(item?.adminNote));
        setIsEditModalOpen(true);
    };

    // Open order-level admin note editor
    const openEditOrderNotes = () => {
        setEditOrderAdminNotes(extractNoteMessages(selectedOrder?.adminNote));
        setNewOrderAdminNote('');
        setIsEditOrderNoteOpen(true);
    };

    const closeEditItem = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
        setEditStatus('preparing');
        setEditAdminNotes([]);
        setNewAdminNote('');
    };

    const closeEditOrderNotes = () => {
        setIsEditOrderNoteOpen(false);
        setEditOrderAdminNotes([]);
        setNewOrderAdminNote('');
    };

    const handleSaveEdit = async () => {
        if (!selectedOrder?._id || !editingItem?.sku || !selectedOrder?.productId) {
            return;
        }

        try {
            setSavingEdit(true);
            const config = await getFPConfig();
            const adminNoteArray = buildAdminNotePayload(editAdminNotes);

            await axios.patch(
                `${BASE_URL}/shopping/update-product-creatororder/${selectedOrder._id}`,
                {
                    adminNote: adminNoteArray,
                    status: editStatus,
                    productId: editingItem.productId,
                    sku: editingItem.sku
                },
                config
            );

            const refreshed = await loadOrders();
            if (Array.isArray(refreshed) && selectedOrder?._id) {
                const updated = refreshed.find(o => o._id === selectedOrder._id);
                if (updated) {
                    setSelectedOrder(updated);
                }
            }
            closeEditItem();
        } catch (err) {
            console.error('Failed to update item:', err.response?.data || err);
        } finally {
            setSavingEdit(false);
        }
    };

    const handleRemoveNote = (indexToRemove) => {
        setEditAdminNotes(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleAddNote = () => {
        const trimmed = newAdminNote.trim();
        if (!trimmed) return;
        setEditAdminNotes(prev => [...prev, trimmed]);
        setNewAdminNote('');
    };

    const handleRemoveOrderNote = (indexToRemove) => {
        setEditOrderAdminNotes(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleAddOrderNote = () => {
        const trimmed = newOrderAdminNote.trim();
        if (!trimmed) return;
        setEditOrderAdminNotes(prev => [...prev, trimmed]);
        setNewOrderAdminNote('');
    };

    const handleSaveOrderNotes = async () => {
        if (!selectedOrder?._id) return;
        try {
            setSavingOrderNote(true);
            const config = await getFPConfig();
            const adminNoteArray = buildAdminNotePayload(editOrderAdminNotes);

            await axios.patch(
                `${BASE_URL}/shopping/update-creatororder/${selectedOrder._id}`,
                { adminNote: adminNoteArray },
                config
            );

            const refreshed = await loadOrders();
            if (Array.isArray(refreshed) && selectedOrder?._id) {
                const updated = refreshed.find(o => o._id === selectedOrder._id);
                if (updated) setSelectedOrder(updated);
            }
            closeEditOrderNotes();
        } catch (err) {
            console.error('Failed to update order admin notes:', err.response?.data || err);
        } finally {
            setSavingOrderNote(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId]);

    // Prefetch product details for all variant items when an order is selected
    useEffect(() => {
        if (!selectedOrder || !Array.isArray(selectedOrder.variant)) return;
        const productIds = selectedOrder.variant
            .map(v => v?.productId)
            .filter(Boolean);
        const uniqueProductIds = Array.from(new Set(productIds));
        if (uniqueProductIds.length === 0) return;
        Promise.all(uniqueProductIds.map(pid => fetchProductDetails(pid))).catch(() => { });
    }, [selectedOrder]);

    // Auto-update creator order status based on item statuses
    useEffect(() => {
        const maybeUpdateOrderStatus = async () => {
            if (!selectedOrder?._id || updatingOrderStatus) return;
            const items = Array.isArray(selectedOrder.variant) ? selectedOrder.variant : [];
            if (items.length === 0) return;
            const allDelivered = items.every(it => it.status === 'delivered');
            const nonePreparing = items.every(it => it.status !== 'preparing');

            try {
                let nextStatus = null;
                // Prioritize 'successful' over 'processing'
                if (allDelivered && selectedOrder.status !== 'successful') {
                    nextStatus = 'successful';
                } else if (nonePreparing && !['processing', 'successful'].includes(selectedOrder.status)) {
                    nextStatus = 'processing';
                }

                if (nextStatus) {
                    setUpdatingOrderStatus(true);
                    const config = await getFPConfig();
                    await axios.patch(
                        `${BASE_URL}/shopping/update-creatororder/${selectedOrder._id}`,
                        { status: nextStatus },
                        config
                    );
                    const refreshed = await loadOrders();
                    if (Array.isArray(refreshed)) {
                        const updated = refreshed.find(o => o._id === selectedOrder._id);
                        if (updated) setSelectedOrder(updated);
                    }
                }
            } catch (err) {
                console.error('Failed to auto-update order status:', err.response?.data || err);
            } finally {
                setUpdatingOrderStatus(false);
            }
            return;
        };
        maybeUpdateOrderStatus();
        // Only re-evaluate when selectedOrder changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOrder]);

    return (
        <div className="p-6">
            {loading && (
                <div className="flex items-center p-3 mb-4 bg-white border border-gray-200 rounded">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-700">
                        {(i18n.language === "th" ? 'กำลังโหลดคำสั่งซื้อ...' : 'Loading orders...')}
                    </span>
                </div>
            )}
            {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}
            {orders.length === 0 ? (
                <div className="text-center py-8 text-500">
                    <h1>
                        {(i18n.language === "th" ? 'ไม่พบคำสั่งซื้อ' : 'No orders found')}
                    </h1>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {(i18n.language === "th" ? 'สร้างเมื่อ' : 'created At')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {(i18n.language === "th" ? 'ชื่อผู้ซื้อ' : 'buyer Name')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {(i18n.language === "th" ? 'ชื่อผู้ขาย' : 'creator Name')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {(i18n.language === "th" ? 'ชำระเมื่อ' : 'paid At')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {(i18n.language === "th" ? 'สถานะ' : 'status')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {(i18n.language === "th" ? 'หมายเหตุจากแอดมิน' : 'admin Note')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, idx) => (
                                <tr
                                    key={order._id || idx}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                    onClick={() => handleOrderClick(order)}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{order.buyer.name || order.buyer.id || 'Loading...'}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {order.creator.name || order.creator.id || 'Loading...'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order.paidAt)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'paid' || order.status === 'delivered' || order.status === 'successful'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'cancelled' || order.status === 'failed'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {Array.isArray(order.adminNote) && order.adminNote.length > 0
                                            ? 'มี'
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal */}
            {isModalOpen && selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {(i18n.language === "th" ? 'รายละเอียดคำสั่งซื้อ' : 'Order Details')}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Order Basic Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">
                                        {(i18n.language === "th" ? 'ข้อมูลคำสั่งซื้อ' : 'Order Details')}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>

                                        <p
                                            className="text-black"
                                        >
                                            <span
                                                className="font-medium"
                                            >
                                                {(i18n.language === "th" ? 'สถานะ' : 'Status')}:
                                            </span>
                                            <span
                                                className={`ml-2 px-2 py-1 text-xl font-semibold rounded-full ${selectedOrder.status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedOrder.status === 'cancelled' || selectedOrder.status === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                {selectedOrder.status || 'unknown'}
                                            </span>
                                        </p>

                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'สร้างเมื่อ' : 'Created At')}:</span> {formatDate(selectedOrder.createdAt)}</p>
                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'ชำระเมื่อ' : 'Paid At')}:</span> {formatDate(selectedOrder.paidAt)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">

                                    <h3 className="font-semibold text-black mb-2">
                                        {(i18n.language === "th" ? 'ข้อมูลผู้ซื้อ - ผู้ขาย' : 'Buyer - Creator')}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'ผู้ซื้อ' : 'Buyer')}:</span> {selectedOrder.buyer.name || selectedOrder.buyer.id || '-'}</p>
                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'ผู้ขาย' : 'Creator')}:</span> {productDetails[selectedOrder.productId]?.creatorName || '-'}</p>                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">
                                        {(i18n.language === "th" ? 'สรุปยอดเงิน' : 'Summary')}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        {selectedOrder.variant && selectedOrder.variant.length > 0 && (
                                            <p className="text-black font-semibold text-lg">
                                                {(i18n.language === "th" ? 'รวมทั้งหมด' : 'Total')}: {formatCurrency(selectedOrder.variant.reduce((sum, item) => sum + (item.totalPrice || 0), 0))}
                                            </p>
                                        )}
                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'จำนวนสินค้า' : 'Qty')}:</span> {selectedOrder.variant?.length || 0} รายการ</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            {selectedOrder.ShippingAddress && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">
                                        {(i18n.language === "th" ? 'ที่อยู่จัดส่ง' : 'Shipping Address')}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">ชื่อที่อยู่:</span> {selectedOrder.ShippingAddress.addressName || '-'}</p>

                                        <p
                                            className="text-black"
                                        >
                                            <span
                                                className="font-medium"
                                            >
                                                {(i18n.language === "th" ? 'สถานะ' : 'Status')}:
                                            </span>
                                            {selectedOrder.ShippingAddress.addressStatus || '-'}
                                        </p>

                                        {selectedOrder.ShippingAddress.address && (
                                            <div className="mt-2">
                                                <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'ที่อยู่' : 'Address')}:</span> {selectedOrder.ShippingAddress.address.address || '-'}</p>
                                                <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'เมือง' : 'City')}:</span> {selectedOrder.ShippingAddress.address.city || '-'}</p>
                                                <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'จังหวัด' : 'Province')}:</span> {selectedOrder.ShippingAddress.address.province || '-'}</p>
                                                <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'ประเทศ' : 'Country')}:</span> {selectedOrder.ShippingAddress.address.country || '-'}</p>
                                                {selectedOrder.ShippingAddress.address.description && (
                                                    <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'รายละเอียดเพิ่มเติม' : 'Additional Details')}:</span> {selectedOrder.ShippingAddress.address.description}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            {selectedOrder.paymentMetadata && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">
                                        {(i18n.language === "th" ? 'รายละเอียดการชำระเงิน' : 'Payment Details')}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'วิธีการชำระ' : 'Payment Method')}:</span> {selectedOrder.paymentMetadata.method || '-'}</p>
                                        <p className="text-black"><span className="font-medium">{(i18n.language === "th" ? 'บัตรเครดิต' : 'Credit Card')}:</span> {selectedOrder.paymentMetadata.brand || '-'} ****{selectedOrder.paymentMetadata.last4 || ''}</p>
                                        {selectedOrder.paymentMetadata.receiptUrl && (
                                            <p className="text-black">
                                                <span className="font-medium">{(i18n.language === "th" ? 'ใบเสร็จ' : 'Receipt')}:</span>
                                                <a
                                                    href={selectedOrder.paymentMetadata.receiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    {(i18n.language === "th" ? 'ดูใบเสร็จ' : 'View Receipt')}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Variant Products */}
                            {selectedOrder.variant && selectedOrder.variant.length > 0 && (
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">
                                        {(i18n.language === "th" ? 'สินค้าที่สั่งซื้อ' : 'Ordered Products')}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'ชื่อสินค้า' : 'Product Name')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'SKU' : 'SKU')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'จำนวน' : 'Qty')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'ราคาต่อชิ้น' : 'Price per item')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'ราคารวม' : 'Total Price')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'สถานะ' : 'Status')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'หมายเหตุจากแอดมิน' : 'Admin Note')}
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">
                                                        {(i18n.language === "th" ? 'แก้ไข' : 'Edit')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedOrder.variant.map((item, idx) => (
                                                    <tr key={item._id || idx}>
                                                        <td className="px-3 py-2 text-sm text-black">{productDetails[item.productId]?.title || item.productId || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{item.sku || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{item.quantity || 0}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{formatCurrency(item.originalPrice || 0)}</td>
                                                        <td className="px-3 py-2 text-sm text-black font-medium">{formatCurrency(item.totalPrice || 0)}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{item.status || 'preparing'}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{item.adminNote && item.adminNote.length > 0 ? 'มี' : '-'}</td>
                                                        <td className="px-3 py-2 text-sm">
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                                                onClick={() => openEditItem(item)}
                                                            >
                                                                {(i18n.language === "th" ? 'แก้ไข' : 'Edit')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div className="bg-red-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-black">
                                        {(i18n.language === "th" ? 'หมายเหตุจากแอดมิน' : 'Admin Note')}
                                    </h3>
                                    <button
                                        type="button"
                                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                        onClick={openEditOrderNotes}
                                    >
                                        {(i18n.language === "th" ? 'แก้ไข' : 'Edit')}
                                    </button>
                                </div>
                                <div className="space-y-1 text-sm">
                                    {selectedOrder.adminNote && selectedOrder.adminNote.length > 0 ? (
                                        selectedOrder.adminNote.map((note, idx) => (
                                            <p key={idx} className="text-black">{note?.message || '-'}</p>
                                        ))
                                    ) : (
                                        <p className="text-black">-</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={closeEditItem}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {(i18n.language === "th" ? 'แก้ไขคำสั่งซื้อของสินค้า' : 'Edit Order Product')}
                            </h3>
                            <button onClick={closeEditItem} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-700"><span className="font-medium">SKU:</span> {editingItem.sku}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {(i18n.language === "th" ? 'สถานะ' : 'Status')}
                                </label>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {(i18n.language === "th" ? 'หมายเหตุจากแอดมิน' : 'Admin Note')}
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {Array.isArray(editAdminNotes) && editAdminNotes.length > 0 ? (
                                        editAdminNotes.map((note, idx) => (
                                            <span key={`${note}-${idx}`} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border">
                                                <span className="mr-2">{note}</span>
                                                <button
                                                    type="button"
                                                    className=" hover:text-red-600"
                                                    onClick={() => handleRemoveNote(idx)}
                                                    aria-label="remove note"
                                                >
                                                    x
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            {(i18n.language === "th" ? 'ยังไม่มีหมายเหตุ' : 'No note')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded px-3 py-2"
                                        value={newAdminNote}
                                        onChange={(e) => setNewAdminNote(e.target.value)}
                                        placeholder={(i18n.language === "th" ? 'พิมพ์หมายเหตุใหม่...' : 'Enter new note...')}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                        onClick={handleAddNote}
                                    >
                                        {(i18n.language === "th" ? 'เพิ่ม Note' : 'Add Note')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={closeEditItem}
                                disabled={savingEdit}
                            >
                                {(i18n.language === "th" ? 'ยกเลิก' : 'Cancel')}
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded text-white ${savingEdit ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleSaveEdit}
                                disabled={savingEdit}
                            >
                                {savingEdit ? (i18n.language === "th" ? 'กำลังบันทึก...' : 'Saving...') : (i18n.language === "th" ? 'บันทึก' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Admin Notes Modal */}
            {isEditOrderNoteOpen && selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={closeEditOrderNotes}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {(i18n.language === "th" ? 'แก้ไขหมายเหตุคำสั่งซื้อ' : 'Edit Order Admin Note')}
                            </h3>
                            <button onClick={closeEditOrderNotes} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {(i18n.language === "th" ? 'หมายเหตุจากแอดมิน' : 'Admin Note')}
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {Array.isArray(editOrderAdminNotes) && editOrderAdminNotes.length > 0 ? (
                                        editOrderAdminNotes.map((note, idx) => (
                                            <span key={`${note}-${idx}`} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border">
                                                <span className="mr-2">{note}</span>
                                                <button
                                                    type="button"
                                                    className=" hover:text-red-600"
                                                    onClick={() => handleRemoveOrderNote(idx)}
                                                    aria-label="remove note"
                                                >
                                                    x
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            {(i18n.language === "th" ? 'ยังไม่มีหมายเหตุ' : 'No note')}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded px-3 py-2"
                                        value={newOrderAdminNote}
                                        onChange={(e) => setNewOrderAdminNote(e.target.value)}
                                        placeholder="พิมพ์หมายเหตุใหม่..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOrderNote(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                        onClick={handleAddOrderNote}
                                    >
                                        {(i18n.language === "th" ? 'เพิ่ม Note' : 'Add Note')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={closeEditOrderNotes}
                                disabled={savingOrderNote}
                            >
                                {(i18n.language === "th" ? 'ยกเลิก' : 'Cancel')}
                            </button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded text-white ${savingOrderNote ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleSaveOrderNotes}
                                disabled={savingOrderNote}
                            >
                                {savingOrderNote ? (i18n.language === "th" ? 'กำลังบันทึก...' : 'Saving...') : (i18n.language === "th" ? 'บันทึก' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ShoppingOrderConfig;