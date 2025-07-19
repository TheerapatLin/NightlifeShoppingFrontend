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
import useEmblaCarousel from "embla-carousel-react";
import EmblaCarousel from "./EmblaCarousel";
import "./sandbox.css";
import "./embla.css";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");
dayjs.locale("th");
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);

const OPTIONS = {};
const SLIDE_COUNT = 5;
const SLIDES = [
  { id: 1, src: "https://picsum.photos/id/1015/600/300" },
  { id: 2, src: "https://picsum.photos/id/1016/600/300" },
  { id: 3, src: "https://picsum.photos/id/1018/600/300" },
];
const inlineStyles = {
  datePicker: {
    cursor: "pointer",
    fontFamily: "CerFont",
    fontSize: "46px", // กำหนดขนาดฟอนต์
    fontWeight: "600", // กำหนดน้ำหนักฟอนต์
  },
};

const ActivityDetails = () => {
  const today = new Date();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const datePickerRef = useRef(null);
  const containerRef = useRef(null);
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
  const { setAffiliate, user } = useAuth();
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [slots, setSlots] = useState([]);
  const [affiliateDiscountInfo, setAffiliateDiscountInfo] = useState(null);
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  useSyncDayjsLocale();

  useEffect(() => {
    const affiliateRefData = JSON.parse(localStorage.getItem("affiliateRef"));
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
    const ref = searchParams.get("ref");
    if (ref) {
      const existing = JSON.parse(localStorage.getItem("affiliateRef"));

      const now = Date.now();
      const expireInMs = 7 * 24 * 60 * 60 * 1000; // 7 days = 604800000 ms

      if (
        !existing ||
        existing.ref !== ref ||
        (existing.expiresAt && existing.expiresAt < now)
      ) {
        localStorage.setItem(
          "affiliateRef",
          JSON.stringify({
            ref,
            storedAt: now,
            expiresAt: now + expireInMs,
          })
        );
      }

      // ล้างจาก URL
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

  useEffect(() => {
    const fetchActivitySlots = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BASE_API_URL_LOCAL
          }/activity-slot?activityId=${activity._id}`,
          {
            withCredentials: true,
          }
        );
        setActivitySlots(res.data);
      } catch (error) {
        console.error("Error fetching activity slots:", error);
      }
    };

    if (activity?._id) {
      fetchActivitySlots();
    }
  }, [activity]);

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

  const getAvailableDates = (activities) => {
    if (!activities) return [];

    const today = dayjs().startOf("day");
    return activities
      .filter((act) => dayjs(act.activityTime.start).isAfter(today))
      .map((act) => new Date(act.activityTime.start));
  };

  const isAvailableDate = (date, availableDates) => {
    return availableDates.some(
      (availableDate) =>
        dayjs(date).format("YYYY-MM-DD") ===
        dayjs(availableDate).format("YYYY-MM-DD")
    );
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

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/activity/${id}`, {
          withCredentials: true,
        });
        const activityData = response.data.activity;
        if (activityData) {
          console.log("activityData =", response.data);
          setActivity(activityData);
        } else {
          setError("Activity not found");
        }
      } catch (error) {
        console.error("Error fetching the activity details:", error);
        setError(`Error fetching data: ${error.message}`);
      }
    };

    fetchActivityData();
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
      <div className="flex">
        <div
          className="flex items-center rounded-l-lg p-3  cursor-pointer"
          style={{ border: "1px solid black" }}
          onClick={openDatePicker}
          ref={containerRef}
        >
          <div className="flex flex-col w-full">
            <label className="  font-bold text-[12px]">
              {i18n.language === "en" ? "Select Date" : "เลือกวันที่"}
            </label>
            <DatePicker
              ref={datePickerRef}
              selected={startDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              locale="th"
              placeholderText={
                i18n.language === "en" ? "Select Date" : "เลือกวันที่"
              }
              className="cursor-pointer "
              filterDate={filterDate}
              minDate={new Date()}
            />
          </div>
          <FaChevronDown size={16} />
        </div>
        <div
          className="flex items-center rounded-r-lg p-3 w-[150px]"
          style={{ border: "1px solid black" }}
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

              {/* Desktop Layout */}
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
              {/* {isMobile && (
                <>
                  <span
                    className="text-[30px] font-bold mt-[20px] mb-[20px] px-5 text-center"
                    style={{ lineHeight: "30px" }}
                  >
                    {i18n.language === "en"
                      ? `${activity?.nameEn ?? ""}${
                          activity?.minorNameEn?.trim()
                            ? ` (${activity?.minorNameEn ?? ""})`
                            : ""
                        }`
                      : `${activity?.nameTh ?? ""}${
                          activity?.minorNameTh?.trim()
                            ? ` (${activity?.minorNameTh ?? ""})`
                            : ""
                        }`}{" "}
                  </span>
                </>
              )} */}
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
                  <hr className="mx-6 my-2 h-[1px] bg-gray-300 border-none" />
                  <div className="flex items-center gap-4 mx-4">
                    {/* Host Image */}
                    {activity?.hostImage && (
                      <img
                        src={`/img/${activity.hostImage}`}
                        alt="host"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}

                    {/* Host Info */}
                    <div className="flex flex-col">
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
                className="flex justify-between  px-5"
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
                      <hr className="mx-2 my-2 h-[1px] bg-gray-300 border-none" />
                    )}
                    <br />
                    {(i18n.language === "en"
                      ? activity?.descriptionEN
                      : activity?.descriptionTH) && (
                      <div
                        className="text-[14px] text-gray-700 "
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
                            className="py-[24px] px-[16px] flex flex-col rounded-lg"
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

                    {/* 2 */}
                    {/* <div className="flex gap-2 mb-[24px]">
                    <IoShieldCheckmarkSharp size={20} />
                    <div className="  text-[14px] text-qblack">
                      ยืนยันตัวตนแล้ว
                    </div>
                  </div> */}
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
                    {/* <div className="flex flex-col md:flex-row gap-10 items-center mt-[32px]">
                    <button
                      className="w-full py-[13px] px-[23px] rounded-lg   text-[16px] font-bold"
                      style={{
                        border: "solid 2px black",
                        background: "transparent",
                      }}
                    >
                      ติดต่อผู้จัดการกิจกรรม
                    </button>

                    <div className="flex gap-5 items-center">
                      <GiCheckedShield size={28} />
                      <div className="  text-[13px]">
                        เพื่อความปลอดภัย
                        อย่าโอนเงินหรือติดต่อสื่อสารผ่านช่องทางอื่นที่ไม่ใช่เว็บไซต์หรือแอพ
                        Airbnb{" "}
                        <span className="font-bold underline">
                          ดูข้อมูลเพิ่มเติม
                        </span>
                      </div>
                    </div>
                  </div> */}
                  </div>
                </div>

                {/* ข้อมูลส่วนหลัง พื้นที่ 40 % */}
                <div className="hidden md:flex h-auto w-full lg:w-[40%] justify-end relative">
                  <div
                    className="flex flex-col p-[24px] mt-[48px] stickySize rounded-lg mb-16 shadow-xl h-auto"
                    style={{
                      border: "solid 1px #dddddd",
                      top: "100px",
                      position: "sticky",
                    }}
                  >
                    {/* ราคา */}
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
                        className="py-[10px] px-[20px] rounded-lg   
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
                  <div className="  font-bold text-[22px]">
                    {i18n.language === "en"
                      ? "Where you'll be"
                      : "สถานที่จัดกิจกรรม"}
                  </div>
                  <div className="  text-[16px] text-qblack">
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
                <div className="fixed bottom-4 inset-x-4 z-[9999]">
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
              borderRadius: "12px",
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
    </>
  );
};

export default ActivityDetails;
