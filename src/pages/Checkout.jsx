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

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
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

  const [activity, setActivity] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const { windowSize } = useGlobalEvent();
  const { affiliate } = useAuth();
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

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   if (!stripe || !elements) return;

  //   const cardElement = elements.getElement(CardElement);

  //   const { error, paymentIntent } = await stripe.confirmCardPayment(
  //     clientSecret,
  //     {
  //       payment_method: { card: cardElement },
  //     }
  //   );

  //   if (error) {
  //     console.error(error.message);
  //   } else {
  //     console.log("Payment successful!", paymentIntent);
  //   }
  // };

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

  return (
    <>
      <div className="mt-[0px] md:mt-[80px]  flex justify-center">
        <div className="bg-white w-full h-full max-w-7xl rounded-none md:rounded-xl  md:px-10 pb-8 md:py-8">
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

          {/* แบ่งเป็นสอง */}
          <div className="flex flex-col md:flex-row px-[40px]">
            <div
              className="flex mt-5 gap-5 pb-5 md:hidden"
              style={{ borderBottom: "2px solid #ebebeb" }}
            >
              <div className="max-w-[128px]">
                {/* <img
                  src={activity?.image[0]?.fileName}
                  alt="img1"
                  className="w-full rounded-lg"
                /> */}
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-CerFont text-lg">{activity?.name}</div>
              </div>
            </div>
            {/* ยืนยันและชำระเงิน */}
            <div className="w-full md:w-[55%]">
              <div className="" style={{ borderBottom: "solid 1px #dddddd" }}>
                <span className="flex  text-[16px] font-CerFont">
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
                        {isMobile ? <br /> : <></>}(
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)})
                      </>
                    ) : (
                      "กำลังโหลด..."
                    )}
                  </span>
                </div>
                <div className="pb-7">
                  <span className="text-[16px] font-semibold font-CerFont">
                    {i18n.language === "en" ? "Participants" : "ผู้เข้าร่วม"}
                  </span>
                  <div className="text-[20px] font-bold font-CerFont">
                    {i18n.language === "en"
                      ? `${adults} ${
                          adults > 1 ? "adults" : "adult"
                        } , ${children}  ${children > 1 ? "children" : "child"}`
                      : `ผู้ใหญ่ ${adults} คน , เด็ก ${children} คน`}
                  </div>
                </div>
              </div>
              {/* <div
                className="py-7"
                style={{ borderBottom: "solid 1px #dddddd" }}
              >
                <span className="flex text-[22px] font-semibold font-CerFont">
                  ต้องดำเนินการ
                </span>

                <div className="flex justify-between pt-3 ">
                  <div className="flex flex-col">
                    <span className="text-[16px] font-normal font-CerFont">
                      เบอร์โทร
                    </span>
                    <span className="text-[16px] font-normal font-CerFont">
                      เพิ่มและยืนยันเบอร์โทรเพื่อรับอัพเดท
                    </span>
                  </div>
                  <div>
                    <button
                      className="py-[7px] px-[15px] rounded-lg font-CerFont text-[14px] font-bold bg-transparent hover:bg-slate-100"
                      style={{
                        border: "solid 1px black",
                        width: "auto",
                        maxWidth: "170px",
                      }}
                    >
                      เพิ่ม
                    </button>
                  </div>
                </div>
              </div> */}

              <div
                className="py-7"
                style={{ borderBottom: "solid 1px #dddddd" }}
              >
                <span className="text-[16px] font-normal font-CerFont"></span>

                <div className="flex pt-3 ">
                  <div className="flex flex-col">
                    <span className="text-[16px] font-normal font-CerFont">
                      {i18n.language === "en"
                        ? "Important Notice : "
                        : "ข้อควรทราบ : "}
                    </span>
                    <span className="text-[20px] font-normal font-CerFont">
                      {i18n.language === "en" ? (
                        <>All participants must be at least 4 years old. </>
                      ) : (
                        "ผู้เข้าร่วมทุกคนต้องมีอายุอย่างน้อย 4 ปี "
                      )}
                      <span
                        className="text-[16px] underline  cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                      >
                        ดูข้อมูลเพิ่มเติม
                      </span>
                    </span>
                  </div>
                </div>
                {/* Modal */}
                {isModalOpen && (
                  <div className="fixed top-0 z-50 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                      <span
                        className="cursor-pointer"
                        onClick={() => setIsModalOpen(false)}
                      >
                        X
                      </span>
                      <h2 className="text-lg font-bold mb-4">
                        ข้อมูลเพิ่มเติม
                      </h2>
                      <p className="text-sm text-gray-700">
                        นี่คือข้อมูลเพิ่มเติมเกี่ยวกับคุณสมบัติของผู้เข้าร่วม
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {isMobile && (
                <div className="md:block" style={{ marginBottom: "19px" }}>
                  <div
                    className="rounded-lg p-6"
                    style={{
                      border: "solid 1px #aaaaaa",
                      top: "100px",
                      position: "sticky",
                    }}
                  >
                    <div
                      className={`flex pb-1`}
                      // style={{ borderBottom: "solid 1px #dddddd" }}
                    >
                      <div className="max-w-[128px]">
                        {/* <img
                      src={activity?.image[0]?.fileName}
                      alt="img1"
                      className="w-full rounded-lg"
                    /> */}
                      </div>
                      <div className="flex flex-col pl-4">
                        <span className="font-CerFont">{activity?.name}</span>
                      </div>
                    </div>

                    <div
                      className="py-6"
                      style={{ borderBottom: "solid 1px #dddddd" }}
                    >
                      <div className="flex flex-col">
                        <span className="font-CerFont font-medium text-[22px]">
                          {i18n.language === "th"
                            ? "รายละเอียดราคา"
                            : "Price Details"}
                        </span>
                        <div className="pt-3 w-full">
                          {adults > 0 && children > 0 && (
                            <div className="flex justify-between">
                              <div className="font-CerFont text-[16px] flex flex-col">
                                <div className="font-CerFont text-[16px]">
                                  {formatCurrency(cost)} x {adults}{" "}
                                  {i18n.language === "en"
                                    ? "(adults)"
                                    : "(ผู้ใหญ่)"}
                                </div>
                                <div className="font-CerFont text-[16px]">
                                  {formatCurrency(cost)} x {children}{" "}
                                  {i18n.language === "en"
                                    ? "(children)"
                                    : "(เด็ก)"}
                                </div>
                              </div>
                              <div className="font-CerFont text-[16px]"></div>
                              <div className="font-CerFont text-[16px] flex flex-col">
                                <div className="font-CerFont text-[16px]">
                                  {formatCurrency(cost * adults)}
                                </div>
                                <div className="font-CerFont text-[16px]">
                                  {formatCurrency(cost * children)}
                                </div>
                              </div>
                            </div>
                          )}

                          {adults > 0 && children === 0 && (
                            <div className="flex justify-between">
                              <div className="font-CerFont text-[16px] ">
                                {formatCurrency(cost)} x {adults} (ผู้ใหญ่)
                              </div>
                              <div className="font-CerFont text-[16px] ">
                                {formatCurrency(cost * adults)}
                              </div>
                            </div>
                          )}

                          {children > 0 && adults === 0 && (
                            <div className="flex justify-between">
                              <div className="font-CerFont text-[16px]">
                                {formatCurrency(cost)} x {children} (เด็ก)
                              </div>
                              <div className="font-CerFont text-[16px]">
                                {formatCurrency(cost * children)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className="py-6"
                      style={{ borderBottom: "solid 1px #dddddd" }}
                    >
                      <div className="flex justify-between">
                        <div className="font-CerFont  text-[18px]">
                          <b>
                            {i18n.language === "th" ? "รวม" : "total"}{" "}
                            <span className="underline font-medium">(THB)</span>
                          </b>
                        </div>
                        <div className="font-CerFont text-[18px]">
                          <b>{formatCurrency(cost * (adults + children))}</b>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <div className="font-CerFont font-bold text-[16px]">
                        {i18n.language === "th"
                          ? "นโยบายยกเลิกการจอง"
                          : "Cancellation Policy"}
                      </div>

                      <div className="font-CerFont text-[14px] font-normal ">
                        {i18n.language === "th"
                          ? "ไม่มีนโยบายให้ยกการจอง โดยเงินที่ชำระมาจะนำไปบริจาคช่วยเหลือสถานที่ที่ไปร่วมกิจกรรมแทน"
                          : "There is no cancellation policy. The paid amount will be donated to support the venue of the activity."}
                        {/* <span className="underline font-bold font-CerFont">
                      ดูข้อมูลเพิ่มเติม
                    </span> */}
                      </div>
                    </div>
                  </div>
                  <br />
                  <hr></hr>
                  <br />
                </div>
              )}

              <StripeContainer />

              {/* <div className="py-[32px] text-[13px] font-CerFont font-normal">
                การเลือกปุ่มด้านล่างถือเป็นการยอมรับ
                <span className="underline font-bold">
                  การสละสิทธิ์และยกเว้นความรับผิดของผู้เข้าร่วม
                  นโยบายยกเลิกการจอง นโยบายการคืนเงินให้ผู้เข้าพัก
                </span>{" "}
                และ
                <span className="underline font-bold">
                  คำแนะนำของ Airbnb ว่าด้วยการรักษาระยะห่างระหว่างบุคคลและ
                  COVID-19
                </span>
              </div> */}
            </div>

            {/* 45% */}
            {!isMobile && (
              <div className="hidden md:block w-[45%] ml-16">
                <div
                  className="rounded-lg p-6"
                  style={{
                    border: "solid 1px #aaaaaa",
                    top: "100px",
                    position: "sticky",
                  }}
                >
                  <div
                    className={`flex pb-1`}
                    // style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    <div className="max-w-[128px]">
                      {/* <img
                      src={activity?.image[0]?.fileName}
                      alt="img1"
                      className="w-full rounded-lg"
                    /> */}
                    </div>
                    <div className="flex flex-col pl-4">
                      <span className="font-CerFont">{activity?.name}</span>
                    </div>
                  </div>

                  <div
                    className="py-6"
                    style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    <div className="flex flex-col">
                      <span className="font-CerFont font-medium text-[22px]">
                        {i18n.language === "th"
                          ? "รายละเอียดราคา"
                          : "Price Details"}
                      </span>
                      <div className="pt-3 w-full">
                        {adults > 0 && children > 0 && (
                          <div className="flex justify-between">
                            <div className="font-CerFont text-[16px] flex flex-col">
                              <div className="font-CerFont text-[16px]">
                                {formatCurrency(cost)} x {adults}{" "}
                                {i18n.language === "en"
                                  ? "(adults)"
                                  : "(ผู้ใหญ่)"}
                              </div>
                              <div className="font-CerFont text-[16px]">
                                {formatCurrency(cost)} x {children}{" "}
                                {i18n.language === "en"
                                  ? "(children)"
                                  : "(เด็ก)"}
                              </div>
                            </div>
                            <div className="font-CerFont text-[16px]"></div>
                            <div className="font-CerFont text-[16px] flex flex-col">
                              <div className="font-CerFont text-[16px]">
                                {formatCurrency(cost * adults)}
                              </div>
                              <div className="font-CerFont text-[16px]">
                                {formatCurrency(cost * children)}
                              </div>
                            </div>
                          </div>
                        )}

                        {adults > 0 && children === 0 && (
                          <div className="flex justify-between">
                            <div className="font-CerFont text-[16px] ">
                              {formatCurrency(cost)} x {adults} (ผู้ใหญ่)
                            </div>
                            <div className="font-CerFont text-[16px] ">
                              {formatCurrency(cost * adults)}
                            </div>
                          </div>
                        )}

                        {children > 0 && adults === 0 && (
                          <div className="flex justify-between">
                            <div className="font-CerFont text-[16px]">
                              {formatCurrency(cost)} x {children} (เด็ก)
                            </div>
                            <div className="font-CerFont text-[16px]">
                              {formatCurrency(cost * children)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="py-6"
                    style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    <div className="flex justify-between">
                      <div className="font-CerFont  text-[18px]">
                        <b>
                          {i18n.language === "th" ? "รวม" : "total"}{" "}
                          <span className="underline font-medium">(THB)</span>
                        </b>
                      </div>
                      <div className="font-CerFont text-[18px]">
                        <b>{formatCurrency(cost * (adults + children))}</b>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <div className="font-CerFont font-bold text-[16px]">
                      {i18n.language === "th"
                        ? "นโยบายยกเลิกการจอง"
                        : "Cancellation Policy"}
                    </div>

                    <div className="font-CerFont text-[14px] font-normal ">
                      {i18n.language === "th"
                        ? "ไม่มีนโยบายให้ยกการจอง โดยเงินที่ชำระมาจะนำไปบริจาคช่วยเหลือสถานที่ที่ไปร่วมกิจกรรมแทน"
                        : "There is no cancellation policy. The paid amount will be donated to support the venue of the activity."}
                      {/* <span className="underline font-bold font-CerFont">
                      ดูข้อมูลเพิ่มเติม
                    </span> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
