import { useTranslation } from "react-i18next";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const getFPConfig = async () => {
    const fp = await getDeviceFingerprint();
    return { headers: { 'device-fingerprint': fp }, withCredentials: true };
};

function ShoppingWishlist() {
    const { t, i18n } = useTranslation();
    const [wishlist, setWishlist] = useState([]);
    const { isLoggedIn, user } = useAuth();
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            const config = await getFPConfig();
            const res = await axios.get(`${BASE_URL}/shopping/wishlist/${user?.userId}`,
                config
            );
            setWishlist(res.data.wishlist.items);
        }
        catch (error) {
            console.error("Error fetching wishlist:", error);
        }
    }

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const config = await getFPConfig();
            await axios.patch(`${BASE_URL}/shopping/wishlist/remove-item`,
                {
                    userId: user?.userId,
                    productId: productId
                },
                config
            );
            // รีเฟรช wishlist หลังจากลบ
            fetchWishlist();
        } catch (error) {
            console.error("Error removing from wishlist:", error);
        }
    }

    useEffect(() => {
        if (user?.userId) {
            fetchWishlist();
        }
    }, [user?.userId]);

    if (!isLoggedIn) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                onClick={() => navigate("/shopping")}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-xl p-6 relative w-[90%] max-w-sm shadow-xl"
                >
                    <button
                        onClick={() => navigate("/shopping")}
                        className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                    >
                        ×
                    </button>
                    <h2
                        className="text-center text-lg font-semibold mb-4"
                        style={{ color: "#dc2626" }}
                    >
                        {(i18n.language === "th" ? 'คุณยังไม่ได้ล็อกอิน' : 'Please Login.')}
                    </h2>
                    <button
                        onClick={() => navigate("/signup")}
                        className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {(i18n.language === "th" ? 'ล็อกอิน' : 'LOGIN')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="container" style={{ paddingTop: "70px", maxWidth: "90%" }}>
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "end",
                        justifyContent: "center",
                        marginBottom: "30px"
                    }}>
                    <div className="EventSlideHeaderText1">
                        {(i18n.language === "th" ? 'รายการติดตาม' : 'Wishlist')}
                    </div>
                </div>

                {/* Wishlist Table */}
                <div style={{ overflowX: "auto", marginBottom: "50px" }}>
                    {wishlist.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                            {(i18n.language === "th" ? 'ไม่มีสินค้าในรายการโปรด' : 'No items in wishlist')}
                        </div>
                    ) : (
                        <table style={{ 
                            width: "100%", 
                            borderCollapse: "collapse",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa" }}>
                                    <th style={{ 
                                        padding: "15px", 
                                        textAlign: "left", 
                                        fontWeight: "600",
                                        borderBottom: "2px solid #dee2e6",
                                        color: "#495057"
                                    }}>
                                        {(i18n.language === "th" ? 'รูปภาพ' : 'Image')}
                                    </th>
                                    <th style={{ 
                                        padding: "15px", 
                                        textAlign: "left", 
                                        fontWeight: "600",
                                        borderBottom: "2px solid #dee2e6",
                                        color: "#495057"
                                    }}>
                                        {(i18n.language === "th" ? 'ชื่อสินค้า' : 'Title')}
                                    </th>
                                    <th style={{ 
                                        padding: "15px", 
                                        textAlign: "left", 
                                        fontWeight: "600",
                                        borderBottom: "2px solid #dee2e6",
                                        color: "#495057"
                                    }}>
                                        {(i18n.language === "th" ? 'คำอธิบายสินค้า' : 'Description')}
                                    </th>
                                    <th style={{ 
                                        padding: "15px", 
                                        textAlign: "center", 
                                        fontWeight: "600",
                                        borderBottom: "2px solid #dee2e6",
                                        color: "#495057"
                                    }}>
                                        {(i18n.language === "th" ? 'การจัดการ' : 'Action')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlist.map((item, index) => (
                                    <tr key={item._id || index} style={{ 
                                        borderBottom: "1px solid #dee2e6",
                                        transition: "background-color 0.2s"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                    >
                                        {/* Image Column */}
                                        <td style={{ padding: "15px" }}>
                                            {item.image && item.image.length > 0 ? (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.title?.en || "Product"}
                                                    style={{ 
                                                        width: "80px", 
                                                        height: "80px", 
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                        border: "1px solid #dee2e6"
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div style={{ 
                                                    width: "80px", 
                                                    height: "80px", 
                                                    backgroundColor: "#f8f9fa",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#6c757d",
                                                    fontSize: "12px",
                                                    border: "1px solid #dee2e6"
                                                }}>
                                                    {(i18n.language === "th" ? 'ไม่มีรูป' : 'No Image')}
                                                </div>
                                            )}
                                        </td>

                                        {/* Title EN Column */}
                                        <td style={{ 
                                            padding: "15px",
                                            verticalAlign: "middle"
                                        }}>
                                            <div style={{ 
                                                fontWeight: "500",
                                                color: "#212529",
                                                lineHeight: "1.4"
                                            }}>
                                                {(i18n.language === "th" ? item.title?.th || "-" : item.title?.en || "-")}
                                            </div>
                                        </td>

                                        {/* Title TH Column */}
                                        <td style={{ 
                                            padding: "15px",
                                            verticalAlign: "middle"
                                        }}>
                                            <div style={{ 
                                                fontWeight: "500",
                                                color: "#212529",
                                                lineHeight: "1.4"
                                            }}>
                                                {(i18n.language === "th" ? item.description?.th || "-" : item.description?.en || "-")}
                                            </div>
                                        </td>

                                        {/* Action Column */}
                                        <td style={{ 
                                            padding: "15px",
                                            textAlign: "center",
                                            verticalAlign: "middle"
                                        }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                {/* View Product Button */}
                                                <button
                                                    onClick={() => navigate(`/shopping/product/${item.productId}`)}
                                                    style={{
                                                        padding: "8px 12px",
                                                        backgroundColor: "#007bff",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "13px",
                                                        fontWeight: "500",
                                                        transition: "background-color 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
                                                    title={i18n.language === "th" ? "ดูสินค้า" : "View Product"}
                                                >
                                                    {(i18n.language === "th" ? 'ดู' : 'View')}
                                                </button>

                                                {/* Remove from Wishlist Button */}
                                                <button
                                                    onClick={() => handleRemoveFromWishlist(item.productId)}
                                                    style={{
                                                        padding: "8px 12px",
                                                        backgroundColor: "#dc3545",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "13px",
                                                        fontWeight: "500",
                                                        transition: "background-color 0.2s"
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
                                                    title={i18n.language === "th" ? "ลบออกจากรายการโปรด" : "Remove from Wishlist"}
                                                >
                                                    {(i18n.language === "th" ? 'ลบ' : 'Remove')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShoppingWishlist;