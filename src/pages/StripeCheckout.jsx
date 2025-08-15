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

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const paymentElementOptions = {
  layout: "accordion",
  paymentMethodOrder: ["card", "promptpay"],
};

const StripeContainer = ({ clientSecret, clearDiscountCode, userEmailRef }) => {
  const { t, i18n } = useTranslation();
  const [isPressed, setIsPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const paymentElementOptions = {
    fields: {
      billingDetails: {
        name: "never",
        email: "never",
      },
    },
  };
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [confirmEmail, setConfirmEmail] = useState(user?.email || "");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("client_secret");
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/accounts/check?email=${email}`
      );
      console.log(response);
      return response.status === 200;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    // ไม่เรียก setIsLoading(true) ตรงนี้
    // setIsLoading(true);

    const emailExists = await checkEmailExists(email);

    if (emailExists && !user) {
      await confirmPayment();
      // Swal.fire({
      //   title: "ยืนยันการชำระเงิน",
      //   text: "อีเมลนี้มีในระบบแล้ว คุณต้องการยืนยันการชำระเงินหรือไม่?",
      //   icon: "question",
      //   showCancelButton: true,
      //   confirmButtonText: "ยืนยัน",
      //   cancelButtonText: "ยกเลิก",
      // }).then(async (result) => {
      //   if (result.isConfirmed) {
      //     await confirmPayment(); // setIsLoading อยู่ในนี้
      //   } else {
      //     setIsLoading(false); // RESET ให้แน่ใจเมื่อกดยกเลิก
      //   }
      // });
    } else {
      await confirmPayment();
    }
  };

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
      if (
        error.message?.toLowerCase().includes("discount code") &&
        typeof clearDiscountCode === "function"
      ) {
        await clearDiscountCode(); // ✅ เคลียร์โค้ดส่วนลด
      }

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

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setConfirmEmail(user.email);
      userEmailRef.current = user.email; // ✅ sync ref ทันที
    }
  }, [user]);

  return (
    <div style={{ width: "100%" }}>
      <form id="payment-form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label>Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full p-2 border border-gray-300 rounded"
            disabled={!!user?.name}
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
              disabled={!!user?.email}
            />
          </div>
        </div>
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
        ></PaymentElement>

        <div
          disabled={isLoading || !stripe || !elements}
          id="submit"
          style={{
            minWidth: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            <div
              disabled={isLoading || !stripe || !elements}
              id="submit"
              style={{
                minWidth: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
          )}
        </div>
        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
      </form>
    </div>
  );
};

export default StripeContainer;
