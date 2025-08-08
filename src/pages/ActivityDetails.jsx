//ActivityDetails.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/th";
import {
  IoShareOutline,
  IoShieldCheckmarkSharp,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoClose,
} from "react-icons/io5";
import { FaMapMarkedAlt, FaChevronDown } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import "../public/css/ActivityDetails.css";
import "../public/css/SmallCalendar.css";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import Footer from "../components/Footer";
import { FaMapMarkerAlt } from "react-icons/fa";
import useSyncDayjsLocale from "../components/useSyncDayjsLocale";
import EmblaCarousel from "./EmblaCarousel";
import "./sandbox.css";
import "./embla.css";
import ReactModal from "react-modal";
import Lottie from "lottie-web";
import loadingAnimation1 from "../public/lottie/diamond.json"; // ใช้ตัวเดียวกับหน้า SignUp ก็ได้

ReactModal.setAppElement("#root");
dayjs.locale("th");
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

import { forwardRef } from "react";
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="cursor-pointer w-full min-w-[140px] flex items-center justify-between"
    style={{
      border: "1px solid #ccc",
      padding: "10px 12px",
      borderRadius: "8px",
      backgroundColor: "#fff",
      fontSize: "16px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      fontWeight: "bold",
      textOverflow: "ellipsis",
    }}
  >
    <span>{value || "-"}</span>
    <FaChevronDown size={14} />
  </div>
));

const ActivityDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { adults: initialAdults, children: initialChildren } =
    location.state || {};
  const [adults, setAdults] = useState(() => {
    const savedAdults = localStorage.getItem("adults");
    return savedAdults ? parseInt(savedAdults, 10) : initialAdults || 1;
  });
  const [children, setChildren] = useState(() => {
    const savedChildren = localStorage.getItem("children");
    return savedChildren ? parseInt(savedChildren, 10) : initialChildren || 0;
  });
  const [searchParams] = useSearchParams();
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [affiliateDiscountInfo, setAffiliateDiscountInfo] = useState(null);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  useSyncDayjsLocale();

  useEffect(() => {
    const affiliateRefData = JSON.parse(sessionStorage.getItem("affiliateRef"));
    const ref = affiliateRefData?.ref;

    if (!ref || !activity?._id) return;

    axios
      .get(`${BASE_URL}/accounts/affiliate-discount`, {
        params: {
          affiliateCode: ref,
          activityId: activity._id,
        },
      })
      .then((res) => {
        setAffiliateDiscountInfo(res.data);
      })
      .catch((err) => {
        console.warn("No affiliate discount found", err);
        setAffiliateDiscountInfo(null);
      });
  }, [activity]);

  useEffect(() => {
    const bc = new BroadcastChannel("affiliate_channel");

    // ฟังเมื่อมี tab ใหม่ขอ sync ref
    bc.onmessage = (event) => {
      if (event.data.type === "requestRef") {
        const existing = sessionStorage.getItem("affiliateRef");
        if (existing) {
          bc.postMessage({
            type: "syncRef",
            ...JSON.parse(existing),
          });
        }
      }

      if (event.data.type === "syncRef") {
        const { ref, storedAt, expiresAt } = event.data;
        const existing = JSON.parse(sessionStorage.getItem("affiliateRef"));
        if (!existing || existing.ref !== ref) {
          sessionStorage.setItem(
            "affiliateRef",
            JSON.stringify({ ref, storedAt, expiresAt })
          );
        }
      }
    };

    // ขอ ref ถ้า tab นี้ไม่มี
    const current = sessionStorage.getItem("affiliateRef");
    if (!current) {
      bc.postMessage({ type: "requestRef" });
    }

    return () => {
      bc.close();
    };
  }, []);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      const now = Date.now();
      const expireInMs = 7 * 24 * 60 * 60 * 1000;

      // เก็บเฉพาะใน sessionStorage
      sessionStorage.setItem(
        "affiliateRef",
        JSON.stringify({
          ref,
          storedAt: now,
          expiresAt: now + expireInMs,
        })
      );

      // ส่งไปยัง tab อื่น
      const bc = new BroadcastChannel("affiliate_channel");
      bc.postMessage({
        type: "syncRef",
        ref,
        storedAt: now,
        expiresAt: now + expireInMs,
      });
      bc.close();

      navigate(window.location.pathname, { replace: true });
    }
  }, [searchParams]);

  // หาวันที่มีรอบ >= วันนี้
  useEffect(() => {
    if (!activity?.schedule) return;

    const today = dayjs().startOf("day");
    // หา slot ที่มากกว่า "วันนี้" จริง ๆ
    const futureSlots = activity.schedule
      .filter((slot) => dayjs(slot.startTime).isAfter(today))
      .sort(
        (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
      );

    if (futureSlots.length > 0) {
      setStartDate(dayjs(futureSlots[0].startTime).toDate());
    } else {
      setStartDate(null);
    }
  }, [activity]);

  const [activitySlots, setActivitySlots] = useState([]);

  const handlePaymentNavigation = (
    activityId,
    scheduleId,
    adults,
    children,
    cost,
    startDate
  ) => {
    const codeTimestamp = localStorage.getItem("discountCodeTimestamp");
    if (codeTimestamp) {
      const now = Date.now();
      const elapsed = now - parseInt(codeTimestamp, 10);
      if (elapsed > 10 * 60 * 1000) {
        // ลบโค้ดที่เก็บไว้นานเกิน 10 นาที
        localStorage.removeItem("appliedDiscountCode");
        localStorage.removeItem("discountCodeTimestamp");
      }
    } else {
      localStorage.removeItem("appliedDiscountCode");
      localStorage.removeItem("discountCodeTimestamp");
    }
    localStorage.removeItem("appliedDiscountCode");
    localStorage.removeItem("discountCodeTimestamp");

    //alert(`startDate : ${startDate}`);
    const paymentState = {
      activityId,
      scheduleId,
      adults,
      children,
      cost,
      startDate,
    };
    //localStorage.setItem("paymentState", JSON.stringify(paymentState));
    navigate("/payment/checkout", {
      state: paymentState,
    });
  };

  useEffect(() => {
    if (initialAdults !== undefined) {
      setAdults(initialAdults);
      localStorage.setItem("adults", initialAdults);
    }
    if (initialChildren !== undefined) {
      setChildren(initialChildren);
      localStorage.setItem("children", initialChildren);
    }
  }, [initialAdults, initialChildren]);

  useEffect(() => {
    if (activity && activity?.schedule) {
      setFilteredSchedules([]);
    }
  }, [activity]);

  // Mobile check
  useEffect(() => {
    localStorage.removeItem("client_secret");
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      isLoading &&
      document.getElementById("lottieActivity")?.innerHTML === ""
    ) {
      Lottie.loadAnimation({
        container: document.getElementById("lottieActivity"),
        animationData: loadingAnimation1,
        renderer: "svg",
        loop: true,
        autoplay: true,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    const fetchActivityAndSlots = async () => {
      try {
        const [activityRes, slotRes] = await Promise.all([
          axios.get(`${BASE_URL}/activity/${id}`, {
            withCredentials: true,
          }),
          axios.get(`${BASE_URL}/activity-slot?activityId=${id}`, {
            withCredentials: true,
          }),
        ]);

        const activityData = activityRes.data.activity;
        const slotsData = slotRes.data;

        if (activityData) {
          setActivity(activityData);
          setActivitySlots(slotsData);
        } else {
          setError("Activity not found");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching activity or slots:", error);
        setError(`Error fetching data: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchActivityAndSlots();
  }, [id]);

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const ActivityList = ({
    activity,
    startDate,
    schedules,
    handlePaymentNavigation,
    formatTime,
    adults,
    children,
  }) => {
    const { i18n } = useTranslation();

    const filteredSchedules = useMemo(() => {
      if (!schedules || !startDate || !activity?._id) return [];

      return schedules.filter((schedule) => {
        const scheduleDate = dayjs.utc(schedule.startTime).format("YYYY-MM-DD");
        const selectedDate = dayjs.utc(startDate).format("YYYY-MM-DD"); // ✅ แก้ตรงนี้

        const isSameDate = scheduleDate === selectedDate;

        const isSameActivity =
          schedule.activityId?._id === activity._id ||
          schedule.activityId === activity._id;

        return isSameDate && isSameActivity;
      });
    }, [schedules, startDate, activity]);

    if (!filteredSchedules.length) {
      return (
        <div className="flex flex-col h-[300px] items-center justify-center text-gray-500">
          {i18n.language === "en"
            ? "No activity schedules for the selected date"
            : "ไม่มีตารางกิจกรรมในวันที่เลือก"}
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[300px] overflow-y-auto">
        {filteredSchedules.map((schedule, index) => {
          const participantLimit = schedule.participantLimit || 0;

          // ✅ นับจำนวนคนจริงจากผู้เข้าร่วมทั้งหมด
          const participantsCount =
            schedule.participants?.reduce((total, p) => {
              const adults = p.adults || 0;
              const children = p.children || 0;
              return total + adults + children;
            }, 0) || 0;

          const spotsLeft = participantLimit - participantsCount;

          // ✅ Determine availability status
          const isSoldOut = spotsLeft <= 0;

          return (
            <div
              key={schedule._id}
              className="flex justify-between py-[15px]"
              style={{ maxHeight: "100px", borderBottom: "solid 1px #dddddd" }}
            >
              <div className="flex flex-col">
                <div className="  text-[12px] font-bold">
                  {i18n.language === "en" ? "Session " : "รอบที่ "}
                  {index + 1}
                </div>
                <div className="text-[18px] font-medium">
                  {formatTime(schedule.startTime)} -{" "}
                  {formatTime(schedule.endTime)}
                </div>

                <div className="  text-[12px] text-gray-500 mt-1">
                  {isSoldOut
                    ? i18n.language === "en"
                      ? "Sold out"
                      : "เต็มแล้ว"
                    : i18n.language === "en"
                    ? `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`
                    : `เหลืออีก ${spotsLeft} ที่`}
                </div>
              </div>

              <div className="flex flex-col items-end mr-2">
                <div className="text-right text-[14px] font-bold">
                  {affiliateDiscountInfo?.customerDiscount > 0 ? (
                    <>
                      <span className=" text-lime-600 font-extrabold text-[20px] leading-none">
                        ฿
                        {(
                          schedule.cost - affiliateDiscountInfo.customerDiscount
                        ).toLocaleString()}
                      </span>{" "}
                      / {i18n.language === "en" ? "person" : "คน"}
                      <div className="text-[12.5px] text-gray-500  leading-none">
                        {i18n.language === "en"
                          ? "regular price"
                          : "จากราคาปกติ"}{" "}
                        <span className="line-through">
                          ฿{schedule.cost.toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : schedule.cost === 0 ? (
                    <>{i18n.language === "en" ? "Free" : "ฟรี"}</>
                  ) : (
                    <>
                      ฿{schedule.cost.toLocaleString()} /{" "}
                      {i18n.language === "en" ? "person" : "คน"}
                    </>
                  )}
                </div>

                <button
                  className={`buttonSelectDate ${
                    isSoldOut ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (!isSoldOut) {
                      handlePaymentNavigation(
                        activity._id,
                        schedule._id,
                        adults,
                        children,
                        schedule.cost,
                        startDate
                      );
                    }
                  }}
                  disabled={isSoldOut}
                >
                  <center>
                    {isSoldOut
                      ? i18n.language === "en"
                        ? "Sold out"
                        : "เต็มแล้ว"
                      : i18n.language === "en"
                      ? "Choose"
                      : "เลือก"}
                  </center>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleSaveParticipants = (adults, children) => {
    setAdults(adults);
    setChildren(children);
    localStorage.setItem("adults", adults);
    localStorage.setItem("children", children);
  };

  const ParticipantDropdown = ({ onSave }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tempAdults, setTempAdults] = useState(adults);
    const [tempChildren, setTempChildren] = useState(children);

    const toggleDropdown = () => {
      setIsDropdownOpen((prev) => !prev);
    };

    const handleIncrease = (type) => {
      if (type === "adult") setTempAdults((prev) => prev + 1);
      if (type === "child") setTempChildren((prev) => prev + 1);
    };

    const handleDecrease = (type) => {
      if (type === "adult" && tempAdults > 1) setTempAdults((prev) => prev - 1); // ตรวจสอบว่า tempAdults มากกว่า 1 หรือไม่
      if (type === "child" && tempChildren > 0)
        setTempChildren((prev) => prev - 1);
    };

    const handleSave = () => {
      onSave(tempAdults, tempChildren);
      setIsDropdownOpen(false);
    };

    return (
      <div className="relative">
        {/* Main div */}
        <div
          className="flex items-center rounded-lg p-3 wSize cursor-pointer border"
          onClick={toggleDropdown}
        >
          <div className="flex flex-col w-full">
            <label className="font-bold text-sm">
              {i18n.language === "en" ? "Guests" : "ผู้เข้าร่วม"}
            </label>
            <label className="text-sm">
              {i18n.language === "en"
                ? `${adults + children} guest${
                    adults + children > 1 ? "s" : ""
                  }`
                : `จำนวน ${adults + children} คน`}
            </label>
          </div>
          <FaChevronDown size={16} />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            className="absolute -left-10 bg-white border rounded-lg p-4 mt-2 shadow-lg"
            style={{
              width: "200px",
              border: "solid 1px black",
              zIndex: "19999",
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">
                {i18n.language === "en" ? "Adult" : "ผู้ใหญ่"}
              </span>
              <div className="flex items-center">
                <button
                  className={`px-2 py-1 border rounded-l bg-gray-200 hover:bg-gray-300 ${
                    tempAdults <= 1 ? "cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleDecrease("adult")}
                  disabled={tempAdults <= 1} // ปิดใช้งานปุ่มลบถ้าผู้ใหญ่มีแค่ 1 คน
                >
                  -
                </button>
                <span className="px-3 border-t border-b">{tempAdults}</span>
                <button
                  className="px-2 py-1 border rounded-r bg-gray-200 hover:bg-gray-300"
                  onClick={() => handleIncrease("adult")}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm">
                {i18n.language === "en" ? "Child" : "เด็ก"}
              </span>
              <div className="flex items-center">
                <button
                  className="px-2 py-1 border rounded-l bg-gray-200 hover:bg-gray-300"
                  onClick={() => handleDecrease("child")}
                >
                  -
                </button>
                <span className="px-3 border-t border-b">{tempChildren}</span>
                <button
                  className="px-2 py-1 border rounded-r bg-gray-200 hover:bg-gray-300"
                  onClick={() => handleIncrease("child")}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-950 text-white rounded hover:bg-gray-700"
                onClick={handleSave}
              >
                {i18n.language === "en" ? "Save" : "บันทึก"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const clearDate = () => {
    setStartDate(null);
  };

  const CalendarComponent = ({ schedules, startDate, setStartDate }) => {
    const { i18n } = useTranslation();
    const containerRef = useRef(null);
    const datePickerRef = useRef(null);

    // เช็คว่ามีรอบในอนาคตหรือไม่
    const futureSchedules = useMemo(() => {
      const today = dayjs().startOf("day");
      return (
        schedules?.filter((slot) =>
          dayjs(slot.startTime).isSameOrAfter(today)
        ) || []
      );
    }, [schedules]);

    useEffect(() => {
      if (futureSchedules.length > 0 && !startDate) {
        const firstFutureSlot = futureSchedules.sort(
          (a, b) => dayjs(a.startTime) - dayjs(b.startTime)
        )[0];
        setStartDate(dayjs(firstFutureSlot.startTime).toDate());
      }
    }, [futureSchedules, startDate, setStartDate]);

    const filterDate = (date) => {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      return futureSchedules.some((slot) => {
        const slotDate = dayjs(slot.startTime).format("YYYY-MM-DD");
        return slotDate === formattedDate;
      });
    };

    const handleDateChange = (date) => {
      setStartDate(date);
    };

    const openDatePicker = () => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      if (datePickerRef.current) {
        datePickerRef.current.setFocus();
      }
    };

    if (!futureSchedules.length) {
      return (
        <div className="text-center text-gray-500 font-semibold mt-4">
          {i18n.language === "en"
            ? `⚠️ No activity slots are available.`
            : `⚠️ ไม่มีรอบกิจกรรมเปิดอยู่ในขณะนี้`}
        </div>
      );
    }

    return (
      <div
        className="flex rounded-[20px]"
        style={{ border: "2px solid lightgrey" }}
      >
        <div
          className="flex items-center rounded-l-[20px] p-3  cursor-pointer"
          // style={{ border: "2px solid lightgrey" }}
          onClick={openDatePicker}
          ref={containerRef}
        >
          <div className="flex flex-col w-full">
            <label className="  font-bold text-[12px]">
              {i18n.language === "en" ? "Select Date" : "เลือกวันที่"}
            </label>
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              customInput={<CustomDateInput />}
              dateFormat="dd/MM/yyyy"
              locale="th"
              filterDate={filterDate}
              minDate={new Date()}
              {...(isMobile
                ? {
                    withPortal: true,
                    portalId: "calendar-portal",
                    popperClassName: "datepicker-popper-center",
                  }
                : {
                    // Desktop ปล่อยให้ popup ปกติ
                    popperPlacement: "bottom-start",
                  })}
            />
          </div>
          {/* <FaChevronDown size={16} /> */}
        </div>
        <div class="w-px bg-gray-300 h-full"></div>
        <div
          className="flex items-center rounded-r-[20px] p-3 w-[150px]"
          // style={{ border: "2px solid lightgrey" }}
        >
          <div className="flex flex-col w-full">
            <ParticipantDropdown onSave={handleSaveParticipants} />
          </div>
        </div>
      </div>
    );
  };

  // Desktop Image Grid
  const DesktopImageGrid = () => (
    <div className="grid grid-rows-2 grid-flow-col gap-1 pt-[32px] max-h-[500px]">
      <div className="row-span-2">
        <img
          //src={activity?.image?.[0]?.fileName || ""}
          src={`${activity?.image?.[0].fileName}`}
          alt="images1"
          className="w-full h-full object-cover rounded-l-[30px]"
        />
      </div>

      <>
        <div className="row-span-2">
          <img
            src={`${activity?.image?.[1].fileName}`}
            alt="images2"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <img
            src={`${activity?.image?.[2].fileName}`}
            alt="images3"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <img
            src={`${activity?.image?.[3].fileName}`}
            alt="images4"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="row-span-2">
          <img
            src={`${activity?.image[4].fileName}`}
            alt="images5"
            className="w-full h-full object-cover rounded-r-[30px]"
          />
        </div>
      </>
    </div>
  );
  /* ฟังก์ชันลบ HTML tag */
  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const capitalize = (str) =>
    typeof str === "string" && str.length > 0
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : "";

  return (
    <>
      <div
        className="mt-[0px] md:mt-[20px] flex justify-center"
        style={{ paddingTop: "60px" }}
      >
        <div className="bg-white w-full max-w-7xl rounded-none md:rounded-xl px-0 md:px-10 pb-8 md:py-8">
          {/* {isMobile && (
            <div className="px-10">
              <button
                onClick={handleGoBack}
                className="bg-black flex justify-center rounded-full my-[10px]"
              >
                <IoChevronBackOutline size={20} style={{ color: "white" }} />
              </button>
            </div>
          )} */}

          {isLoading && (
            <div
              className="flex justify-center items-center"
              style={{
                width: "100%",
                height: "70vh",
                backgroundColor: "transparent",
                zIndex: 9999,
              }}
            >
              <div
                id="lottieActivity"
                style={{ width: "300px", height: "300px" }}
              />
            </div>
          )}

          {activity ? (
            <div className="flex flex-col pt-2 ">
              {/* Mobile Layout */}
              {isMobile && activity?.image && (
                <div className="flex flex-col m-3 bg-white shadow rounded-[30px] overflow-hidden">
                  <EmblaCarousel
                    slides={activity.image}
                    options={{ loop: true }}
                  />
                </div>
              )}

              {/* Desktop Main Layout */}
              {!isMobile && (
                <div>
                  <div
                    className="flex flex-col items-center px-6 py-2"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                  >
                    {/* Title */}
                    <span className="text-[40px] font-extrabold leading-tight text-center">
                      {i18n.language === "en"
                        ? activity?.nameEn
                        : activity?.nameTh}
                    </span>

                    {/* Minor name + Divider + Host in a row */}
                    <div className="flex items-center justify-center mt-2 gap-6 w-full">
                      {/* Minor name */}
                      {(i18n.language === "en"
                        ? activity?.minorNameEn?.trim()
                        : activity?.minorNameTh?.trim()) && (
                        <div className="basis-2/3 text-[18px] font-medium text-gray-500 text-center">
                          {i18n.language === "en"
                            ? activity?.minorNameEn
                            : activity?.minorNameTh}
                        </div>
                      )}

                      {/* Divider */}
                      <div className="h-6 w-px bg-gray-300" />

                      {/* Host info */}
                      <div className="basis-1/3 flex items-center gap-3">
                        {activity?.hostImage && (
                          <img
                            src={`/img/${activity.hostImage}`}
                            alt="host"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div className="flex flex-col text-left">
                          <div className="text-[15px] font-semibold text-gray-800">
                            {i18n.language === "en"
                              ? `Hosted by ${
                                  capitalize(
                                    stripHtmlTags(activity?.hostNameEN)
                                  ) || "Petzz"
                                }`
                              : `โฮสต์โดย ${
                                  stripHtmlTags(activity?.hostNameTH) || "เพชรร"
                                }`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DesktopImageGrid />
                </div>
              )}

              {/* Mobile Main Layout */}
              {isMobile && (
                <>
                  {/* บรรทัดหลัก: name */}
                  <span
                    className="text-[30px] font-bold mt-[20px] mb-[10px] px-[50px] text-center"
                    style={{ lineHeight: "30px" }}
                  >
                    {i18n.language === "en"
                      ? activity?.nameEn ?? ""
                      : activity?.nameTh ?? ""}
                  </span>

                  {/* บรรทัดรอง: minor name ถ้ามี */}
                  <div className="px-10">
                    {i18n.language === "en"
                      ? activity?.minorNameEn?.trim() && (
                          <span className="block text-[14px] font-semibold text-center text-gray-500 text-black leading-snug px-4 mt-1 mb-3">
                            {activity.minorNameEn}
                          </span>
                        )
                      : activity?.minorNameTh?.trim() && (
                          <span className="block text-[16px] font-semibold text-center text-gray-500 text-black leading-snug px-4 mt-1 mb-3">
                            {activity.minorNameTh}
                          </span>
                        )}
                  </div>
                  <hr className="mx-[35px] sm:mx-0 my-2 h-[1px] bg-gray-300 border-none" />
                  <div className="mx-[50px] sm:mx-0 flex items-center gap-4 mx-4 ">
                    {/* Host Image */}
                    {activity?.hostImage && (
                      <img
                        src={`/img/${activity.hostImage}`}
                        alt="host"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}

                    {/* Host Info */}
                    <div className="flex flex-col ">
                      <div className="text-[15px] font-semibold text-gray-800">
                        {i18n.language === "en"
                          ? `Hosted by ${
                              capitalize(stripHtmlTags(activity?.hostNameEN)) ||
                              "Petz"
                            }`
                          : `โฮสต์โดย ${
                              stripHtmlTags(activity?.hostNameTH) || "เพชร"
                            }`}
                      </div>
                      <div className="text-[13px] text-gray-500 leading-snug">
                        {i18n.language === "en"
                          ? "Nightlife expert who travel the world"
                          : "ผู้เชี่ยวชาญเรื่องไนท์ไลฟ์ ที่เดินทางไปทั่วโลก"}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div
                style={{ width: "200px" }}
                //className="-mx-4 sm:mx-0 w-screen max-w-none"
              ></div>

              {/* แบ่งเป็นสอง div */}
              <div
                className="mx-[10px] sm:mx-0 flex justify-between  px-5"
                style={{ borderBottom: "solid 1px #dddddd", color: "black" }}
              >
                {/* ข้อมูลส่วนหน้าพื้นที่ 60 % */}
                <div className="h-auto w-full lg:w-[60%]" style={{}}>
                  <div
                    className="pb-[48px]"
                    style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    {/* Host Image */}
                    <div className="flex items-center gap-4">
                      {/* Host Image */}
                    </div>
                    {isMobile && (
                      <hr className="mx-2 mt-2  h-[1px] bg-gray-300 border-none" />
                    )}
                    <br />
                    {(i18n.language === "en"
                      ? activity?.descriptionEN
                      : activity?.descriptionTH) && (
                      <div
                        className="text-[14px] mt-2 sm:mt-[40px]  text-gray-700 "
                        dangerouslySetInnerHTML={{
                          __html:
                            i18n.language === "en"
                              ? activity?.descriptionEN
                              : activity?.descriptionTH,
                        }}
                      />
                    )}
                  </div>

                  <div
                    className="py-[48px]"
                    style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    <div className="  text-[22px] font-bold pb-[24px]">
                      {i18n.language === "en"
                        ? "⭐️ What's Included ⭐️"
                        : "⭐️ สิ่งที่รวมอยู่ในกิจกรรม ⭐️"}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {activity &&
                        activity.included.map((item) => (
                          <div
                            key={item.id}
                            className="py-[24px] px-[16px] flex flex-col rounded-[30px] shadow-lg"
                            style={{
                              border: "solid 1px #dddddd",
                              flex: "1 1 calc(25% - 16px)",
                              boxSizing: "border-box",
                            }}
                          >
                            <img
                              src={`/img/icon/${item.icon}`}
                              alt={item.headerEN}
                              width="80"
                            />
                            <div className="  text-[18px] font-bold mb-2">
                              {i18n.language === "en"
                                ? item.headerEN
                                : item.headerTH}
                            </div>
                            <div className="  text-[14px] text-qblack mb-2 leading-5">
                              {i18n.language === "en"
                                ? item.detailEN
                                : item.detailTH}
                            </div>
                          </div>
                        ))}
                      <style jsx>{`
                        @media (max-width: 768px) {
                          .flex > div {
                            flex: 1 1 100%;
                          }
                        }
                      `}</style>
                    </div>
                  </div>

                  <div
                    className="py-[60px]"
                    style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    {/* 1 */}
                    <div className="flex flex-row gap-4 mb-[24px]">
                      {activity && activity.hostImage && (
                        <img
                          src={`/img/${activity.hostImage}`}
                          alt="Profile picture"
                          className="w-24 h-24 rounded-full"
                        />
                      )}
                      <div className="flex flex-col">
                        <div className="  text-[24px] font-bold">
                          {i18n.language === "en" ? (
                            <div
                              className="  text-[22px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostHeaderEN,
                              }}
                            />
                          ) : (
                            <div
                              className="  text-[22px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostHeaderTH,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      {activity &&
                        activity.descriptionTH &&
                        (i18n.language === "en" ? (
                          <>
                            <div
                              className="  text-[16px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostEN.join("<br/>"),
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="  text-[16px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostTH.join("<br/>"),
                              }}
                            />
                          </>
                        ))}
                    </div>
                    <a
                      href="https://www.instagram.com/_u/nightlife.run/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-sm mt-3 font-medium text-gray-800 bg-gray-100 px-6 py-2 rounded-xl hover:bg-gray-200 transition"
                    >
                      Message Host
                    </a>
                  </div>
                </div>

                {/* กล่องตารางกิจกรรม % */}
                <div className="hidden md:flex h-auto w-full lg:w-[40%] justify-end ">
                  <div
                    className="flex flex-col p-6 mt-12 mb-16 h-auto rounded-[30px] stickySize shadow-xl border border-[#dddddd]"
                    style={{ position: "sticky", top: "100px" }}
                  >
                    <div className="font-bold text-[22px] leading-tight">
                      {affiliateDiscountInfo?.customerDiscount > 0 ? (
                        <span>
                          {i18n.language === "en"
                            ? `start at ฿${activity?.cost.toLocaleString()} / person`
                            : `เริ่มต้น ฿${activity?.cost.toLocaleString()} / คน`}
                        </span>
                      ) : (
                        <span>
                          {i18n.language === "en"
                            ? `start at ฿${activity?.cost.toLocaleString()} / person`
                            : `เริ่มต้น ฿${activity?.cost.toLocaleString()} / คน`}
                        </span>
                      )}
                    </div>

                    {/* วันที่ */}
                    <div className="flex justify-center mt-[24px] mb-[0px] lg:mb-[10px]">
                      <CalendarComponent
                        schedules={activitySlots}
                        startDate={startDate}
                        setStartDate={setStartDate}
                      />
                    </div>

                    {/* Activities container with fixed height and scrollable */}
                    <div className="flex flex-col h-[350px]">
                      <ActivityList
                        activity={activity}
                        startDate={startDate}
                        schedules={activitySlots} // ✅ ใช้ slot ที่ดึงจาก backend
                        handlePaymentNavigation={handlePaymentNavigation}
                        formatTime={formatTime}
                        adults={adults}
                        children={children}
                      />
                    </div>

                    {/* Show more button - always at bottom */}
                    <div className="">
                      <button
                        className="py-[10px] px-[20px] rounded-[20px]   
                      text-[16px] font-bold w-full bg-transparent hover:bg-slate-100"
                        style={{
                          border: "solid 1px gray",
                        }}
                        onClick={clearDate}
                        disabled={true}
                      >
                        {i18n.language === "en" ? "Clear Date" : "ล้างวันที่"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* where you will be */}
              {activity._id !== "6787dd2b5e47d804bdc6b012" && (
                <div
                  className="py-[48px] flex flex-col gap-6"
                  style={{ borderBottom: "solid 1px #dddddd" }}
                >
                  <div className="  font-bold text-[22px] pl-[20px]">
                    {i18n.language === "en"
                      ? "Where you'll be"
                      : "สถานที่จัดกิจกรรม"}
                  </div>
                  <div className="  text-[16px] text-qblack pl-[20px]">
                    <b>
                      <big>
                        {i18n.language === "en"
                          ? activity?.location?.nameEn
                          : activity?.location?.nameTh}
                      </big>
                    </b>
                    {i18n.language === "en" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activity?.location?.addressEn?.join("<br/>"),
                        }}
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activity?.location?.addressTh?.join("<br/>"),
                        }}
                      />
                    )}
                    <a
                      href={activity?.location?.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center mt-2 text-blue-500"
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      {i18n.language === "en"
                        ? "View on Google Maps"
                        : "ดูบน Google Maps"}
                    </a>
                  </div>
                </div>
              )}

              {/* Our first meeting point */}
              {activity._id == "6787dd2b5e47d804bdc6b012" && (
                <div
                  className="py-[48px] px-[20px] flex flex-col gap-6"
                  style={{ borderBottom: "solid 1px #dddddd" }}
                >
                  <div className="  font-bold text-[22px]">
                    {i18n.language === "en"
                      ? "Our first meeting point :"
                      : "สถานที่นัดพบ : "}
                  </div>
                  <div className="text-md leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span>📍</span>
                      <div>
                        <div>
                          <b>Weekdays :</b> Bangkok Heightz Rooftop (Restaurant
                          & Bar 39th floor)
                        </div>
                        <a
                          href="https://maps.app.goo.gl/ALTh3gDcW5w9YmPB7"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Maps
                        </a>
                      </div>
                    </div>

                    <div className="h-4" />

                    <div className="flex items-start gap-2">
                      <span>📍</span>
                      <div>
                        <div>
                          <b>Friday & Saturday :</b> The Speakeasy Rooftop Bar
                          Bangkok (29th floor)
                        </div>
                        <a
                          href="https://maps.app.goo.gl/uvdCGyUo6QjppMaaA"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Floating Book Button บน mobile */}
              {isMobile && activity && (
                <div className="bottom-4 inset-x-4 z-[9999] fixed">
                  <div className="flex items-center justify-between pl-[20px] px-4 py-3 bg-white rounded-full gap-4 w-full shadow-[0_3px_20px_rgba(0,0,0,0.75)] border border-gray-800">
                    {/* ซ้าย: ราคา + ยกเลิกฟรี */}
                    <div className="flex flex-col">
                      {/* บรรทัดแสดงราคาหลัก */}
                      <div className="text-lg text-gray-500 leading-none">
                        {i18n.language === "en" ? "From" : "เริ่มต้นที่"}{" "}
                        <span
                          className={`text-xl font-bold inline-block leading-none relative ${
                            affiliateDiscountInfo?.customerDiscount > 0
                              ? "text-lime-600"
                              : "text-black"
                          }`}
                        >
                          ฿
                          {(
                            activity.cost -
                            (affiliateDiscountInfo?.customerDiscount || 0)
                          ).toLocaleString()}
                        </span>{" "}
                        <span className="text-sm text-gray-500 font-normal">
                          / {i18n.language === "en" ? "person" : "ท่าน"}
                        </span>
                      </div>

                      {/* ถ้ามีส่วนลดให้โชว์ราคาปกติ */}
                      {affiliateDiscountInfo?.customerDiscount > 0 && (
                        <div className="text-[12.5px] text-gray-500 mt-[2px] leading-none pl-[20px]">
                          {i18n.language === "en"
                            ? "Regular price"
                            : "จากราคาปกติ"}{" "}
                          <span className="line-through">
                            ฿{activity.cost?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ปุ่มขวา */}
                    <button
                      className="bg-[#FF385C] hover:bg-[#e62e50] text-white text-base font-bold px-5 py-2 rounded-full whitespace-nowrap"
                      onClick={() => setShowMobileBooking(true)}
                    >
                      {i18n.language === "en" ? "Show Dates" : "แสดงวันที่"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-xl">Loading...</p>
          )}
        </div>
      </div>

      {/* Booking Modal for Mobile */}
      {isMobile && (
        <ReactModal
          isOpen={showMobileBooking}
          onRequestClose={() => setShowMobileBooking(false)}
          contentLabel="Booking"
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 1000,
            },
            content: {
              top: "10%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, 0)",
              width: "90%",
              height: "75%",
              borderRadius: "20px",
              padding: "20px",
              overflow: "auto",
            },
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold">
              {i18n.language === "en" ? "Booking Options" : "ตัวเลือกการจอง"}
            </div>
            <button onClick={() => setShowMobileBooking(false)}>
              <IoClose size={24} />
            </button>
          </div>

          {/* ยกส่วนนี้จาก desktop มาใส่ใน modal ได้เลย */}
          <div className="flex flex-col">
            <div className="font-bold text-[24px] mb-4">
              {i18n.language === "en"
                ? `Start at ฿${activity?.cost} / person`
                : `เริ่มต้น ฿${activity?.cost} / คน`}
            </div>

            <CalendarComponent
              schedules={activitySlots}
              startDate={startDate}
              setStartDate={setStartDate}
            />

            <div className="flex flex-col h-[300px] mt-4">
              <ActivityList
                activity={activity}
                startDate={startDate}
                schedules={activitySlots}
                handlePaymentNavigation={handlePaymentNavigation}
                formatTime={formatTime}
                adults={adults}
                children={children}
              />
            </div>
          </div>
        </ReactModal>
      )}
      <style jsx global>{`
        .datepicker-popper-center {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 9999 !important;
          width: 90vw;
          max-width: 360px;
        }
      `}</style>
    </>
  );
};

export default ActivityDetails;
