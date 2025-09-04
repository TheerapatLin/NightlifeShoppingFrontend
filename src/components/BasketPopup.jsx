// BasketPopup.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";
import axios from "axios";

const BasketPopup = ({ isOpen, onClose, basketData, productData }) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { user } = useAuth();
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

    if (!isOpen) return null;

    // Not logged in modal
    if (!isLoggedIn) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onClose}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-xl p-6 relative w-[90%] max-w-sm shadow-xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                    >
                        ×
                    </button>
                    <h2 className="text-center text-lg font-semibold mb-4" style={{ color: "#dc2626" }}>
                        คุณยังไม่ได้ล็อกอิน
                    </h2>
                    <button
                        onClick={() => navigate("/signup")}
                        className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Go to Log in
                    </button>
                </div>
            </div>
        );
    }

    const handleClearBasket = async () => {
        const basketId = basketData._id
        try {
            const uid = user.userId;
            const fp = await getDeviceFingerprint();
            const res = await axios.patch(`${BASE_URL}/shopping/basket/clear-basket/${basketId}`,
                {
                    userId: uid
                },
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                })
            console.log(res.data.message)
            window.location.reload();
        }
        catch (error) {
            console.error("Error fetching baskets:", error);
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(720px, 92vw)",
                    maxHeight: "80vh",
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        padding: "14px 18px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Basket</div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: 20,
                            cursor: "pointer",
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ padding: 16, overflow: "auto" }}>
                    {basketData?.items?.length ? (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto auto auto",
                                gap: 12,
                                alignItems: "center",
                            }}
                        >
                            <div style={{ fontWeight: 600, color: "#374151" }}>Product</div>
                            <div style={{ fontWeight: 600, color: "#374151", textAlign: "right" }}>SKU</div>
                            <div style={{ fontWeight: 600, color: "#374151", textAlign: "right" }}>Qty</div>
                            <div style={{ fontWeight: 600, color: "#374151", textAlign: "right" }}>Total</div>
                            {basketData.items.map((item) => {
                                const product = productData.find((p) => String(p._id) === String(item.productId));
                                const variant = product?.variants?.find((v) => v.sku === item.variant?.sku);
                                const imgSrc = variant?.images?.[0]?.fileName || product?.image?.[0]?.fileName || null;
                                return (
                                    <React.Fragment key={`${item.productId}-${item.variant?.sku}`}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    alt={item.variant?.sku || "product"}
                                                    style={{
                                                        width: 64,
                                                        height: 64,
                                                        objectFit: "cover",
                                                        borderRadius: 8,
                                                        background: "#f3f4f6",
                                                        border: "1px solid #eee",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 64,
                                                        height: 64,
                                                        borderRadius: 8,
                                                        background: "#f3f4f6",
                                                        border: "1px solid #eee",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "#9CA3AF",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ color: "#6B7280", textAlign: "right" }}>{item.variant?.sku || "-"}</div>
                                        <div style={{ color: "#111827", textAlign: "right" }}>{item.quantity || 0}</div>
                                        <div style={{ color: "#111827", textAlign: "right" }}>
                                            {new Intl.NumberFormat(i18n.language || "en-US", {
                                                style: "currency",
                                                currency: "THB",
                                                maximumFractionDigits: 0,
                                            }).format(item.totalPrice || 0)}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ color: "#6B7280", textAlign: "center", padding: "24px 0" }}>
                            Your basket is empty.
                        </div>
                    )}
                </div>
                <div
                    style={{
                        padding: "12px 18px",
                        borderTop: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ fontWeight: 600 }}>Total</div>
                    <div style={{ fontWeight: 700 }}>
                        {new Intl.NumberFormat(i18n.language || "en-US", {
                            style: "currency",
                            currency: "THB",
                            maximumFractionDigits: 0,
                        }).format(basketData?.totalPrice || 0)}
                    </div>
                </div>
                <button
                    onClick={handleClearBasket}
                    // handleClearBasket
                    style={{
                        padding: "12px 20px",
                        fontSize: "18px",
                        background: "#635bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(99,91,255,0.15)",
                        alignSelf: "flex-end",
                        width: "fit-content",
                        margin: "18px"
                    }}
                >
                    Clear Basket
                </button>
                <button
                    onClick={() => { onClose(); navigate("/shopping-stripe"); }}
                    style={{
                        padding: "12px 20px",
                        fontSize: "18px",
                        background: "#635bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(99,91,255,0.15)",
                        alignSelf: "flex-end",
                        width: "fit-content",
                        margin: "18px"
                    }}
                >
                    Confirm And Pay
                </button>
            </div>
        </div>
    );
};

export default BasketPopup;


