import React, { useState } from "react";
import ShoppingDiscountManager from "./ShoppingDiscountManager"
import ShoppingOrderManager from "./ShoppingOrderManger"
import ShoppingCreatorOrderManager from "./ShoppingCreatorOrderManager"

function ShoppingSuperAdmin() {
    const [activeTab, setActiveTab] = useState(null);

    // ✅ ระบุแท็บที่ “ปิดใช้งานชั่วคราว”
    const disabledTabs = { payout: true, booking: false };

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
                        className={`${btnBase} ${activeTab === "shopping-discount" ? activeCls : inactiveCls
                            }`}
                        onClick={() => toggleTab("shopping-discount")}
                    >
                        โค้ดส่วนลดสำหรับการ Shopping
                    </button>

                    <button
                        className={`${btnBase} ${activeTab === "shopping-order" ? activeCls : inactiveCls
                            }`}
                        onClick={() => toggleTab("shopping-order")}
                    >
                        Shopping Order
                    </button>

                    <button
                        className={`${btnBase} ${activeTab === "shopping-creatororder" ? activeCls : inactiveCls
                            }`}
                        onClick={() => toggleTab("shopping-creatororder")}
                    >
                        Creator Order
                    </button>
                </div>
            </div>

            <div>
                {activeTab === "shopping-discount" && <ShoppingDiscountManager />}
                {activeTab === "shopping-order" && <ShoppingOrderManager />}
                {activeTab === "shopping-creatororder" && <ShoppingCreatorOrderManager />}

            </div>
        </div>
    );
}

export default ShoppingSuperAdmin;
