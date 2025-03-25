import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TextField from "@mui/material/TextField";
import { useGlobalEvent } from "../context/GlobalEventContext";
import "../public/css/SmallCalendar.css";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import Checkout from "./Checkout";
import CompletePage from "./CompletePayment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// const stripePromise = loadStripe(
//   "pk_test_51NigrKCQKredYD0SRv7ivWjWuiHQIxjb5OrykOyx1Zvu3xLWlS7T6yqyv03bF1QoRKF82MeckE6H8pmP0meRqFLp005UQtTW3j"
// );
const stripePromise = loadStripe(
  "pk_live_51NigrKCQKredYD0SBwj7z0WPCQusOAMy6vCB10eLsuX0ij3oCaGdYYDaRZ1uKi0DkN0E4T7tJ6s2U7vh0wqwG4gQ007MTlWDhR"
);

const Payment = () => {
  var isIntentLoading = false;
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const location = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentState, setPaymentState] = useState(location.state);
  const [activityId, setActivityId] = useState(
    location.state?.activityId || localStorage.getItem("activityId") || ""
  );
  const [scheduleId, setScheduleId] = useState(
    location.state?.scheduleId || localStorage.getItem("scheduleId") || ""
  );
  const [adults, setAdults] = useState(
    location.state?.adults || parseInt(localStorage.getItem("adults")) || 0
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
    event.preventDefault();
    //alert('payment_page');
    const createPaymentIntent = async () => {
      // alert(`activityId : ${activityId}`);
      // alert(`scheduleId : ${scheduleId}`);
      // alert(`startDate : ${startDate}`);
      try {
        const response = await fetch(
          `${BASE_URL}/order/create-payment-intent`,
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
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }
        const data = await response.json();
        //localStorage.setItem("client_secret", data.clientSecret);
        setClientSecret(data.clientSecret);
        isIntentLoading = false;
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };

    if (BASE_URL && !isIntentLoading) {
      isIntentLoading = true;
      createPaymentIntent();
    }
  }, [BASE_URL]); // คุณอาจเพิ่ม BASE_URL ใน dependency ถ้ามีความเสี่ยงที่ค่าอาจเปลี่ยน

  return (
    <>
      {clientSecret && (
        <div style={{ paddingTop: "60px" }}>
          <Elements
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
