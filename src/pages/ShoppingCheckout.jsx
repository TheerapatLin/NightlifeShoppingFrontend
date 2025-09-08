import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ShoppingStripeContainer from "./ShoppingStripeContainer";
import React, { useEffect, useState, useRef } from "react";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useLocation } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const ShoppingCheckout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const isIntentLoading = useRef(false);
  const [elementsKey, setElementsKey] = useState(0);
  const location = useLocation();
  const addressData = location.state?.addressData;
  const { user } = useAuth();

  useEffect(() => {
    const createShoppingPaymetIntent = async () => {
      try {
        const { data } = await axios.post(`${BASE_URL}/shopping/create-payment-intent`,
          {
            userId: user.userId,
            newAddress: [addressData],
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        )

        if (data.paymentIntentId) {
          localStorage.setItem("paymentIntentId", data.paymentIntentId);
        }
        setElementsKey((prev) => prev + 1); // ✅ force Elements reload with new clientSecret
        isIntentLoading.current = false;
        setClientSecret(data.clientSecret);
      }
      catch (error) {
        console.error("Error creating payment intent:", error);
        isIntentLoading.current = false;
      }
    }

    if (BASE_URL && !isIntentLoading.current && !clientSecret) {
      isIntentLoading.current = true;
      createShoppingPaymetIntent();
    }
    console.log(`addressData => ${JSON.stringify(addressData)}`)
  }, [addressData])

  return (
    <>
      {!clientSecret ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", width: "100%" }}>
          <LoaderStyleOne />
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }} key={elementsKey}>
          <ShoppingStripeContainer
            clientSecret={clientSecret}
          />
        </Elements>
      )}
    </>
  );
}

export default ShoppingCheckout;