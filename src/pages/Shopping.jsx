// Shopping.jsx
import { useEffect, useState } from "react";
import "../public/css/App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useGlobalEvent } from "../context/GlobalEventContext";
import AllEventsInclude from "../components/AllEventsInclude";
import VideotextNLShopping from "../components/VideotextNLShopping";
import VideotextnightlifeMobile from "../components/VideotextnightlifeMobile";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Shopping() {
    const { t, i18n } = useTranslation();
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { isScrolled, currentPage, updateCurrentPage, windowSize } =
        useGlobalEvent();


    const [productData, setProductData] = useState([])

    // ดึงข้อมูล product จาก backend (ใช้ API จริง)
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${BASE_URL}/shopping/product`)
                setProductData(res.data)
                setError("");
            }
            catch (error) {
                console.error("Error fetching products:", error);
                setError("Internal Error.");
            } finally {
                setLoading(false);
            }
        }
        fetchProduct()
    }, [])

    if (loading) {
        return (
            <div
                style={{ padding: 20 }}
            >
                {(i18n.language === "th" ? 'กำลังโหลดข้อมูลสินค้า...' : 'Loading Products...')}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 12 }}>{error}</div>
                <button onClick={() => navigate(-1)} style={{ padding: "8px 16px" }}>
                    กลับ
                </button>
            </div>
        );
    }

    return (
        <div>

            <div className="App">
                {windowSize.width > 768 ? (
                    <VideotextNLShopping />
                ) : (
                    <VideotextnightlifeMobile />
                )}
            </div>

            {/* ************** Selected Products **************** */}
            <div
                className="container"
                style={{ paddingTop: "70px", maxWidth: "90%" }}
            >
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "end",
                        justifyContent: "center",
                    }}
                >
                    <div
                        className="EventSlideHeaderText1"
                    >
                        {(i18n.language === "th" ? 'สินค้าทั้งหมด' : 'All Products')}
                    </div>
                </div>
            </div>

            {/* Product Cards Grid */}
            <div
                className="container"
                style={{ paddingTop: "20px", maxWidth: "90%" }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {productData.filter((p) => p.status === "active").map((product) => {
                        const cover = product.image && product.image.length > 0 ? product.image[0].fileName : null;
                        const name = (i18n.language === "th" ? product.title?.th : product.title?.en) || product.title?.en || "Untitled";
                        const price = product.originalPrice;
                        return (
                            <div
                                key={product._id}
                                onClick={() => navigate(`/shopping/product/${product._id}`)}
                                style={{
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    overflow: "hidden",
                                    background: "#fff",
                                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                                    cursor: "pointer",
                                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)";
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        aspectRatio: "4/3",
                                        background: "#f7f7f7",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {cover ? (
                                        <img
                                            src={cover}
                                            alt={name}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <span
                                            style={{ color: "#aaa" }}
                                        >
                                            {(i18n.language === "th" ? 'ไม่มีรูปภาพ' : 'No image')}
                                        </span>
                                    )}
                                </div>
                                <div style={{ padding: "10px 12px" }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 16,
                                            lineHeight: 1.3,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {name}
                                    </div>
                                    <div style={{ color: "#555", fontSize: 14 }}>
                                        {new Intl.NumberFormat(i18n.language || "en-US", {
                                            style: "currency",
                                            currency: product.currency || "THB",
                                            maximumFractionDigits: 0,
                                        }).format(price)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ************** All Events Include **************** */}
            <div
                className="container"
                style={{ paddingTop: "70px", maxWidth: "100%" }}
            >
                <AllEventsInclude />
            </div>

        </div>
    );
}

export default Shopping;
