import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import TextField from "@mui/material/TextField";
import { useGlobalEvent } from "../context/GlobalEventContext";
import "../public/css/SmallCalendar.css";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import StripeContainer from "./StripeCheckout";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import i18n from "../i18n";

const Checkout = (props) => {
  const { t, i18n } = useTranslation();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const { setPriceDetails } = props.state;
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
  const [dummyState, setDummyState] = useState(0);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [appliedCode, setAppliedCode] = useState(
    () =>
      location.state?.appliedDiscountCode ||
      localStorage.getItem("appliedDiscountCode") ||
      ""
  );

  const [checkingCode, setCheckingCode] = useState(false);

  const [activity, setActivity] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const { windowSize } = useGlobalEvent();
  //const { affiliate } = useAuth();
  const stored = localStorage.getItem("affiliateRef");
  const affiliate = stored ? JSON.parse(stored)?.ref : null;
  const priceDetails = props.state?.priceDetails ||
    location.state?.priceDetails || {
      originalPrice: null,
      discountAmount: 0,
      affiliateDiscountAmount: 0,
      paidAmount: null,
    };
  const [clientSecret, setClientSecret] = useState("");
  var isLoading = false;

  useEffect(() => {
    if (location.state?.mode === "reloadFromLocal") {
      setActivityId(localStorage.getItem("activityId"));
      setScheduleId(localStorage.getItem("scheduleId"));
      setAdults(parseInt(localStorage.getItem("adults")) || 1);
      setChildren(parseInt(localStorage.getItem("children")) || 0);
      setCost(localStorage.getItem("cost"));
      setStartDate(localStorage.getItem("startDate"));
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
    // ✅ Clear discount code on entering the page
    localStorage.removeItem("appliedDiscountCode");
    setAppliedCode(""); // clear state
    setDiscount(0); // clear state
  }, []);
  useEffect(() => {
    return () => {
      // ✅ Clear discount code on leaving the page
      localStorage.removeItem("appliedDiscountCode");
    };
  }, []);

  useEffect(() => {
    localStorage.removeItem("client_secret");
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/activity/${activityId}`, {
          withCredentials: true,
        });
        const activityData = response.data;
        if (activityData && activityData.activity) {
          setActivity(activityData.activity);
          if (Array.isArray(activityData.activity.schedule)) {
            const matchedSchedule = activityData.activity.schedule.find(
              (sch) => sch._id === scheduleId
            );
            setSchedule(matchedSchedule);
            //alert(`matchedSchedule : ${JSON.stringify(matchedSchedule)}`);
          } else {
            //alert("Schedule data is not an array");
            console.error("Schedule data is not an array");
          }
          isLoading = false;
        } else {
          console.log("เป็นไรนิ");
        }
      } catch (error) {
        console.error("Error fetching the activity details:", error);
      }
    };

    if (activityId && !isLoading) {
      isLoading = true;
      fetchActivityData();
    }
  }, [activityId]);

  useEffect(() => {
    const fetchScheduleSlot = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/activity-slot?scheduleId=${scheduleId}`,
          { withCredentials: true }
        );

        // ถ้ามีหลาย slot ควร filter เฉพาะที่ตรง activityId ด้วย
        const matchedSlot = res.data.find(
          (slot) =>
            slot.activityId === activityId ||
            slot.activityId?._id === activityId
        );

        if (matchedSlot) {
          setSchedule(matchedSlot);
        } else {
          console.error("❌ No matching slot found for this scheduleId");
        }
      } catch (err) {
        console.error("❌ Error fetching activity slot:", err);
      }
    };

    if (activityId && scheduleId && !schedule) {
      fetchScheduleSlot();
    }
  }, [activityId, scheduleId, schedule]);

  const formatThaiDate = (dateStr) => {
    const thaiMonths = {
      "01": "ม.ค.",
      "02": "ก.พ.",
      "03": "มี.ค.",
      "04": "เม.ย.",
      "05": "พ.ค.",
      "06": "มิ.ย.",
      "07": "ก.ค.",
      "08": "ส.ค.",
      "09": "ก.ย.",
      10: "ต.ค.",
      11: "พ.ย.",
      12: "ธ.ค.",
    };

    const thaiDays = {
      0: "อา",
      1: "จ",
      2: "อ",
      3: "พ",
      4: "พฤ",
      5: "ศ",
      6: "ส",
    };

    const date = new Date(dateStr);
    const day = date.getDate();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const thaiDay = thaiDays[date.getDay()];

    return `${thaiDay}. ${day} ${thaiMonths[month]}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (isoString, language = "th-TH") => {
    const date = new Date(isoString);
    return date.toLocaleDateString(language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => {
    navigate(`/activityDetails/${activityId}`, {
      state: {
        activityId,
        scheduleId,
        adults,
        children,
        cost,
        startDate,
      },
    });
  };

  const handleUseCode = async () => {
    if (!enteredCode) return;
    setCheckingCode(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/discount-code/validate`,
        { code: enteredCode },
        {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        }
      );

      if (res.data.valid) {
        setAppliedCode(enteredCode);
        localStorage.setItem("appliedDiscountCode", enteredCode);
        setCodeModalOpen(false);
        setEnteredCode("");
        setDiscount(res.data.discountValue);
        alert("✅ Code applied successfully!");

        // ✅ Call create-payment-intent again
        await refreshPaymentIntent();
      } else {
        const message =
          res.data.message || "❌ Invalid code. Please try again.";
        alert(`❌ ${message}`);
      }
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "❌ Error validating code. Please try again.";
      alert(`❌ ${message}`);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleRemoveCode = async () => {
    setAppliedCode("");
    setDiscount(0);
    localStorage.removeItem("appliedDiscountCode");

    await refreshPaymentIntent();
  };

  const refreshPaymentIntent = async () => {
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
            appliedDiscountCode: appliedCode || enteredCode,
            previousPaymentIntentId, // ✅ ส่งไป backend
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh payment intent");
      }

      const data = await response.json();

      priceDetails.originalPrice = data.originalPrice;
      priceDetails.discountAmount = data.discountAmount;
      priceDetails.affiliateDiscountAmount = data.affiliateDiscountAmount;
      priceDetails.paidAmount = data.paidAmount;

      setPriceDetails({
        originalPrice: data.originalPrice,
        discountAmount: data.discountAmount,
        affiliateDiscountAmount: data.affiliateDiscountAmount,
        paidAmount: data.paidAmount,
      });

      props.state.setClientSecret(data.clientSecret);

      if (data.paymentIntentId) {
        localStorage.setItem("paymentIntentId", data.paymentIntentId);
      }

      return data.clientSecret;
    } catch (error) {
      console.error("Error refreshing payment intent:", error);
    }
  };

  const renderPriceDetails = () => (
    <>
      <div className="flex flex-col">
        <span className="font-CerFont font-medium text-[22px]">
          {i18n.language === "th" ? "รายละเอียดราคา" : "Price Details"}
        </span>
        <div className="pt-3 w-full space-y-2">
          <div className="flex justify-between">
            <div className="font-CerFont text-[16px]">
              {i18n.language === "th" ? "ราคาก่อนส่วนลด" : "Original Price"}
            </div>
            <div className="font-CerFont text-[16px]">
              {priceDetails.originalPrice != null
                ? formatCurrency(priceDetails.originalPrice)
                : formatCurrency(0)}
            </div>
          </div>

          {priceDetails.discountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <div className="font-CerFont text-[16px]">
                {i18n.language === "th" ? "ส่วนลดโค้ด" : "Discount Code"}
              </div>
              <div className="font-CerFont text-[16px]">
                -{formatCurrency(priceDetails.discountAmount)}
              </div>
            </div>
          )}

          {priceDetails.affiliateDiscountAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <div className="font-CerFont text-[16px]">
                {i18n.language === "th"
                  ? "ส่วนลด Affiliate"
                  : "Affiliate Discount"}
              </div>
              <div className="font-CerFont text-[16px]">
                -{formatCurrency(priceDetails.affiliateDiscountAmount)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="py-6 mt-4 border-t border-gray-300">
        <div className="flex justify-between">
          <div className="font-CerFont text-[18px]">
            <b>
              {i18n.language === "th" ? "รวม" : "Total"}{" "}
              <span className="underline font-medium">(THB)</span>
            </b>
          </div>
          <div className="font-CerFont text-[24px]">
            <b>
              {priceDetails.paidAmount != null
                ? formatCurrency(priceDetails.paidAmount)
                : formatCurrency(0)}
            </b>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="font-CerFont font-bold text-[16px]">
          {i18n.language === "th"
            ? "นโยบายยกเลิกการจอง"
            : "Cancellation Policy"}
        </div>
        <div className="font-CerFont text-[14px] font-normal">
          {i18n.language === "th"
            ? "ไม่มีนโยบายให้ยกการจอง โดยเงินที่ชำระมาจะนำไปบริจาคช่วยเหลือสถานที่ที่ไปร่วมกิจกรรมแทน"
            : "There is no cancellation policy. The paid amount will be donated to support the venue of the activity."}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="mt-[0px] md:mt-[80px] flex justify-center">
        <div className="bg-white w-full h-full max-w-7xl rounded-none md:rounded-xl md:px-10 pb-8 md:py-8">
          <div className="sticky top-0 bg-white w-full md:relative flex justify-between md:justify-start items-center p-1">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full flex items-center justify-center bg-transparent"
            >
              <ChevronLeft />
            </button>
            <div className="block md:hidden w-6"></div>
          </div>

          <div className="flex flex-col md:flex-row px-[40px]">
            <div
              className="flex mt-5 gap-5 pb-5 md:hidden"
              style={{ borderBottom: "2px solid #ebebeb" }}
            >
              <div className="max-w-[128px]">
                {/* <img src={activity?.image[0]?.fileName} alt="img1" className="w-full rounded-lg" /> */}
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-CerFont text-lg">{activity?.name}</div>
              </div>
            </div>

            {/* Left Section */}
            <div className="w-full md:w-[55%]">
              <div style={{ borderBottom: "solid 1px #dddddd" }}>
                <span className="flex text-[16px] font-CerFont">
                  {i18n.language === "en" ? "Your Activity" : "กิจกรรมของคุณ"}
                </span>
                <span className="text-[20px] font-bold font-CerFont mb-2">
                  {i18n.language === "en"
                    ? activity?.nameEn ?? ""
                    : activity?.nameTh ?? ""}
                </span>
                <br />
                <br />
                <div className="flex flex-col pb-3">
                  <span className="text-[16px] font-CerFont">
                    {i18n.language === "en" ? "Date & Time" : "วันและเวลา"}
                  </span>
                  <span className="text-[20px] font-bold font-CerFont">
                    {schedule ? (
                      <>
                        {i18n.language === "en"
                          ? formatDate(startDate, "en-US")
                          : formatDate(startDate)}{" "}
                        {isMobile && <br />}({formatTime(schedule.startTime)} -{" "}
                        {formatTime(schedule.endTime)})
                      </>
                    ) : i18n.language === "en" ? (
                      "Loading..."
                    ) : (
                      "กำลังโหลด..."
                    )}
                  </span>
                </div>
                <div className="pb-1">
                  <span className="text-[16px] font-semibold font-CerFont">
                    {i18n.language === "en" ? "Participants" : "ผู้เข้าร่วม"}
                  </span>
                  <div className="text-[20px] font-bold font-CerFont">
                    {i18n.language === "en"
                      ? `${adults} ${
                          adults > 1 ? "adults" : "adult"
                        }, ${children} ${children > 1 ? "children" : "child"}`
                      : `ผู้ใหญ่ ${adults} คน , เด็ก ${children} คน`}
                  </div>
                </div>

                {!appliedCode ? (
                  <button
                    className="mt-3 px-4 py-2 mb-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 active:bg-blue-800 transition duration-150 ease-in-out font-semibold text-sm"
                    onClick={() => setCodeModalOpen(true)}
                  >
                    {i18n.language === "en"
                      ? "+ Enter Discount Code"
                      : "+ ใส่โค้ดส่วนลด"}
                  </button>
                ) : (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-green-700 font-semibold text-sm">
                      {appliedCode}
                    </span>
                    <button
                      onClick={handleRemoveCode}
                      className="text-red-600 underline text-xs"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setCodeModalOpen(true)}
                      className="text-blue-600 underline text-xs"
                    >
                      Change
                    </button>
                  </div>
                )}

                {affiliate && (
                  <div className="text-[14px] font-normal text-gray-600 font-CerFont">
                    {i18n.language === "en"
                      ? `Referral Code: ${affiliate}`
                      : `รหัสผู้แนะนำ: ${affiliate}`}
                  </div>
                )}
              </div>

              <div
                className="py-7"
                style={{ borderBottom: "solid 1px #dddddd" }}
              >
                <div className="flex flex-col">
                  <span className="text-[16px] font-normal font-CerFont">
                    {i18n.language === "en"
                      ? "Important Notice :"
                      : "ข้อควรทราบ :"}
                  </span>
                  <span className="text-[20px] font-normal font-CerFont">
                    {i18n.language === "en"
                      ? "All participants must be at least 20 years old."
                      : "ผู้เข้าร่วมทุกคนต้องมีอายุอย่างน้อย 20 ปี "}
                  </span>
                </div>
              </div>

              {/* Mobile Price Box */}
              {isMobile && (
                <div className="rounded-xl p-6 mt-4 border-[1px] border-gray-300 border-solid  shadow-sm bg-white">
                  {renderPriceDetails()}
                </div>
              )}

              <StripeContainer clientSecret={clientSecret} />
            </div>

            {/* Desktop Price Box */}
            {!isMobile && (
              <div className="hidden md:block w-[45%] ml-16">
                <div className="rounded-xl p-6 border-[1px] border-gray-300 border-solid  shadow-sm bg-white sticky top-[100px]">
                  {renderPriceDetails()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {codeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg relative">
            <button
              onClick={() => setCodeModalOpen(false)}
              className="absolute top-2 right-3 text-gray-600 text-lg"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-3 text-center">
              Enter Discount Code
            </h2>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              className="border rounded p-2 w-full mb-3"
              placeholder="Enter your code"
            />
            <button
              onClick={handleUseCode}
              disabled={checkingCode}
              className={`bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition ${
                checkingCode ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {checkingCode ? "Checking..." : "Use Code"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
