import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Eye, RefreshCw } from "lucide-react";
import { getDeviceFingerprint } from "../lib/fingerprint";
import ShoppingCreatorOrderIdManagerModal from "./ShoppingCreatorOrderIdManagerModal";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function debounce(fn, delay = 800) {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    };
}

function ShoppingCreatorOrderManager() {
  const { t, i18n } = useTranslation();
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL.replace(/\/$/, "");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderCount, setOrderCount] = useState(0);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState("");

    // sorting
    const [sortKey, setSortKey] = useState("createdAt"); // createdAt | paidAt | status | paymentMode | buyer.name | creator.name
    const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

    // pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

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

    const openOrderDetail = (orderId) => {
        setSelectedOrderId(orderId);
        setIsDetailOpen(true);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const fp = await getDeviceFingerprint();
            let statusParam = "all";
            if (!statusChecks.all) {
                const picked = Object.entries(statusChecks)
                    .filter(([k, v]) => k !== "all" && v)
                    .map(([k]) => k);
                if (picked.length > 0) statusParam = picked.join(",");
            }

            const res = await axios.get(
                `${BASE_URL}/shopping/all-creatororder`,
                {
                    params: {
                        page,
                        limit: pageSize,
                        sortKey,
                        sortOrder,
                        q: q || undefined,
                        status: statusParam,
                    },
                    headers: { "device-fingerprint": fp },
                    withCredentials: true
                }
            );
            const list = res?.data?.order || [];
            setOrders(Array.isArray(list) ? list : []);
            setOrderCount(list.length);
            setTotalPages(Math.ceil(list.length / pageSize));
        } catch (error) {
            console.error("Failed to fetch creator orders", error);
            setOrders([]);
            setOrderCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, pageSize, sortKey, sortOrder, statusChecks]);

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
            <th className="p-2 whitespace-nowrap">
                <button
                    type="button"
                    onClick={() => handleSort(columnKey)}
                    className={`
                        inline-flex items-center gap-1 select-none 
                        ${isActive ? "text-blue-700 font-semibold"
                            : "text-gray-800"
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

    const applySearchDebounced = useMemo(
        () =>
            debounce((val) => {
                setPage(1);
                setQ(val);
            }, 400),
        []
    );

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
            <span className=
                {`
            px-2 py-1 rounded-full text-xs font-medium 
            ${statusInfo.color}
            `}
            >
                {statusInfo.text}
            </span>
        );
    };

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
                <span
                    className="text-white/70"
                >
                    ({orderCount} {(i18n.language === "th" ? 'รายการ' : 'orders')}) — {(i18n.language === "th" ? 'แสดง' : 'Showing')} {startIdx}-{endIdx}
                </span>
            </h2>

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
                    <span className="text-white/80 text-sm">{(i18n.language === "th" ? 'หน้า {page} / {totalPages}' : 'Page {page} / {totalPages}')}</span>
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
                <div className="flex items-center gap-3 w-full md:w-96">
                    <input
                        type="text"
                        className="w-full rounded px-3 py-2 text-black border"
                        placeholder={(i18n.language === "th" ? 'ค้นหาด้วย Buyer/Creator Name' : 'Search by Buyer/Creator Name')}
                        onChange={(e) => applySearchDebounced(e.target.value)}
                        defaultValue={q}
                        aria-label="Search orders by buyer or creator name"
                    />
                    <button
                        type="button"
                        className="p-2 rounded bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                        onClick={() => fetchOrders()}
                        title={(i18n.language === "th" ? 'ค้นหา' : 'Search')}
                    >
                        <Search size={20} />
                    </button>
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
                            <SortableTh label={(i18n.language === "th" ? 'เจ้าของสินค้า' : 'Creator')} columnKey="creator.name" />
                            <SortableTh label={(i18n.language === "th" ? 'วันที่ชำระ' : 'Paid At')} columnKey="paidAt" />
                            <SortableTh label={(i18n.language === "th" ? 'สถานะ' : 'Status')} columnKey="status" />
                            <SortableTh label={(i18n.language === "th" ? 'โหมดการชำระ' : 'Payment Mode')} columnKey="paymentMode" />
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
                                    {order.creator.name || "-"}
                                </td>
                                <td className="p-2 font-mono text-sm">
                                    {formatDateTime(order.paidAt)}
                                </td>
                                <td className="p-2 font-mono text-sm">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="p-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                        {order.paymentMode || "-"}
                                    </span>
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
                                            onClick={() => openOrderDetail(order._id)}
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={fetchOrders}
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
                                <td colSpan={8} className="p-4 text-center text-gray-500">
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
                <span className="text-white/80 text-sm">{(i18n.language === "th" ? 'หน้า {page} / {totalPages}' : 'Page {page} / {totalPages}')}</span>
                <button
                    className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                >
                    {(i18n.language === "th" ? 'ถัดไป' : 'Next')}
                </button>
            </div>
            <ShoppingCreatorOrderIdManagerModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false)
                    fetchOrders()
                }}
                creatorOrderId={selectedOrderId}
            />
        </div>
    );
}

export default ShoppingCreatorOrderManager;