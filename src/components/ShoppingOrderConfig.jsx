import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDeviceFingerprint } from "../lib/fingerprint";
import { useTranslation } from "react-i18next";
import { Eye, RefreshCw } from "lucide-react";


const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

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

const formatDateTime = (iso) => {
    if (!iso) return "-";
    const t = new Date(iso);
    if (Number.isNaN(t.getTime())) return "-";
    return t.toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
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

function debounce(fn, delay = 800) {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    };
}

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

    // sorting
    const [sortKey, setSortKey] = useState("createdAt"); // createdAt | paidAt | status | buyer.name | creator.name
    const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

    // pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [orderCount, setOrderCount] = useState(0);

    // search & status filter
    const [q, setQ] = useState("");
    const [statusChecks, setStatusChecks] = useState({
        all: true,
        paid: false,
        pending: false,
        cancelled: false,
        refunded: false,
        processing: false,
        successful: false
    });

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
            
            // Build status parameter
            let statusParam = "all";
            if (!statusChecks.all) {
                const picked = Object.entries(statusChecks)
                    .filter(([k, v]) => k !== "all" && v)
                    .map(([k]) => k);
                if (picked.length > 0) statusParam = picked.join(",");
            }

            const res = await axios.get(`${BASE_URL}/shopping/creator-creatororder/${user.userId}`, {
                ...config,
                params: {
                    page,
                    limit: pageSize,
                    sortKey,
                    sortOrder,
                    q: q || undefined,
                    status: statusParam,
                }
            });
            const data = res?.data;
            const ordersArray = Array.isArray(data?.order) ? data.order : [];
            setOrders(ordersArray);
            setOrderCount(ordersArray.length);
            setTotalPages(Math.ceil(ordersArray.length / pageSize));
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
            setOrderCount(0);
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

    const applySearchDebounced = useMemo(
        () =>
            debounce((val) => {
                setPage(1);
                setQ(val);
            }, 400),
        []
    );

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
        setPage(1);
    };

    const SortableTh = ({ label, columnKey }) => {
        const isActive = sortKey === columnKey;
        const arrow = !isActive ? "↕" : sortOrder === "asc" ? "▲" : "▼";
        return (
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                    type="button"
                    onClick={() => handleSort(columnKey)}
                    className={`
                        inline-flex items-center gap-1 select-none 
                        ${isActive ? "text-blue-700 font-semibold"
                            : "text-gray-500"
                        }`}
                    aria-sort={
                        isActive
                            ? sortOrder === "asc"
                                ? "ascending"
                                : "descending"
                            : "none"
                    }
                    title={(i18n.language === "th" ? 'คลิกเพื่อเรียง/สลับทิศทาง' : 'Click to sort/toggle direction')}
                >
                    <span>{label}</span>
                    <span className="text-xs">{arrow}</span>
                </button>
            </th>
        );
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            paid: { text: (i18n.language === "th" ? 'ชำระแล้ว' : 'Paid'), color: "bg-green-100 text-green-800" },
            pending: { text: (i18n.language === "th" ? 'รอดำเนินการ' : 'Pending'), color: "bg-yellow-100 text-yellow-800" },
            cancelled: { text: (i18n.language === "th" ? 'ยกเลิก' : 'Cancelled'), color: "bg-red-100 text-red-800" },
            refunded: { text: (i18n.language === "th" ? 'คืนเงิน' : 'Refunded'), color: "bg-gray-100 text-gray-800" },
            processing: { text: (i18n.language === "th" ? 'กำลังดำเนินการ' : 'Processing'), color: "bg-green-100 text-green-800" },
            successful: { text: (i18n.language === "th" ? 'จัดส่งสำเร็จ' : 'Successful'), color: "bg-green-100 text-green-800" }
        };
        const statusInfo = statusMap[status] || { text: status || "-", color: "bg-gray-100 text-gray-800" };
        return (
            <span className={`
            px-2 py-1 rounded-full text-xs font-medium 
            ${statusInfo.color}
            `}
            >
                {statusInfo.text}
            </span>
        );
    };

    const toggleStatus = (key) => {
        setPage(1);
        setStatusChecks((prev) => {
            if (key === "all") {
                return {
                    all: true,
                    paid: false,
                    pending: false,
                    cancelled: false,
                    refunded: false,
                    processing: false,
                    successful: false
                };
            }
            else {
                const next = { ...prev, all: false, [key]: !prev[key] };
                const anyChecked = Object.entries(next)
                    .filter(([k]) => k !== "all")
                    .some(([, v]) => v);
                if (!anyChecked) {
                    return {
                        all: true,
                        paid: false,
                        pending: false,
                        cancelled: false,
                        refunded: false,
                        processing: false,
                        successful: false
                    };
                }
                return next;
            }
        });
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, page, pageSize, sortKey, sortOrder, q, statusChecks]);

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

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto text-white px-4">
                <h2 className="text-2xl font-bold mt-8 mb-4">{(i18n.language === "th" ? 'จัดการคำสั่งซื้อ Creator' : 'Manage Creator Orders')}</h2>
                <div className="bg-white rounded text-black h-48 flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">{(i18n.language === "th" ? 'กำลังโหลด...' : 'Loading...')}</p>
                </div>
            </div>
        );
    }

    // แสดงช่วงรายการปัจจุบัน
    const startIdx = orderCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIdx = Math.min(page * pageSize, orderCount);

    return (
        <div className="max-w-7xl mx-auto text-white px-4">
            <h2 className="text-2xl font-bold mt-8 mb-4">
                {(i18n.language === "th" ? 'จัดการคำสั่งซื้อ Creator Orders' : 'Manage Creator Orders')}
                <span className="text-white/70">
                    ({orderCount} {(i18n.language === "th" ? 'รายการ' : 'orders')}) — {(i18n.language === "th" ? 'แสดง' : 'Showing')} {startIdx}-{endIdx}
                </span>
            </h2>

            {error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="mb-3 flex items-center gap-3">
                <label className="text-sm text-white/80">{(i18n.language === "th" ? 'แสดงต่อหน้า' : 'Show per page')}</label>
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(parseInt(e.target.value, 10));
                        setPage(1);
                    }}
                    className="text-black border rounded px-2 py-1"
                >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        {(i18n.language === "th" ? 'ก่อนหน้า' : 'Previous')}
                    </button>
                    <span className="text-white/80 text-sm">{(i18n.language === "th" ? `หน้า ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`)}</span>
                    <button
                        className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                    >
                        {(i18n.language === "th" ? 'ถัดไป' : 'Next')}
                    </button>
                </div>
            </div>

            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        className="w-full rounded px-3 py-2 text-black border"
                        placeholder={(i18n.language === "th" ? 'ค้นหาด้วย Buyer' : 'Search by Buyer')}
                        onChange={(e) => applySearchDebounced(e.target.value)}
                        defaultValue={q}
                        aria-label="Search orders by buyer"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { key: "all", label: (i18n.language === "th" ? 'ทั้งหมด' : 'All') },
                        { key: "paid", label: (i18n.language === "th" ? 'ชำระแล้ว' : 'Paid') },
                        { key: "pending", label: (i18n.language === "th" ? 'รอดำเนินการ' : 'Pending') },
                        { key: "cancelled", label: (i18n.language === "th" ? 'ยกเลิก' : 'Cancelled') },
                        { key: "refunded", label: (i18n.language === "th" ? 'คืนเงิน' : 'Refunded') },
                        { key: "processing", label: (i18n.language === "th" ? 'กำลังดำเนินการ' : 'Processing') },
                        { key: "successful", label: (i18n.language === "th" ? 'จัดส่งสำเร็จ' : 'Successful') }
                    ].map((s) => (
                        <label
                            key={s.key}
                            className={`cursor-pointer select-none px-2 py-1 rounded border ${statusChecks[s.key] ? "bg-white text-black" : "bg-transparent text-white"}`}
                            title={s.key === "all" ? (i18n.language === "th" ? 'แสดงทุกสถานะ' : 'Show all status') : (i18n.language === "th" ? `กรองเฉพาะสถานะ: ${s.label}` : `Filter by status: ${s.label}`)}
                        >
                            <input
                                type="checkbox"
                                className="mr-1 align-middle"
                                checked={!!statusChecks[s.key]}
                                onChange={() => toggleStatus(s.key)}
                            />
                            <span className="align-middle">{s.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded text-black">
                <table className="w-full">
                    <thead className="bg-gray-200 text-left">
                        <tr>
                            <SortableTh label={(i18n.language === "th" ? 'วันที่สร้าง' : 'Created At')} columnKey="createdAt" />
                            <SortableTh label={(i18n.language === "th" ? 'ผู้ซื้อ' : 'Buyer')} columnKey="buyer.name" />
                            <SortableTh label={(i18n.language === "th" ? 'วันที่ชำระ' : 'Paid At')} columnKey="paidAt" />
                            <SortableTh label={(i18n.language === "th" ? 'สถานะ' : 'Status')} columnKey="status" />
                            <th className="p-2">{(i18n.language === "th" ? 'หมายเหตุแอดมิน' : 'Admin Note')}</th>
                            <th className="p-2">{(i18n.language === "th" ? 'การแก้ไข' : 'Action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="border-t">
                                <td className="p-2">
                                    {formatDateTime(order.createdAt)}
                                </td>
                                <td className="p-2 font-mono text-sm">
                                    {order.buyer.name || "-"}
                                </td>
                                <td className="p-2 font-mono text-sm">
                                    {formatDateTime(order.paidAt)}
                                </td>
                                <td className="p-2 font-mono text-sm">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="p-2">
                                    {order.adminNote && order.adminNote.length > 0 ? (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                            {(i18n.language === "th" ? 'มี' : 'Yes')}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="p-2">
                                    <div className="flex gap-2">
                                        <button
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title={(i18n.language === "th" ? 'ดูรายละเอียด' : 'View details')}
                                            onClick={() => handleOrderClick(order)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={loadOrders}
                                            className="p-1 hover:bg-gray-100 rounded text-blue-600"
                                            title={(i18n.language === "th" ? 'รีเฟรชข้อมูล' : 'Refresh data')}
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    {(i18n.language === "th" ? 'ไม่พบข้อมูลคำสั่งซื้อ' : 'No order found')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex items-center gap-2 justify-end">
                <button
                    className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                >
                    {(i18n.language === "th" ? 'ก่อนหน้า' : 'Previous')}
                </button>
                <span className="text-white/80 text-sm">{(i18n.language === "th" ? `หน้า ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`)}</span>
                <button
                    className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                >
                    {(i18n.language === "th" ? 'ถัดไป' : 'Next')}
                </button>
            </div>

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