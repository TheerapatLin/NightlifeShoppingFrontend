import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAsyncError, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useGlobalEvent } from "../context/GlobalEventContext";
import ProductsConfigShopping from "../components/ProductsConfigShopping"
import ShoppingOrderConfig from "../components/ShoppingOrderConfig"
import { getDeviceFingerprint } from "../lib/fingerprint";
import { FaCrown } from "react-icons/fa";
import ShoppingSuperAdmin from "../components/ShoppingSuperAdmin"

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function Store() {
    const { t, i18n } = useTranslation();
    const [selectedTab, setSelectedTab] = useState(() => {
        return "product";
    });
    const [paidOrdersCount, setPaidOrdersCount] = useState(0);

    const { user, checkAuthStatus } = useAuth();
    const navigate = useNavigate();
    const { triggerRefresh } = useGlobalEvent();

    const fetchPaidOrdersCount = async () => {
        if (!user?.userId) {
            setPaidOrdersCount(0);
            return;
        }

        try {
            const fp = await getDeviceFingerprint();
            const res = await axios.get(`${BASE_URL}/shopping/creator-creatororder/${user.userId}`, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            });
            const data = res?.data;
            const orders = Array.isArray(data?.order) ? data.order : [];
            const paidCount = orders.filter(order => order.status === 'paid').length;
            setPaidOrdersCount(paidCount);

            // Trigger global refresh for TopNavigation
            triggerRefresh();
        } catch (err) {
            console.error('Failed to fetch orders count:', err);
            setPaidOrdersCount(0);
        }
    };

    useEffect(() => {
        const check = async () => {
            const valid = await checkAuthStatus();
            if (!valid) {
                alert(
                    t("profile.sessionExpired") || "เซสชันหมดอายุ กรุณาล็อกอินอีกครั้ง"
                );
                navigate("/signup");
            } else {
                //alert("welcome_back!"); // ✅ แสดงทุกครั้งที่โฟกัสกลับมา
                console.log("welcome_back!");
            }
        };

        // ตรวจตอนเข้าหน้านี้ครั้งแรก
        check();

        // ตรวจทุกครั้งที่กลับมาโฟกัสหน้าเว็บนี้
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                check();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // Fetch paid orders count when user changes
    useEffect(() => {
        fetchPaidOrdersCount();
    }, [user?.userId]);


    return (
        <>
            <div className="flex flex-col gap-2 mt-[65px] w-full">
                <div className="flex justify-center">
                    <div className="mt-2 flex items-center bg-gray-800 p-2 overflow-x-auto rounded-full space-x-2">

                        <button
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${selectedTab === "product"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                            onClick={() => {
                                setSelectedTab("product");
                            }}
                        >
                            Your Product
                        </button>
                        <button
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm relative ${selectedTab === "your-order"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                            onClick={() => {
                                setSelectedTab("your-order");
                            }}
                        >
                            Your Order
                            {paidOrdersCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                    {paidOrdersCount}
                                </span>
                            )}
                        </button>
                        {user?.role === "superadmin" && (
                            <button
                                className="flex-shrink-0 px-4 py-2 rounded-full text-sm bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-1"
                                onClick={() => {
                                    setSelectedTab("superadmin");
                                    localStorage.setItem("profileSelectedTab", "superadmin");
                                }}
                            >
                                <FaCrown className="text-white" />
                            </button>
                        )}

                    </div>
                </div>

                <div>

                    {selectedTab === "product" && <ProductsConfigShopping />}
                    {selectedTab === "your-order" && <ShoppingOrderConfig onOrdersUpdate={fetchPaidOrdersCount} />}
                    {selectedTab === "superadmin" && <ShoppingSuperAdmin />}

                </div>
            </div>
        </>
    );
}

export default Store;
