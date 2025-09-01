import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ShoppingStripeContainer from "./ShoppingStripeContainer";
import React, { useEffect, useState, useRef } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const ShoppingCheckout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const isIntentLoading = useRef(false);
  const [elementsKey, setElementsKey] = useState(0);

  useEffect(() => {
    const createShoppingPaymetIntent = async () => {
      try {
        const response = await fetch(`${BASE_URL}/shopping/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "686b96c95c75bb3f6bf32801"
          })
        })
        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }
        
        const data = await response.json();
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
  })

  return (
    <>
      {!clientSecret ? (
        <div>Loading payment...</div> // หรือใส่ spinner ก็ได้
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <ShoppingStripeContainer clientSecret={clientSecret} />
        </Elements>
      )}
    </>
  );
}

export default ShoppingCheckout;