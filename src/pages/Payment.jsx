import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Checkout from "./Checkout";
import CompletePage from "./CompletePayment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [elementsKey, setElementsKey] = useState(0); // ✅ for forcing Elements to remount

  const [appliedDiscountCode, setAppliedDiscountCode] = useState(
    location.state?.appliedDiscountCode ||
      localStorage.getItem("appliedDiscountCode") ||
      ""
  );
  const [activityId, setActivityId] = useState(
    location.state?.activityId || localStorage.getItem("activityId") || ""
  );
  const [scheduleId, setScheduleId] = useState(
    location.state?.scheduleId || localStorage.getItem("scheduleId") || ""
  );
  const [adults, setAdults] = useState(
    location.state?.adults || parseInt(localStorage.getItem("adults")) || 1
  );
  const [children, setChildren] = useState(
    location.state?.children || parseInt(localStorage.getItem("children")) || 0
  );
  const [cost, setCost] = useState(
    location.state?.cost || localStorage.getItem("cost") || ""
  );
  const [startDate, setStartDate] = useState(
    location.state?.startDate || localStorage.getItem("startDate") || ""
  );
  const [priceDetails, setPriceDetails] = useState({
    originalPrice: null,
    discountAmount: null,
    affiliateDiscountAmount: null,
    paidAmount: null,
  });

  const isIntentLoading = useRef(false);

  const appearance = {
    theme: "stripe",
  };
  const loader = "auto";

  useEffect(() => {
    if (location.state?.mode === "reloadFromLocal") {
      setActivityId(localStorage.getItem("activityId"));
      setScheduleId(localStorage.getItem("scheduleId"));
      setAdults(parseInt(localStorage.getItem("adults")) || 1);
      setChildren(parseInt(localStorage.getItem("children")) || 0);
      setCost(localStorage.getItem("cost"));
      setStartDate(localStorage.getItem("startDate"));
    } else {
      localStorage.setItem("activityId", activityId);
      localStorage.setItem("scheduleId", scheduleId);
      localStorage.setItem("adults", adults);
      localStorage.setItem("children", children);
      localStorage.setItem("cost", cost);
      localStorage.setItem("startDate", startDate);
    }
  }, [
    location.state,
    activityId,
    scheduleId,
    adults,
    children,
    cost,
    startDate,
  ]);

  useEffect(() => {
    const createPaymentIntent = async () => {
      const stored = localStorage.getItem("affiliateRef");
      const affiliateCode = stored ? JSON.parse(stored)?.ref : null;

      const previousPaymentIntentId =
        localStorage.getItem("paymentIntentId") || null;

      try {
        const response = await fetch(
          `${BASE_URL}/activity-order/create-payment-intent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: [
                {
                  id: "activity",
                  costPerPerson: cost,
                  amountAdults: adults,
                  amountChildren: children,
                  activityId,
                  scheduleId,
                  startDate,
                },
              ],
              affiliateCode,
              appliedDiscountCode,
              previousPaymentIntentId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);

        setPriceDetails({
          originalPrice: data.originalPrice,
          discountAmount: data.discountAmount,
          affiliateDiscountAmount: data.affiliateDiscountAmount,
          paidAmount: data.paidAmount,
        });

        if (data.paymentIntentId) {
          localStorage.setItem("paymentIntentId", data.paymentIntentId);
        }

        setElementsKey((prev) => prev + 1); // ✅ force Elements reload with new clientSecret
        isIntentLoading.current = false;
      } catch (error) {
        console.error("Error creating payment intent:", error);
        isIntentLoading.current = false;
      }
    };

    if (BASE_URL && !isIntentLoading.current) {
      isIntentLoading.current = true;
      createPaymentIntent();
    }
  }, [
    BASE_URL,
    activityId,
    scheduleId,
    adults,
    children,
    cost,
    startDate,
    appliedDiscountCode,
  ]);

  return (
    <>
      {clientSecret && (
        <div style={{ paddingTop: "60px" }}>
          <Elements
            key={elementsKey} // ✅ force re-render when clientSecret updates
            options={{ clientSecret, appearance, loader }}
            stripe={stripePromise}
          >
            <Routes>
              <Route
                path="checkout"
                element={
                  <Checkout
                    state={{
                      activityId,
                      scheduleId,
                      adults,
                      children,
                      cost,
                      startDate,
                      priceDetails,
                      setPriceDetails,
                    }}
                  />
                }
              />
              <Route path="complete" element={<CompletePage />} />
            </Routes>
          </Elements>
        </div>
      )}
    </>
  );
};

export default Payment;
