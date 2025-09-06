import {
    CardElement,
    Elements,
    LinkAuthenticationElement,
    PaymentElement,
    PaymentRequestButtonElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import { Checkbox } from "@stripe/ui-extension-sdk/ui";
// import { ContextView, Button } from "@stripe/ui-extension-sdk/ui";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import React, { useEffect, useState } from "react";
// import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
// import i18n from "../i18n";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const paymentElementOptions = {
    layout: "accordion",
    paymentMethodOrder: ["card", "promptpay"],
};

const ShoppingStripeContainer = ({ clientSecret, userEmailRef, onAddressChange }) => {
    const { t, i18n } = useTranslation();
    const paymentElementOptions = {
        fields: {
            billingDetails: {
                name: "never",
                email: "never",
            },
        },
    };

    const navigate = useNavigate();
    const { user } = useAuth();
    const stripe = useStripe();
    const [fullName, setFullName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [confirmEmail, setConfirmEmail] = useState(user?.email || "");
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [productData, setProductData] = useState([]);
    const [basketData, setBasketData] = useState(null);

    const handleBack = () => {
        navigate(`/`, {});
    };

    const checkEmailExists = async (email) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/accounts/check?email=${email}`
            );
            return response.status === 200;
        } catch (err) {
            return false;
        }
    }

    // Fetch product list for resolving images and variant prices
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/shopping/product`);
                setProductData(res.data || []);
            } catch (err) {
                setProductData([]);
            }
        };
        fetchProducts();
    }, []);

    // Fetch user's basket
    useEffect(() => {
        const fetchBasket = async () => {
            if (!user?.userId) return;
            try {
                const fp = await getDeviceFingerprint();
                const res = await axios.get(`${BASE_URL}/shopping/basket/${user.userId}`, {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                });
                setBasketData(res.data || null);
            } catch (err) {
                setBasketData(null);
            }
        };
        fetchBasket();
    }, [user?.userId]);

    const handleSubmit = async (e) => {

        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        let result
        const emailExists = await checkEmailExists(email);
        if (emailExists && !user) {
            result = await confirmPayment();
        } else {
            result = await confirmPayment();
        }

        if (result.error) {
            console.error("❌ Payment failed:", result.error.message);
        } else if (result.paymentIntent) {
            console.log("✅ Payment succeeded:", result.paymentIntent);
        }
    }

    const confirmPayment = async () => {
        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-complete`,
                payment_method_data: {
                    billing_details: {
                        name: fullName,
                        email
                    },
                },
            },
        });

        if (error) {

            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else if (error.type === "canceled") {
                setMessage("Payment was canceled.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            setMessage("Payment succeeded!");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <>
            <div style={{ width: "100%" }}>
                <form id="payment-form" onSubmit={handleSubmit}>
                    <div className="mt-[0px] md:mt-[80px] flex justify-center">
                        <div className="bg-white w-full h-full max-w-7xl rounded-none md:rounded-xl md:px-10 pb-8 md:py-8">
                            <div className="sticky top-0 bg-white w-full md:relative flex justify-between md:justify-start items-center p-1">
                                <button type="button" onClick={handleBack} className="rounded-full flex items-center justify-center bg-transparent">
                                    <ChevronLeft />
                                </button>
                                <label>Shopping</label>
                                <div className="block md:hidden w-6"></div>
                            </div>
                            {/* Basket summary */}
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Order Summary</div>
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
                                            const unitPrice = (item.totalPrice && item.quantity) ? (item.totalPrice / item.quantity) : (variant?.price ?? product?.originalPrice ?? 0);
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
                                                        <div style={{ color: "#6B7280" }}>
                                                            {new Intl.NumberFormat(i18n.language || "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(unitPrice)}
                                                        </div>
                                                    </div>
                                                    <div style={{ color: "#6B7280", textAlign: "right" }}>{item.variant?.sku || "-"}</div>
                                                    <div style={{ color: "#111827", textAlign: "right" }}>{item.quantity || 0}</div>
                                                    <div style={{ color: "#111827", textAlign: "right" }}>
                                                        {new Intl.NumberFormat(i18n.language || "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(item.totalPrice || 0)}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                        {/* grand total */}
                                        <div style={{ gridColumn: "1 / -2", textAlign: "right", fontWeight: 700 }}>Total</div>
                                        <div style={{ textAlign: "right", fontWeight: 700 }}>
                                            {new Intl.NumberFormat(i18n.language || "en-US", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(basketData?.totalPrice || 0)}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ color: "#6B7280" }}>Your basket is empty.</div>
                                )}
                            </div>
                            <div style={{ marginBottom: "16px" }}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            userEmailRef.current = e.target.value; // ✅ sync ref ทันที
                                            //setUserEmail(e.target.value); // ✅ sync กลับไป Checkout
                                        }}
                                        placeholder="Enter your email"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        disabled={!!user?.email}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Confirm Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={confirmEmail}
                                        onChange={(e) => {
                                            setConfirmEmail(e.target.value);
                                            userEmailRef.current = e.target.value; // ✅ sync ref ทันที
                                            //setUserEmail(e.target.value); // ✅ sync กลับไป Checkout เช่นกัน
                                        }}
                                        placeholder="Confirm your email"
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            <PaymentElement
                                id="payment-element"
                                options={paymentElementOptions}
                            ></PaymentElement>
                            <button
                                className="flex w-48 bg-green-600 hover:bg-green-800 focus:outline-none rounded-lg text-white text-[20px] py-2 px-4 shadow-lg transition duration-300"
                                style={{
                                    marginTop: "24px",
                                    minWidth: "100%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {i18n.language == "en"
                                    ? "Confirm And Pay"
                                    : "ยืนยันและชำระเงิน"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </>
    );
};

export default ShoppingStripeContainer;
