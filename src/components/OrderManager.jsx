// components/OrderManager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Save, X } from "lucide-react";
import { format } from "date-fns";
import { getDeviceFingerprint } from "../lib/fingerprint";

const PAGE_SIZE = 30;

const OrderManager = () => {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedNote, setEditedNote] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fp = await getDeviceFingerprint();
      const res = await axios.get(
        `${BASE_URL}/activity-order/superadmin?page=${page}&limit=${PAGE_SIZE}`,
        {
          headers: {
            "device-fingerprint": fp,
          },
          withCredentials: true,
        }
      );
      setOrders(res.data?.orders || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      console.error("โหลดออเดอร์ไม่สำเร็จ", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (order) => {
    setEditingId(order._id);
    setEditedNote(order.adminNote || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedNote("");
  };

  const saveEdit = async (id) => {
    try {
      const fp = getDeviceFingerprint();
      setSavingId(id);
      await axios.put(
        `${BASE_URL}/activity-order/superadmin/${id}`,
        { adminNote: editedNote },
        {
          headers: {
            "device-fingerprint": fp ,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      cancelEdit();
      fetchOrders();
    } catch (err) {
      console.error("บันทึกไม่สำเร็จ:", err?.response?.data || err.message);
      alert("❗ ไม่สามารถบันทึกหมายเหตุได้");
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const Pagination = () => (
    <div className="flex justify-between items-center text-sm text-white mt-4">
      <div>
        หน้า {page} / {totalPages} ({total.toLocaleString()} รายการ)
      </div>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="bg-gray-300 text-black px-2 py-1 rounded disabled:opacity-50"
        >
          ⇠ ก่อนหน้า
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="bg-gray-300 text-black px-2 py-1 rounded disabled:opacity-50"
        >
          ถัดไป ⇢
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-white px-4">
        <h2 className="text-2xl font-bold mt-8 mb-4">จัดการ Booking</h2>
        <div className="bg-white rounded text-black h-48 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-white px-4">
      <h2 className="text-2xl font-bold mt-8 mb-4">
        จัดการ Booking <span className="text-white/70">({total} รายการ)</span>
      </h2>

      <Pagination />

      <div className="overflow-x-auto bg-white rounded text-black">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-left">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">ชื่อกิจกรรม</th>
              <th className="p-2">ชื่อผู้จอง</th>
              <th className="p-2">อีเมล</th>
              <th className="p-2">วันกิจกรรม</th>
              <th className="p-2">วันจอง</th>
              <th className="p-2">สถานะ</th>
              <th className="p-2">ราคาเต็ม</th>
              <th className="p-2">ส่วนลด</th>
              <th className="p-2">โค้ดส่วนลด</th>
              <th className="p-2">ยอดชำระ</th>
              <th className="p-2">หมายเหตุ</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr key={o._id} className="border-t">
                <td className="p-2">
                  {total - ((page - 1) * PAGE_SIZE + idx)}
                </td>
                <td className="p-2">
                  {o.activityId?.nameTh ||
                    o.activityId?.nameEn ||
                    o.activityId?.title ||
                    "-"}
                </td>
                <td className="p-2">{o.userId?.user?.name || "-"}</td>
                <td className="p-2">{o.userId?.user?.email || "-"}</td>
                <td className="p-2">
                  {o.bookingDate
                    ? format(new Date(o.bookingDate), "dd/MM/yyyy")
                    : "-"}
                </td>
                <td className="p-2">
                  {o.createdAt
                    ? format(new Date(o.createdAt), "dd/MM/yyyy")
                    : "-"}
                </td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">
                  {o.originalPrice?.toLocaleString("th-TH") || "-"}
                </td>
                <td className="p-2">
                  {o.discountCodeAmount?.toLocaleString("th-TH") || 0}
                </td>
                <td className="p-2">{o.discountCodeUsed || "-"}</td>
                <td className="p-2">
                  {o.paidAmount?.toLocaleString("th-TH") || "-"}
                </td>
                <td className="p-2">
                  {editingId === o._id ? (
                    <input
                      value={editedNote}
                      onChange={(e) => setEditedNote(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="เพิ่มหมายเหตุ"
                    />
                  ) : (
                    o.adminNote || "-"
                  )}
                </td>
                <td className="p-2">
                  {editingId === o._id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(o._id)}
                        disabled={savingId === o._id}
                        className={
                          savingId === o._id
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }
                      >
                        <Save size={18} className="text-green-600" />
                      </button>
                      <button onClick={cancelEdit}>
                        <X size={18} className="text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(o)}>
                      <Pencil size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={13} className="p-4 text-center text-gray-500">
                  ไม่พบรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination />
    </div>
  );
};

export default OrderManager;
