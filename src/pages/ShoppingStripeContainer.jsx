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

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const paymentElementOptions = {
    layout: "accordion",
    paymentMethodOrder: ["card", "promptpay"],
};

const ShoppingStripeContainer = ({ clientSecret, clearDiscountCode, userEmailRef }) => {
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
                        email,
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

        return paymentIntent
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
                                <PaymentElement
                                    id="payment-element"
                                    options={paymentElementOptions}
                                ></PaymentElement>
                            </div>
                            <button
                                className="flex w-48 bg-green-600 hover:bg-green-800 focus:outline-none rounded-lg text-white text-[20px] py-2 px-4 shadow-lg transition duration-300"
                                style={{
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
