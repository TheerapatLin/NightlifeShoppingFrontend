// components/UserManager.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Save, X } from "lucide-react";

const roles = [
  "user",
  "admin",
  "superadmin",
  "affiliator",
  "host",
  "host_affiliator",
];

const UserManager = () => {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL.replace(/\/$/, "");
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0); // ✅ จำนวนผู้ใช้ทั้งหมด
  const [loading, setLoading] = useState(true); // ✅ loading
  const [savingId, setSavingId] = useState(null); // ✅ saving (ต่อแถว)

  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({ role: "", affiliateCode: "" });

  const [sortKey, setSortKey] = useState(null); // 'name' | 'email' | 'role' | null
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const collator = useMemo(
    () =>
      new Intl.Collator(["th", "en"], { sensitivity: "base", numeric: true }),
    []
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/accounts/superadmin/all-accounts`,
        {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        }
      );
      const list = res.data?.data?.users || [];
      setUsers(list);
      setUserCount(res.data?.data?.count ?? list.length); // ✅ ตั้งค่าจำนวน
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
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      cancelEdit();
      fetchUsers();
    } catch (err) {
      const msg =
        err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้";
      alert(`❗ เซฟไม่สำเร็จ: ${msg}`);
      console.error("บันทึกไม่สำเร็จ:", msg);
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === sorting helpers ===
  const getFieldValue = (u, key) => {
    if (key === "name") return (u.user?.name ?? "").toString();
    if (key === "email") return (u.user?.email ?? "").toString();
    if (key === "role") return (u.role ?? "").toString();
    return "";
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    if (!sortKey) return users;
    const arr = [...users];
    arr.sort((a, b) => {
      const av = getFieldValue(a, sortKey);
      const bv = getFieldValue(b, sortKey);
      const cmp = collator.compare(av, bv);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [users, sortKey, sortOrder, collator]);

  const SortableTh = ({ label, columnKey }) => {
    const isActive = sortKey === columnKey;
    const arrow = !isActive ? "↕" : sortOrder === "asc" ? "▲" : "▼";
    return (
      <th className="p-2">
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

  // ✅ Loading (สั้น ๆ)
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto text-white px-4">
        <h2 className="text-2xl font-bold mt-8 mb-4">จัดการบัญชีผู้ใช้</h2>
        <div className="bg-white rounded text-black h-40 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-white px-4">
      <h2 className="text-2xl font-bold mt-8 mb-4">
        จัดการบัญชีผู้ใช้{" "}
        <span className="text-white/70">({userCount} คน)</span>
      </h2>
      <div className="overflow-x-auto bg-white rounded text-black">
        <table className="w-full">
          <thead className="bg-gray-200 text-left">
            <tr>
              <SortableTh label="ชื่อ" columnKey="name" />
              <SortableTh label="อีเมล" columnKey="email" />
              <SortableTh label="Role" columnKey="role" />
              <th className="p-2">Affiliate Code</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.user?.name || "-"}</td>
                <td className="p-2">{u.user?.email || "-"}</td>
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
            {sortedUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
