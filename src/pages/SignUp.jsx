import React, { useState, useEffect } from "react";
import "../public/css/App.css";
import "../public/css/FlipDiv.css";
import TextField from "@mui/material/TextField";
import { useGlobalEvent } from "../context/GlobalEventContext";
import axios from "axios";
import Lottie from "lottie-web";
import loadingAnimation1 from "../public/lottie/loading1.json";
import succesAnimation1 from "../public/lottie/success1.json";
import emailSentAnimation1 from "../public/lottie/email_sent1.json";
import emailSentAnimation2 from "../public/lottie/email_sent2.json";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import closeIcon from "../img/circle_close.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

function SignUpForm() {
  const [isJustPasswordWrong, setIsJustPasswordWrong] = useState(false);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isEmailLottieLoad, setIsEmailLottieLoad] = useState(false);
  const [isLoadingLottieLoad, setIsLoadingLottieLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isJustSignup, setIsJustSignup] = useState(false);
  const [emailSentText, setEmailSentText] = useState(
    "ลงทะเบียนเรียบร้อยแล้ว!\nกรุณาตรวจสอบอีเมล\nก่อน Log in ครั้งแรก"
  );
  const { login, checkAuthStatus } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { windowSize } = useGlobalEvent();
  const navigate = useNavigate();
  const [signupFormData, setSignupFormData] = useState({
    signupName: "",
    signupEmail: "",
    signupPassword: "",
    signupConfirmPassword: "",
  });
  const [loginFormData, setLoginFormData] = useState({
    loginEmail: "",
    loginPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [flipped, setFlipped] = useState(false);

  function GoogleLoginButton() {
    const handleSuccess = async (credentialResponse) => {
      try {
        const { credential } = credentialResponse;
        const res = await axios.post(
          `${BASE_URL}/auth/google-login`,
          { token: credential },
          { withCredentials: true }
        );
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google Login Failed")}
      />
    );
  }

  const handleClick = () => {
    if (flipped) setIsJustSignup(false);
    setFlipped(!flipped);
  };

  const handleLoginChange = (e) => {
    setIsJustPasswordWrong(false);
    setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value });
  };

  const validateSignupForm = () => {
    let isValid = true;
    let errors = {};

    if (!signupFormData.signupEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    if (
      signupFormData.signupPassword.length < 8 ||
      signupFormData.signupPassword.length > 16
    ) {
      errors.password = "Password must be 8-16 characters long";
      isValid = false;
    }

    if (
      signupFormData.signupPassword !== signupFormData.signupConfirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginUser();
    }, 1000);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (validateSignupForm()) {
      setIsLoading(true);
      setTimeout(() => {
        registerUser();
      }, 1000);
    }
  };

  const styles = {
    gapText: {
      display: "flex",
      justifyContent: "center",
      height: "20px",
      fontSize: "12px",
      color: "red",
    },
  };

  const registerUser = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        {
          name: signupFormData.signupName.toLowerCase().trim(),
          email: signupFormData.signupEmail.toLowerCase().trim(),
          password: signupFormData.signupPassword.trim(),
        },
        {
          headers: {
            businessId: "1",
          },
        }
      );
      console.log("API Response:", response.data);
      setIsLoading(false);
      setFlipped(!flipped);
      setIsJustSignup(true);
    } catch (error) {
      setIsLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          "Error API Response",
          error.response.status,
          ": ",
          error.response.data
        );
        if (error.response.status === 409) {
          alert("อีเมลนี้ลงทะเบียนไปแล้ว! กรุณาใช้อีเมลอื่น");
        }
      } else {
        console.error("Error Making API Request:", error);
      }
    }
  };

  const loginUser = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const fingerprint = result.visitorId;

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email: loginFormData.loginEmail.toLowerCase().trim(),
          password: loginFormData.loginPassword.trim(),
          fingerprint: fingerprint,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "device-fingerprint": "12345678",
            businessId: "1",
          },
          withCredentials: true,
        }
      );
      const { data } = response;
      console.log(data);
      if (data) {
        await login(data.user);
        await checkAuthStatus(); // เพิ่มการเรียก checkAuthStatus หลังจาก login
        navigate("/");
      } else {
        console.log("No token received");
      }
    } catch (error) {
      console.log("Error catch:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setEmailSentText(
            "ต้องตั้งรหัสผ่านก่อนใช้งาน \nกรุณาตรวจสอบอีเมลล์เพื่อทำการตั้งรหัสผ่าน"
          );
          setIsJustSignup(true);
        } else if (error.response.status === 406) {
          setEmailSentText(
            "อีเมล์นี้ลงทะเบียนไปแล้ว\nแต่ยังไม่ได้ยืนยัน\nกรุณายืนยันในอีเมลล์ก่อน"
          );
          setIsJustSignup(true);
        } else if (error.response.status === 403) {
          setIsJustPasswordWrong(true);
        } else if (error.response.status === 404) {
          // 404 Not Found
          setIsNotRegistered(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function getFingerprint() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    console.log(result.visitorId);
  }

  useEffect(() => {
    if (
      isLoading &&
      document.getElementById("lottie").innerHTML == "" &&
      !isLoadingLottieLoad
    ) {
      setIsLoadingLottieLoad(true);
      Lottie.loadAnimation({
        container: document.getElementById("lottie"),
        animationData: loadingAnimation1,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    if (
      isJustSignup &&
      document.getElementById("emailSentAnimationDIV").innerHTML == "" &&
      !isEmailLottieLoad
    ) {
      setIsEmailLottieLoad(true);
      Lottie.loadAnimation({
        container: document.getElementById("emailSentAnimationDIV"),
        animationData: emailSentAnimation2,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    }
  }, [isJustSignup]);

  return (
    <>
      <div
        style={{
          display: isLoading ? "flex" : "none",
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: "100000000",
          backgroundColor: "rgba(0,0,0,.3)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div id="lottie" style={{ maxWidth: "200px" }} />
      </div>

      <div
        className="container_f"
        style={{ paddingTop: windowSize.width < 800 ? "100px" : "180px" }}
      >
        <div className={`flipper ${flipped ? "flip" : ""}`}>
          <div
            className="back"
            style={{
              width: "min(500px,90%)",
              backgroundColor: "rgba(255,255,255,1)",
              borderRadius: "20px",
              padding: "30px 30px 30px 30px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                overflow: "hidden",
                transition: "all 1s ease",
                maxHeight: isJustSignup ? "400px" : "0px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "0px",
                  top: "0px",
                  width: "40px",
                  height: "40px",
                }}
                onClick={() => {
                  setIsJustSignup(false);
                }}
              >
                <img src={closeIcon} />
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  id="emailSentAnimationDIV"
                  style={{ flex: "1", minWidth: "150px", maxWidth: "150px" }}
                ></div>

                <div
                  style={{
                    flex: "1",
                    minWidth: "200px",
                    fontSize: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    whiteSpace: "pre-line",
                  }}
                >
                  {emailSentText}
                </div>
                <div
                  className="zigzag-divider"
                  style={{
                    backgroundSize: "5% 100%",
                    height: "8px",
                    margin: "10px 0px 10px 0px",
                  }}
                ></div>
              </div>
            </div>

            <form
              key={"loginForm"}
              onSubmit={handleLoginSubmit}
              style={{
                display: "flex",
                justifyContent: "center",
                color: "red",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    fontSize: "30px",
                    padding: "0px 0px 0px 0px",
                    margin: "0px 0px 10px 0px",
                    color: "Black",
                  }}
                >
                  Log in
                </div>
                <GoogleLoginButton />
                <TextField
                  required
                  onChange={handleLoginChange}
                  type="email"
                  name="loginEmail"
                  label="Email"
                  variant="outlined"
                  InputProps={{ style: { borderRadius: "15px" } }}
                />
                <div style={styles.gapText}>{errors.email}</div>
                <TextField
                  required
                  onChange={handleLoginChange}
                  type="password"
                  name="loginPassword"
                  label="Password"
                  variant="outlined"
                  InputProps={{ style: { borderRadius: "15px" } }}
                />
                <div
                  style={{ fontSize: "13.5px", color: "red", height: "24px" }}
                  className="m-1 p-1"
                >
                  {isJustPasswordWrong &&
                    "Incorrect email or password. Please try again."}
                  {isNotRegistered &&
                    "This email is not registered. Please sign up."}
                </div>
                <button className="button1" type="submit">
                  Log in
                </button>
              </div>
            </form>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px",
              }}
            >
              Don’t have an account?{"  "}
              <div onClick={handleClick} style={{ color: "blue" }}>
                {" "}
                &nbsp;Sign up.{" "}
              </div>
            </div>
          </div>

          {/* ******************* Sign up ********************** */}
          <div
            className="front"
            style={{
              width: "min(500px,90%)",
              backgroundColor: "rgba(255,255,255,1)",
              borderRadius: "20px",
              padding: "30px 30px 30px 30px",
            }}
          >
            <form
              key={"signupForm"}
              onSubmit={handleSignupSubmit}
              style={{
                display: "flex",
                justifyContent: "center",
                color: "red",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    fontSize: "30px",
                    padding: "0px 0px 0px 0px",
                    margin: "0px 0px 10px 0px",
                    color: "Black",
                  }}
                >
                  Sign up
                </div>
                <TextField
                  key={"signup1"}
                  required
                  onChange={handleSignupChange}
                  type=""
                  name="signupName"
                  label="Name"
                  variant="outlined"
                  InputProps={{ style: { borderRadius: "15px" } }}
                />
                <div style={styles.gapText}></div>
                <TextField
                  key={"signup2"}
                  required
                  onChange={handleSignupChange}
                  type="email"
                  name="signupEmail"
                  label="Email"
                  variant="outlined"
                  InputProps={{ style: { borderRadius: "15px" } }}
                />
                <div style={styles.gapText}>{errors.email}</div>
                <TextField
                  key={"signup3"}
                  required
                  onChange={handleSignupChange}
                  type="password"
                  name="signupPassword"
                  label="Password"
                  variant="outlined"
                  InputProps={{ style: { borderRadius: "15px" } }}
                />
                <div style={styles.gapText}>{errors.password}</div>
                <TextField
                  key={"signup4"}
                  required
                  onChange={handleSignupChange}
                  type="password"
                  name="signupConfirmPassword"
                  label="Confirm Password"
                  variant="outlined"
                  InputProps={{ style: { borderRadius: "15px" } }}
                />
                <div style={styles.gapText}>{errors.confirmPassword}</div>
                <button className="button1" type="submit">
                  Sign up
                </button>
              </div>
            </form>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "20px",
              }}
            >
              Already have an account?{"  "}
              <div onClick={handleClick} style={{ color: "blue" }}>
                {" "}
                &nbsp;Log in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpForm;
