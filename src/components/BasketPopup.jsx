// BasketPopup.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";
import axios from "axios";
import AddressPopup from "./AddressPopup";
import { FaTrash } from "react-icons/fa";

const BasketPopup = ({ isOpen, onClose, basketData, productData, onAddressData }) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

    const [showWarning, setShowWarning] = useState(false);
    const [showWarningAddress, setShowWarningAddress] = useState(false);
    const [addressData, setAddressData] = useState(null);

    // style reuse
    const gridHeaderStyle = {
        fontWeight: 600,
        color: "#374151",
        textAlign: "right"
    };
    const btnTrashStyle = {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        marginLeft: 4,
        color: "#dc2626",
        fontSize: 20,
        display: "flex",
        alignItems: "center"
    };
    const imgStyle = {
        width: 64,
        height: 64,
        objectFit: "cover",
        borderRadius: 8,
        background: "#f3f4f6",
        border: "1px solid #eee"
    };
    const noImgStyle = {
        ...imgStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9CA3AF",
        fontSize: 12
    };

    if (!isOpen) return null;
    if (!isLoggedIn) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={onClose}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-xl p-6 relative w-[90%] max-w-sm shadow-xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                    >
                        ×
                    </button>
                    <h2
                        className="text-center text-lg font-semibold mb-4"
                        style={{ color: "#dc2626" }}
                    >
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
        try {
            const fp = await getDeviceFingerprint();
            await axios.patch(`${BASE_URL}/shopping/basket/clear-basket/${basketData._id}`,
                { userId: user.userId },
                { headers: { "device-fingerprint": fp }, withCredentials: true });
            navigate("/shopping");
            window.location.reload();
        } catch (error) { console.error("Error fetching baskets:", error); }
    };

    // รวมฟังก์ชัน address confirm/save
    const handleAddress = (address) => {
        setAddressData(address);
        onAddressData?.(address);
        setShowWarningAddress(false);
    };

    const handleCheckout = () => {
        if (!basketData?.items?.length) return setShowWarning(true);
        if (!addressData) return setShowWarningAddress(true);
        onClose();
        navigate("/shopping-stripe", { state: { addressData } });
    };

    const handleRemoveProduct = async (productId, sku) => {
        try {
            const fp = await getDeviceFingerprint();
            await axios.delete(`${BASE_URL}/shopping/basket/removeproduct-basket/${basketData._id}`,
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                    data: { userId: user.userId, productId, sku },
                }
            );
            window.location.reload();
        } catch (error) {
            console.error("Error removing product from basket:", error.response?.data || error);
        }
    };

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div onClick={e => e.stopPropagation()} style={{ width: "min(720px, 92vw)", maxHeight: "80vh", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>Basket</div>
                        <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
                    </div>
                    <div style={{ padding: 16, overflow: "auto" }}>
                        {basketData?.items?.length ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 12, alignItems: "center" }}>
                                <div style={{ ...gridHeaderStyle, textAlign: "left" }}>Product</div>
                                <div style={gridHeaderStyle}>SKU</div>
                                <div style={gridHeaderStyle}>Qty</div>
                                <div style={gridHeaderStyle}>Total</div>
                                <div style={gridHeaderStyle}></div>
                                {basketData.items.map(item => {
                                    const product = productData.find(p => String(p._id) === String(item.productId));
                                    const variant = product?.variants?.find(v => v.sku === item.variant?.sku);
                                    const imgSrc = variant?.images?.[0]?.fileName || product?.image?.[0]?.fileName || null;
                                    return [
                                        <div key={`img-${item.productId}-${item.variant?.sku}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            {imgSrc ? <img src={imgSrc} alt={item.variant?.sku || "product"} style={imgStyle} /> : <div style={noImgStyle}>No image</div>}
                                        </div>,
                                        <div key={`sku-${item.productId}-${item.variant?.sku}`} style={{ color: "#6B7280", textAlign: "right" }}>{item.variant?.sku || "-"}</div>,
                                        <div key={`qty-${item.productId}-${item.variant?.sku}`} style={{ color: "#111827", textAlign: "right" }}>{item.quantity || 0}</div>,
                                        <div key={`total-${item.productId}-${item.variant?.sku}`} style={{ color: "#111827", textAlign: "right" }}>{new Intl.NumberFormat(i18n.language || "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(item.totalPrice || 0)}</div>,
                                        <div key={`del-${item.productId}-${item.variant?.sku}`} style={{ textAlign: "right" }}>
                                            <button onClick={() => handleRemoveProduct(item.productId, item.variant?.sku)} style={btnTrashStyle} title="ลบสินค้า"><FaTrash /></button>
                                        </div>
                                    ];
                                }).flat()}
                            </div>
                        ) : (
                            <div style={{ color: "#6B7280", textAlign: "center", padding: "24px 0" }}>Your basket is empty.</div>
                        )}
                    </div>
                    <div style={{ padding: "12px 18px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 600 }}>Total</div>
                        <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat(i18n.language || "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(basketData?.totalPrice || 0)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 18px", marginBottom: "8px" }}>
                        {addressData && <div style={{ color: "#28a745", fontWeight: 600, fontSize: 14 }}>เลือกที่อยู่แล้ว</div>}
                        <div style={{ display: "flex", gap: 12 }}>
                            <button onClick={handleClearBasket} style={{ padding: "12px 20px", fontSize: 18, background: "#635bff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 8px rgba(99,91,255,0.15)" }}>Clear Basket</button>
                            <button onClick={handleCheckout} style={{ padding: "12px 20px", fontSize: 18, background: "#28a745", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 8px rgba(99,91,255,0.15)" }}>Confirm And Pay</button>
                        </div>
                    </div>
                </div>
            </div>
            {showWarning && (
                <div onClick={() => setShowWarning(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
                    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: "min(420px, 92vw)", padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>แจ้งเตือน</div>
                        <div style={{ color: "#374151", marginBottom: 16 }}>คุณยังไม่มีสินค้าในตะกร้า</div>
                        <button onClick={() => setShowWarning(false)} style={{ padding: "10px 16px", background: "#635bff", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 8px rgba(99,91,255,0.15)" }}>ตกลง</button>
                    </div>
                </div>
            )}
            <AddressPopup
                isOpen={showWarningAddress}
                onClose={() => setShowWarningAddress(false)}
                onAddressConfirm={handleAddress}
                onAddressSave={handleAddress}
            />
        </>
    );
};

export default BasketPopup;


