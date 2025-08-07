import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ResetPassword = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [ref, setRef] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    const refParam = searchParams.get("ref");

    if (emailParam && tokenParam && refParam) {
      setEmail(emailParam);
      setToken(tokenParam);
      setRef(refParam);
    } else {
      setMessage("Invalid or expired reset link.");
    }
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!password || !confirmPassword) {
    setMessage("Please fill in all fields.");
    setIsSuccess(false);
    return;
  }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match.");
    setIsSuccess(false);
    return;
  }

  try {
    console.log("Payload:", { token, ref, password });


    const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
        email: email,
        token,
        ref,
        password,
    });



    if (response.status === 200) {
      setIsSuccess(true);
      setMessage("Your password has been reset successfully.");
      setTimeout(() => {
          navigate("/signup");
        }, 1200);
    } else {
      setIsSuccess(false);
      setMessage("Unexpected response from server.");
    }
  } catch (error) {
    console.error("Reset password error:", error);

    // เพิ่ม log สำหรับข้อมูล response จาก server (ถ้ามี)
    if (error.response) {
      console.error("Server response data:", error.response.data);
      console.error("Server response status:", error.response.status);
      console.error("Server response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }

    setIsSuccess(false);

    if (error.response && error.response.data && error.response.data.message) {
      setMessage(error.response.data.message);
    } else {
      setMessage("An error occurred. Please try again.");
    }
  }
};



  return (
    <div
      style={{
         display: "flex",
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: "100",
          backgroundColor: "rgba(0,0,0,.3)",
          justifyContent: "center",
          alignItems: "center",

      }}
    >
        
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "30px 20px",
          boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          🔐 Reset your password
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <TextField
            required
            label="New password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            InputProps={{ style: { borderRadius: "12px" } }}
          />

          <TextField
            required
            label="Confirm new password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            InputProps={{ style: { borderRadius: "12px" } }}
          />

          <button
            className="button1"
            type="submit"
            style={{
              width: "100%",
              padding: "12px 0",
              fontSize: "16px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Reset Password
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: "15px",
              color: isSuccess ? "green" : "red",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
