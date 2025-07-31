import React, { useState } from "react";
import DiscountCodeManager from "../components/DiscountCodeManager";
import AffiliateDashboard from "../components/AffiliateDashboard";
import UserManager from "./UserManager";

function UserSuperAdmin() {
  const [activeTab, setActiveTab] = useState(null);

  // ✅ ระบุแท็บที่ “ปิดใช้งานชั่วคราว”
  const disabledTabs = { payout: true, booking: true };

  const toggleTab = (tabName) => {
    if (disabledTabs[tabName]) return; // ❌ กันการสลับไปแท็บที่ disabled
    setActiveTab((prev) => (prev === tabName ? null : tabName));
  };

  const btnBase = "px-4 py-2 rounded whitespace-nowrap transition";
  const activeCls = "bg-blue-600 text-white";
  const inactiveCls = "bg-gray-200 text-black";
  const disabledCls = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-white">Superadmin Tools</h2>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex justify-center gap-4 w-max min-w-full px-2">
          <button
            className={`${btnBase} ${
              activeTab === "discount" ? activeCls : inactiveCls
            }`}
            onClick={() => toggleTab("discount")}
          >
            โค้ดส่วนลด
          </button>

          <button
            className={`${btnBase} ${
              activeTab === "users" ? activeCls : inactiveCls
            }`}
            onClick={() => toggleTab("users")}
          >
            บัญชีผู้ใช้
          </button>

          {/* ✅ ปุ่ม disabled: Payout */}
          <button
            disabled={disabledTabs.payout}
            aria-disabled={disabledTabs.payout}
            title="กำลังพัฒนา"
            className={`${btnBase} ${
              activeTab === "payout" ? activeCls : inactiveCls
            } ${disabledTabs.payout ? disabledCls : ""}`}
            onClick={() => toggleTab("payout")}
          >
            จัดการ Payout
          </button>

          {/* ✅ ปุ่ม disabled: Booking */}
          <button
            disabled={disabledTabs.booking}
            aria-disabled={disabledTabs.booking}
            title="กำลังพัฒนา"
            className={`${btnBase} ${
              activeTab === "booking" ? activeCls : inactiveCls
            } ${disabledTabs.booking ? disabledCls : ""}`}
            onClick={() => toggleTab("booking")}
          >
            จัดการ Booking
          </button>
        </div>
      </div>

      <div>
        {activeTab === "discount" && <DiscountCodeManager />}
        {activeTab === "users" && <UserManager />}

        {/* แท็บที่ disabled จะไม่ถูกเปิด จึงไม่ต้อง render อะไร */}
      </div>
    </div>
  );
}

export default UserSuperAdmin;
