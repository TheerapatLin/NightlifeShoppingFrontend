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
//import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
//import { GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
//import { GoogleLogin } from "react-google-login";
import googleLogo from "../img/google-logo.svg";
import { useTranslation } from "react-i18next";
import { getDeviceFingerprint } from "../lib/fingerprint";

function SignUpForm() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [isJustPasswordWrong, setIsJustPasswordWrong] = useState(false);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isEmailLottieLoad, setIsEmailLottieLoad] = useState(false);
  const [isLoadingLottieLoad, setIsLoadingLottieLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isJustSignup, setIsJustSignup] = useState(false);

  // Oreq Dev
  const [isJustForgotPassword, setIsJustForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);
  const [showLoginContent, setShowLoginContent] = useState(true);


  //-------------------------------------------------------------------------------

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

  function GoogleLoginButton({ BASE_URL }) {
    const googleLogin = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        try {
          const fp = await getDeviceFingerprint();
          
          const result = await fp.get();
          // const fingerprint = result.visitorId;
          
          const res = await axios.post(
            `${BASE_URL}/auth/google-web-login`,
            { token: tokenResponse.access_token },
            {
              headers: {
                "device-fingerprint": fp,
                businessid: "1",
              },
              withCredentials: true,
            }
          );

          const { data } = res.data;
          if (data) {
            //console.log(`data = ${JSON.stringify(data)}`);
            await checkAuthStatus(); // เพิ่มการเรียก checkAuthStatus หลังจาก login
            navigate("/");
          } else {
            console.log("No token received");
          }
        } catch (err) {
          console.error("❌ Google login failed:", err);
        }
      },
      onError: (err) => console.error("Google Login Error", err),
      flow: "implicit",
    });

    return (
      <button
        onClick={() => googleLogin()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "12px",
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <img
          src={googleLogo}
          alt="Google"
          style={{ width: "20px", height: "20px" }}
        />
        <span style={{ color: "#444" }}>Log in with Google</span>
      </button>
    );
  }


  // Oreq Dev
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: forgotEmail.toLowerCase().trim(),
      });
      setForgotMessage("กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน");
      setIsForgotSuccess(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setForgotMessage("ไม่พบอีเมลนี้ในระบบ");
      } else {
        setForgotMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งในภายหลัง");
      }
      setIsForgotSuccess(false);
    }
  };
  //---
  const handleClick = () => {
    if (flipped) {
      setIsJustForgotPassword(false)
      setIsJustSignup(false)
    }
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
       const fp = await getDeviceFingerprint();
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
            "device-fingerprint": fp,
            businessId: "1",
          },
          withCredentials: true,
        }
      );
      const { data } = response.data;
      //alert(JSON.stringify(data));
      //console.log(`data = ${JSON.stringify(data)}`);
      if (data) {
        // await login(data.data.user);
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

  // Oreq Dev useEffect
  useEffect(() => {
    if (!isJustForgotPassword) {
      const timer = setTimeout(() => {
        setShowLoginContent(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // ซ่อน login content ทันทีตอนกดลืมรหัสผ่าน
      setShowLoginContent(false);
    }
  }, [isJustForgotPassword]);

  // ---


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
                transition: "all 0.5s ease",
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

            {/* Oreq Dev Popup */}
            <div
              style={{
                position: "relative",
                width: "100%",
                overflow: "hidden",
                transition: "all 0.5s ease",
                maxHeight: isJustForgotPassword ? "400px" : "0px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "0px",
                  top: "0px",
                  width: "40px",
                  height: "40px",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
                onClick={() => setIsJustForgotPassword(false)}


              >
                <img src={closeIcon} alt="close" style={{ width: "20px", height: "20px" }} />
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  padding: "20px 0 30px 0",
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
                  🔒 {t("auth.forgotpassword")}
                </div>

                <form
                  onSubmit={handleForgotPasswordSubmit}
                  style={{
                    width: "80%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <TextField
                    required
                    label="Enter your email"
                    variant="outlined"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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
                    Send Reset Link
                  </button>
                </form>
                {forgotMessage && (
                  <div
                    style={{
                      marginTop: "15px",
                      color: isForgotSuccess ? "green" : "red",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    {forgotMessage}
                  </div>
                )}
              </div>
            </div>

            {!isJustForgotPassword && showLoginContent && (
            <form
              key={"loginForm"}
              onSubmit={handleLoginSubmit}
              style={{
                display: "flex",
                justifyContent: "center",
                color: "red",
              }}
            >
              {showLoginContent && (
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
                {/* Oreq Dev */}
                  <div style={{ textAlign: "right", marginTop: "8px", marginBottom: "20px" }}>
                    <button
                      type="button"
                      onClick={() => setIsJustForgotPassword(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1976d2",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      {t("auth.forgotpassword")}
                    </button>
                  </div>

                <button className="button1" type="submit">
                  Log in
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "20px 0",
                    color: "#999",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}
                  />
                  <div style={{ padding: "0 10px", whiteSpace: "nowrap" }}>
                    {t("auth.orLoginWith")}
                  </div>
                  <div
                    style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}
                  />
                </div>

                <GoogleLoginButton BASE_URL={BASE_URL} />
              </div>
              )}
            </form>
            )}
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
