// components/ShoppingOrderManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Eye, RefreshCw } from "lucide-react";
import { getDeviceFingerprint } from "../lib/fingerprint";
import ShoppingOrderIdManagerModal from "./ShoppingOrderIdManagerModal";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 🔧 debounce helper
function debounce(fn, delay = 800) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

const ShoppingOrderManager = () => {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL.replace(/\/$/, "");
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // ✅ ให้การเรียงทำที่ backend (default: ใหม่→เก่า)
  const [sortKey, setSortKey] = useState("createdAt"); // createdAt | paidAt | originalPrice | status | paymentMode
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  // ✅ pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ search & status filter
  const [q, setQ] = useState("");
  const [statusChecks, setStatusChecks] = useState({
    all: true,
    paid: false,
    pending: false,
    cancelled: false,
    refunded: false,
  });

  // แปลงวันเวลา
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

  // แปลงราคา
  const formatPrice = (price) => {
    if (!price) return "0";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  // โหลดข้อมูล
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fp = await getDeviceFingerprint();

      // สร้างพารามิเตอร์ status
      let statusParam = "all";
      if (!statusChecks.all) {
        const picked = Object.entries(statusChecks)
          .filter(([k, v]) => k !== "all" && v)
          .map(([k]) => k);
        if (picked.length > 0) statusParam = picked.join(",");
      }

      const res = await axios.get(
        `${BASE_URL}/shopping/order`,
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
          withCredentials: true,
        }
      );

      const list = res.data || [];
      setOrders(list);
      setOrderCount(list.length);
      setTotalPages(Math.ceil(list.length / pageSize));
    } catch (err) {
      console.error("โหลด orders ไม่สำเร็จ", err);
      setOrders([]);
      setOrderCount(0);
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก & ทุกครั้งที่ dependency เปลี่ยน
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortKey, sortOrder, q, statusChecks]);

  // เปลี่ยนคีย์เรียง
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // เปิด modal ดูรายละเอียด
  const openOrderDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailOpen(true);
  };

  // ส่วนหัวคอลัมน์ที่กดเรียงได้
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
          title="คลิกเพื่อเรียง/สลับทิศทาง"
        >
          <span>{label}</span>
          <span className="text-xs">{arrow}</span>
        </button>
      </th>
    );
  };

  // debounce ช่องค้นหา
  const applySearchDebounced = useMemo(
    () =>
      debounce((val) => {
        setPage(1);
        setQ(val);
      }, 400),
    []
  );

  // toggle status filter (All exclusive)
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
        };
      } else {
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
          };
        }
        return next;
      }
    });
  };

  // แสดงสถานะ
  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { text: "ชำระแล้ว", color: "bg-green-100 text-green-800" },
      pending: { text: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
      cancelled: { text: "ยกเลิก", color: "bg-red-100 text-red-800" },
      refunded: { text: "คืนเงิน", color: "bg-gray-100 text-gray-800" },
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
        <h2 className="text-2xl font-bold mt-8 mb-4">จัดการคำสั่งซื้อสินค้า</h2>
        <div className="bg-white rounded text-black h-48 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading...</p>
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
        จัดการคำสั่งซื้อสินค้า{" "}
        <span className="text-white/70">
          ({orderCount} รายการ) — แสดง {startIdx}-{endIdx}
        </span>
      </h2>

      {/* Controls แถวบน: page size + pager */}
      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm text-white/80">แสดงต่อหน้า</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(1);
          }}
          className="text-black border rounded px-2 py-1"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ก่อนหน้า
          </button>
          <span className="text-white/80 text-sm">
            หน้า {page} / {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            ถัดไป
          </button>
        </div>
      </div>

      {/* 🔎 Search + Status Filters */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            className="w-full rounded px-3 py-2 text-black border"
            placeholder="ค้นหาด้วย Username"
            onChange={(e) => applySearchDebounced(e.target.value)}
            defaultValue={q}
            aria-label="Search orders by ID or user ID"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All" },
            { key: "paid", label: "ชำระแล้ว" },
            { key: "pending", label: "รอดำเนินการ" },
            { key: "cancelled", label: "ยกเลิก" },
            { key: "refunded", label: "คืนเงิน" },
          ].map((s) => (
            <label
              key={s.key}
              className={`cursor-pointer select-none px-2 py-1 rounded border ${statusChecks[s.key]
                ? "bg-white text-black"
                : "bg-transparent text-white"
                }`}
              title={
                s.key === "all" ? "แสดงทุกสถานะ" : `กรองเฉพาะสถานะ: ${s.label}`
              }
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

      {/* ตาราง */}
      <div className="overflow-x-auto bg-white rounded text-black">
        <table className="w-full">
          <thead className="bg-gray-200 text-left">
            <tr>
              <SortableTh label="วันที่สร้าง" columnKey="createdAt" />
              <th className="p-2">Buyer</th>
              <SortableTh label="วันที่ชำระ" columnKey="paidAt" />
              <SortableTh label="ราคารวม" columnKey="originalPrice" />
              <SortableTh label="สถานะ" columnKey="status" />
              <SortableTh label="โหมดการชำระ" columnKey="paymentMode" />
              <th className="p-2">หมายเหตุแอดมิน</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-2">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="p-2 font-mono text-sm">
                  {order.user.name || "-"}
                </td>
                <td className="p-2">
                  {formatDateTime(order.paidAt)}
                </td>
                <td className="p-2 font-semibold">
                  {formatPrice(order.originalPrice)}
                </td>
                <td className="p-2">
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
                      มี
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      className="p-1 hover:bg-gray-100 rounded"
                      title="ดูรายละเอียด"
                      onClick={() => openOrderDetail(order._id)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={fetchOrders}
                      className="p-1 hover:bg-gray-100 rounded text-blue-600"
                      title="รีเฟรชข้อมูล"
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
                  ไม่พบข้อมูลคำสั่งซื้อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controls ล่าง */}
      <div className="mt-3 flex items-center gap-2 justify-end">
        <button
          className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ก่อนหน้า
        </button>
        <span className="text-white/80 text-sm">
          หน้า {page} / {totalPages}
        </span>
        <button
          className="px-3 py-1 bg-white/90 text-black rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          ถัดไป
        </button>
      </div>
      <ShoppingOrderIdManagerModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          fetchOrders()
        }}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default ShoppingOrderManager;
