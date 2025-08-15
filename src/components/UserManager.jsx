// components/UserManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Save, X } from "lucide-react";
import { getDeviceFingerprint } from "../lib/fingerprint";

const roles = [
  "user",
  "admin",
  "superadmin",
  "affiliator",
  "host",
  "host_affiliator",
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 🔧 debounce helper
function debounce(fn, delay = 800) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

const UserManager = () => {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL.replace(/\/$/, "");
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({ role: "", affiliateCode: "" });

  // ✅ ให้การเรียงทำที่ backend (default: ใหม่→เก่า)
  const [sortKey, setSortKey] = useState("createdAt"); // name | email | role | createdAt
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  // ✅ pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ search & role filter
  const [q, setQ] = useState("");
  const [roleChecks, setRoleChecks] = useState({
    all: true,
    user: false,
    admin: false,
    superadmin: false,
    affiliator: false,
    host: false,
    host_affiliator: false,
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

  // โหลดข้อมูล
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // สร้างพารามิเตอร์ roles
      const fp = await getDeviceFingerprint();
      let rolesParam = "all";
      if (!roleChecks.all) {
        const picked = Object.entries(roleChecks)
          .filter(([k, v]) => k !== "all" && v)
          .map(([k]) => k);
        if (picked.length > 0) rolesParam = picked.join(",");
      }

      const res = await axios.get(
        `${BASE_URL}/accounts/superadmin/all-accounts`,
        {
          params: {
            page,
            limit: pageSize,
            sortKey,
            sortOrder,
            q: q || undefined,
            roles: rolesParam,
          },
          headers: { "device-fingerprint": fp },
          withCredentials: true,
        }
      );
      const list = res.data?.data?.users || [];
      setUsers(list);
      const count = res.data?.data?.count ?? list.length;
      setUserCount(count);
      setTotalPages(res.data?.data?.totalPages ?? 1);
    } catch (err) {
      console.error("โหลด users ไม่สำเร็จ", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditedData({
      role: u.role || "",
      affiliateCode: u.affiliateCode || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedData({ role: "", affiliateCode: "" });
  };

  const saveEdit = async (id) => {
    try {
      const fp = await getDeviceFingerprint();
      setSavingId(id);
      const payload = {
        ...editedData,
        affiliateCode:
          typeof editedData.affiliateCode === "string"
            ? editedData.affiliateCode.trim()
            : editedData.affiliateCode,
      };
      await axios.put(`${BASE_URL}/accounts/superadmin/update/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          "device-fingerprint": fp,
        },
        withCredentials: true,
      });
      cancelEdit();
      fetchUsers(); // รีเฟรชหน้าปัจจุบัน
    } catch (err) {
      const msg =
        err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้";
      alert(`❗ เซฟไม่สำเร็จ: ${msg}`);
      console.error("บันทึกไม่สำเร็จ:", msg);
    } finally {
      setSavingId(null);
    }
  };

  // โหลดครั้งแรก & ทุกครั้งที่ dependency เปลี่ยน
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortKey, sortOrder, q, roleChecks]);

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

  // ส่วนหัวคอลัมน์ที่กดเรียงได้
  const SortableTh = ({ label, columnKey }) => {
    const isActive = sortKey === columnKey;
    const arrow = !isActive ? "↕" : sortOrder === "asc" ? "▲" : "▼";
    return (
      <th className="p-2 whitespace-nowrap">
        <button
          type="button"
          onClick={() => handleSort(columnKey)}
          className={`inline-flex items-center gap-1 select-none ${
            isActive ? "text-blue-700 font-semibold" : "text-gray-800"
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

  // toggle role filter (All exclusive)
  const toggleRole = (key) => {
    setPage(1);
    setRoleChecks((prev) => {
      if (key === "all") {
        return {
          all: true,
          user: false,
          admin: false,
          superadmin: false,
          affiliator: false,
          host: false,
          host_affiliator: false,
        };
      } else {
        const next = { ...prev, all: false, [key]: !prev[key] };
        const anyChecked = Object.entries(next)
          .filter(([k]) => k !== "all")
          .some(([, v]) => v);
        if (!anyChecked) {
          return {
            all: true,
            user: false,
            admin: false,
            superadmin: false,
            affiliator: false,
            host: false,
            host_affiliator: false,
          };
        }
        return next;
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto text-white px-4">
        <h2 className="text-2xl font-bold mt-8 mb-4">จัดการบัญชีผู้ใช้</h2>
        <div className="bg-white rounded text-black h-48 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // แสดงช่วงรายการปัจจุบัน
  const startIdx = userCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, userCount);

  return (
    <div className="max-w-5xl mx-auto text-white px-4">
      <h2 className="text-2xl font-bold mt-8 mb-4">
        จัดการบัญชีผู้ใช้{" "}
        <span className="text-white/70">
          ({userCount} คน) — แสดง {startIdx}-{endIdx}
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

      {/* 🔎 Search + Role Filters */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            className="w-full rounded px-3 py-2 text-black border"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            onChange={(e) => applySearchDebounced(e.target.value)}
            defaultValue={q}
            aria-label="Search users by name or email"
          />
        </div>

        {/* Role filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All" },
            ...roles.map((r) => ({ key: r, label: r })),
          ].map((r) => (
            <label
              key={r.key}
              className={`cursor-pointer select-none px-2 py-1 rounded border ${
                roleChecks[r.key]
                  ? "bg-white text-black"
                  : "bg-transparent text-white"
              }`}
              title={
                r.key === "all" ? "แสดงทุก role" : `กรองเฉพาะ role: ${r.label}`
              }
            >
              <input
                type="checkbox"
                className="mr-1 align-middle"
                checked={!!roleChecks[r.key]}
                onChange={() => toggleRole(r.key)}
              />
              <span className="align-middle">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ตาราง */}
      <div className="overflow-x-auto bg-white rounded text-black">
        <table className="w-full">
          <thead className="bg-gray-200 text-left">
            <tr>
              <SortableTh label="ชื่อ" columnKey="name" />
              <SortableTh label="อีเมล" columnKey="email" />
              <SortableTh label="วันเวลาสมัคร" columnKey="createdAt" />
              <SortableTh label="Role" columnKey="role" />
              <th className="p-2">Affiliate Code</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.user?.name || "-"}</td>
                <td className="p-2">{u.user?.email || "-"}</td>
                <td className="p-2">
                  {formatDateTime(u.createdAt || u.user?.createdAt)}
                </td>
                <td className="p-2">
                  {editingId === u._id ? (
                    <select
                      value={editedData.role}
                      onChange={(e) =>
                        setEditedData({ ...editedData, role: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td className="p-2">
                  {editingId === u._id ? (
                    <input
                      value={editedData.affiliateCode}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          affiliateCode: e.target.value,
                        })
                      }
                      className="border rounded px-2 py-1 w-full"
                      placeholder="เช่น ABC123 หรือ my_code-01"
                    />
                  ) : (
                    u.affiliateCode || "-"
                  )}
                </td>
                <td className="p-2">
                  {editingId === u._id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(u._id)}
                        disabled={savingId === u._id}
                        className={
                          savingId === u._id
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }
                        title={savingId === u._id ? "Saving..." : "Save"}
                      >
                        <Save size={18} className="text-green-600" />
                      </button>
                      <button onClick={cancelEdit}>
                        <X size={18} className="text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(u)}>
                      <Pencil size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ใช้
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
    </div>
  );
};

export default UserManager;
