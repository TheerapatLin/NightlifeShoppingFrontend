import React, { useState, useEffect } from "react";

import { useAsyncError, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import ProductsConfigShopping from "../components/ProductsConfigShopping"
import ShoppingOrderConfig from "../components/ShoppingOrderConfig"

function Store() {
    const { t, i18n } = useTranslation();
    const [selectedTab, setSelectedTab] = useState(() => {
        return "product";
    });

    const { user, checkAuthStatus } = useAuth();
    const navigate = useNavigate();

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
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${selectedTab === "your-order"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                            onClick={() => {
                                setSelectedTab("your-order");
                            }}
                        >
                            Your Order
                        </button>

                    </div>
                </div>

                <div>

                    {selectedTab === "product" && <ProductsConfigShopping />}
                    {selectedTab === "your-order" && <ShoppingOrderConfig />}

                </div>
            </div>
        </>
    );
}

export default Store;
