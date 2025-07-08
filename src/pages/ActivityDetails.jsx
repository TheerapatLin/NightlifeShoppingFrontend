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

  useSyncDayjsLocale();

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

  // ✅ ใส่ตรงนี้
  const availableDates = React.useMemo(() => {
    if (!activity?.schedule) return new Set();

    return new Set(
      activity.schedule.map((slot) =>
        dayjs(slot.startTime).format("YYYY-MM-DD")
      )
    );
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

  const getDayClassNames = (date, availableDates) => {
    const isAvailable = isAvailableDate(date, availableDates);
    return isAvailable ? "available-date" : "unavailable-date";
  };

  const openDatePicker = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    datePickerRef.current.setFocus();
  };

  const filterActivitiesByDate = (activities, selectedDate) => {
    if (!selectedDate || !activities) return activities;

    return activities.filter(
      (act) =>
        dayjs(act.activityTime.start).format("YYYY-MM-DD") ===
        dayjs(selectedDate).format("YYYY-MM-DD")
    );
  };
  // useEffect(() => {
  //   const { activityId, scheduleId, adults, children, cost, startDate } =
  //     location.state || {};
  //   alert("adults = " + adults);
  // }, []);

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

  const handleDateChange = (date) => {
    const utcDate = dayjs(date).utc().format();
    //alert(`Raw date: ${date}`);
    // alert(`Selected UTC date: ${utcDate}`);
    setStartDate(utcDate);
    console.log("Selected UTC date:", utcDate);

    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const filteredSchedules = activity?.schedule?.filter((schedule) => {
      const days = schedule.dayString.toLowerCase().split(",");
      return (
        days.includes("everyday") ||
        days.includes(dayOfWeek) ||
        (days.includes("weekend") &&
          (dayOfWeek === "saturday" || dayOfWeek === "sunday"))
      );
    });

    setFilteredSchedules(filteredSchedules);
  };

  useEffect(() => {
    if (activity && activity?.schedule) {
      setFilteredSchedules([]);
      //alert("activitylastStartDate = " + activity.lastStartDate);
      //setStartDate(activity.lastStartDate);
      //const initialDate = new Date(activity.lastStartDate); // หรือกำหนดวันที่เริ่มต้นที่คุณต้องการ
      //handleDateChange(today);
    }
  }, [activity]);

  // useEffect(() => {
  //   const affiliate = searchParams.get("affiliate");
  //   if (affiliate) {
  //     setAffiliate(affiliate);

  //     navigate(window.location.pathname, { replace: true });
  //   }
  // }, [searchParams, setAffiliate]);

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

  // Image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (activity?.images?.length || 0) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (activity?.images?.length || 0) - 1 ? 0 : prev + 1
    );
  };

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
              style={{ borderBottom: "solid 1px #dddddd" }}
            >
              <div className="flex flex-col">
                <div className="font-CerFont text-[12px] font-bold">
                  {i18n.language === "en" ? "Session " : "รอบที่ "}
                  {index + 1}
                </div>
                <div className="font-CerFont text-[16px]">
                  {formatTime(schedule.startTime)} -{" "}
                  {formatTime(schedule.endTime)}
                </div>

                <div className="font-CerFont text-[12px] text-gray-500 mt-1">
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
                <div className="font-CerFont text-[14px] font-bold">
                  {schedule.cost === 0
                    ? i18n.language === "en"
                      ? "Free"
                      : "ฟรี"
                    : `฿ ${schedule.cost}`}{" "}
                  / {i18n.language === "en" ? "person" : "คน"}
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
                : `ผู้เข้าร่วม ${adults + children} คน`}
            </label>
          </div>
          <FaChevronDown size={16} />
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            className="absolute -left-10 bg-white border rounded-lg p-4 mt-2 shadow-lg"
            style={{ width: "200px", border: "solid 1px black" }}
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

  const isHoliday = (date, holidays) => {
    return holidays.some(
      (holiday) =>
        dayjs(date).format("YYYY-MM-DD") === dayjs(holiday).format("YYYY-MM-DD")
    );
  };

  const everydayFromToday = (date) => {
    return date >= today.setHours(0, 0, 0, 0); // ป้องกันเลือกวันในอดีต
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
          className="flex items-center rounded-l-lg p-3 wSize cursor-pointer"
          style={{ border: "1px solid black" }}
          onClick={openDatePicker}
          ref={containerRef}
        >
          <div className="flex flex-col w-full">
            <label className="font-CerFont font-bold text-[12px]">
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
              className="cursor-pointer font-CerFont"
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
    <div className="grid grid-rows-2 grid-flow-col gap-2 pt-[32px] max-h-[500px]">
      <div className="row-span-2">
        <img
          //src={activity?.image?.[0]?.fileName || ""}
          src={`${activity?.image?.[0].fileName}`}
          alt="images1"
          className="w-full h-full object-cover rounded-l-lg"
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
            className="w-full h-full object-cover rounded-r-lg"
          />
        </div>
      </>
    </div>
  );

  return (
    <>
      <div
        className="mt-[0px] md:mt-[20px] flex justify-center"
        style={{ paddingTop: "60px" }}
      >
        <div className="bg-white w-full max-w-7xl rounded-none md:rounded-xl px-0 md:px-10 pb-8 md:py-8">
          {isMobile && (
            <div className="px-10">
              <button
                onClick={handleGoBack}
                className="bg-black flex justify-center rounded-full my-[10px]"
              >
                <IoChevronBackOutline size={20} style={{ color: "white" }} />
              </button>
            </div>
          )}

          {activity ? (
            <div className="flex flex-col">
              {/* Mobile Layout */}
              {isMobile && (
                <>
                  <span
                    className="text-[26px] font-semibold font-CerFont mb-2  px-5"
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

                  <div className="flex justify-between mb-4 px-10">
                    <a
                      href={activity?.location?.googleMapUrl ?? ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500"
                    >
                      <div className="font-normal font-CerFont underline">
                        <FaMapMarkerAlt className="mr-2" />
                        {i18n.language === "en"
                          ? activity?.location?.nameEn
                          : activity?.location?.nameTh}{" "}
                      </div>
                    </a>

                    {/* <div className="flex gap-2">
                    <div className="flex justify-between items-center gap-1">
                      <IoShareOutline />
                      <div className="font-normal font-CerFont underline">
                        แชร์
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1">
                      <MdFavoriteBorder />
                      <div className="font-normal font-CerFont underline">
                        บันทึก
                      </div>
                    </div>
                  </div> */}
                  </div>
                </>
              )}
              <div
                style={{ width: "200px" }}
                //className="-mx-4 sm:mx-0 w-screen max-w-none"
              ></div>
              {/* <MobileImageCarousel activity={activity} /> */}

              {isMobile && activity?.image && (
                <EmblaCarousel
                  slides={activity.image}
                  options={{ loop: true }}
                />
              )}
              {/* Desktop Layout */}
              {!isMobile && (
                <>
                  <span className="text-[26px] font-semibold font-CerFont mb-2 ">
                    {i18n.language === "en"
                      ? `${activity?.nameEn}${
                          activity?.minorNameEn?.trim()
                            ? ` (${activity?.minorNameEn})`
                            : ""
                        }`
                      : `${activity?.nameTh}${
                          activity?.minorNameTh?.trim()
                            ? ` (${activity?.minorNameTh})`
                            : ""
                        }`}{" "}
                  </span>
                  <span className="text-[20px] font-semibold font-CerFont mb-2"></span>

                  <div className="flex justify-between">
                    <a
                      href={activity?.location?.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500"
                    >
                      <div className="font-normal font-CerFont underline">
                        <FaMapMarkerAlt className="mr-2" />
                        {i18n.language === "en"
                          ? activity?.location?.nameEn
                          : activity?.location?.nameTh}{" "}
                      </div>
                    </a>
                    {/* <div className="flex gap-2">
                    <div className="flex justify-between items-center gap-1">
                      <IoShareOutline />
                      <div className="font-normal font-CerFont underline">
                        {i18n.language === "en" ? "Share" : "แชร์"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-1">
                      <MdFavoriteBorder />
                      <div className="font-normal font-CerFont underline">
                        {i18n.language === "en" ? "Save" : "บันทึก"}
                      </div>
                    </div>
                  </div> */}
                  </div>
                  <DesktopImageGrid />
                </>
              )}

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
                    <br />
                    <div
                      className="font-CerFont text-[16px]"
                      style={{ color: "black" }}
                    >
                      {activity?.descriptionTH &&
                        (i18n.language === "en" ? (
                          <div
                            className="font-CerFont text-[16px]"
                            style={{ color: "black" }}
                            dangerouslySetInnerHTML={{
                              __html: activity?.descriptionEN,
                            }}
                          />
                        ) : (
                          <div
                            className="font-CerFont text-[16px]"
                            style={{ color: "black" }}
                            dangerouslySetInnerHTML={{
                              __html: activity?.descriptionTH,
                            }}
                          />
                        ))}
                    </div>
                  </div>

                  <div
                    className="py-[48px]"
                    style={{ borderBottom: "solid 1px #dddddd" }}
                  >
                    <div className="font-CerFont text-[22px] font-bold pb-[24px]">
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
                            <div className="font-CerFont text-[18px] font-bold mb-2">
                              {i18n.language === "en"
                                ? item.headerEN
                                : item.headerTH}
                            </div>
                            <div className="font-CerFont text-[14px] text-qblack mb-2 leading-5">
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
                        <div className="font-CerFont text-[24px] font-bold">
                          {i18n.language === "en" ? (
                            <div
                              className="font-CerFont text-[22px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostHeaderEN,
                              }}
                            />
                          ) : (
                            <div
                              className="font-CerFont text-[22px]"
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
                    <div className="font-CerFont text-[14px] text-qblack">
                      ยืนยันตัวตนแล้ว
                    </div>
                  </div> */}
                    <div className="flex flex-col">
                      {activity &&
                        activity.descriptionTH &&
                        (i18n.language === "en" ? (
                          <>
                            <div
                              className="font-CerFont text-[16px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostEN.join("<br/>"),
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="font-CerFont text-[16px]"
                              dangerouslySetInnerHTML={{
                                __html: activity?.aboutHostTH.join("<br/>"),
                              }}
                            />
                          </>
                        ))}
                    </div>
                    {/* <div className="flex flex-col md:flex-row gap-10 items-center mt-[32px]">
                    <button
                      className="w-full py-[13px] px-[23px] rounded-lg font-CerFont text-[16px] font-bold"
                      style={{
                        border: "solid 2px black",
                        background: "transparent",
                      }}
                    >
                      ติดต่อผู้จัดการกิจกรรม
                    </button>

                    <div className="flex gap-5 items-center">
                      <GiCheckedShield size={28} />
                      <div className="font-CerFont text-[13px]">
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
                    <div className="flex flex-col">
                      <div className="font-CerFont font-bold text-[22px]">
                        {i18n.language === "en"
                          ? `start at ฿${activity?.cost} / person`
                          : `เริ่มต้น ฿${activity?.cost} / คน`}
                      </div>
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
                        className="py-[10px] px-[20px] rounded-lg font-CerFont 
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

              <div
                className="py-[48px] flex flex-col gap-6"
                style={{ borderBottom: "solid 1px #dddddd" }}
              >
                <div className="font-CerFont font-bold text-[22px]">
                  {i18n.language === "en"
                    ? "Where you'll be"
                    : "สถานที่จัดกิจกรรม"}
                </div>
                <div className="font-CerFont text-[16px] text-qblack">
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

              {isMobile && (
                <FloatingBar
                  activity={activity}
                  schedule={activity?.schedule}
                  startDate={startDate}
                  dates={parentId?.map((item) => item)}
                  cost={activity?.cost}
                  adults={adults}
                  children={children}
                  handlePaymentNavigation={handlePaymentNavigation}
                  formatTime={formatTime}
                  formatThaiDate={formatThaiDate}
                  activityDetail={activity}
                />
              )}
              {/* บรรทัดสุดท้าย bro */}
            </div>
          ) : (
            <p className="text-center text-xl">Loading...</p>
          )}
        </div>
      </div>
      {/* <div style={{ padding: "20px" }}>
        <ElfsightWidget />
      </div> */}

      <Footer />
      {isMobile && (
        <>
          <br />
          <br />
        </>
      )}
    </>
  );
};

export default ActivityDetails;

const FloatingBar = ({
  activity,
  activityDetail,
  schedule,
  startDate,
  adults,
  children,
  cost,
  dates,
  formatTime,
  formatThaiDate,
  handlePaymentNavigation,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [modalCalendar, setModalCalendar] = useState(false);
  const [modalParticipants, setModalParticipants] = useState(false);
  const [mobileModalParticipants, setMobileModalParticipants] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mobileFilteredSchedules, setMobileFilteredSchedules] = useState([]);
  const [isCleared, setIsCleared] = useState(false);
  const [adultsCount, setAdultsCount] = useState(adults || 1);
  const [childrenCount, setChildrenCount] = useState(children || 0);

  const filterFutureDates = (dates, filterDate = null) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const filtered = dates?.filter((date) => {
      const activityDate = new Date(date.activityTime?.start).setHours(
        0,
        0,
        0,
        0
      );
      return (
        activityDate >= today && (!filterDate || activityDate === filterDate)
      );
    });
    return filtered || [];
  };

  const groupByDate = (dates) => {
    return (dates || []).reduce((acc, date) => {
      const formattedDate = formatThaiDate(date.activityTime?.start);
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(date);
      return acc;
    }, {});
  };

  const sortByTime = (dates) => {
    return dates.sort(
      (a, b) =>
        new Date(a.activityTime?.start) - new Date(b.activityTime?.start)
    );
  };

  const handleClearDate = () => {
    setSelectedDate(null);
    setIsCleared(true);
  };

  const handleIncreaseAdults = () => {
    setAdultsCount(adultsCount + 1);
    localStorage.setItem("adults", adultsCount + 1);
  };

  const handleDecreaseAdults = () => {
    if (adultsCount > 0) {
      setAdultsCount(adultsCount - 1);
      localStorage.setItem("adults", adultsCount - 1);
    }
  };

  const handleIncreaseChildren = () => {
    setChildrenCount(childrenCount + 1);
    localStorage.setItem("children", childrenCount + 1);
  };

  const handleDecreaseChildren = () => {
    if (childrenCount > 0) {
      setChildrenCount(childrenCount - 1);
      localStorage.setItem("children", childrenCount - 1);
    }
  };

  const filteredDates = isCleared
    ? filterFutureDates(dates)
    : filterFutureDates(dates, selectedDate?.getTime());

  const groupedDates = groupByDate(filteredDates);

  useEffect(() => {
    //alert(childrenCount);
    //alert("children :", children);
    //alert("filteredSchedules = " + JSON.stringify(filteredSchedules));
  }, []);
  useEffect(() => {
    if (activityDetail && activity?.schedule) {
      const initialDate = new Date(activityDetail?.lastStartDate); // หรือกำหนดวันที่เริ่มต้นที่คุณต้องการ
      mobileHandleDateChange(initialDate);
    }
  }, [activity, activityDetail]);

  const mobileHandleDateChange = (date) => {
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const filteredSchedules = activity?.schedule?.filter((schedule) => {
      const days = schedule.dayString.toLowerCase().split(",");
      return (
        days.includes("everyday") ||
        days.includes(dayOfWeek) ||
        (days.includes("weekend") &&
          (dayOfWeek === "saturday" || dayOfWeek === "sunday"))
      );
    });
    setMobileFilteredSchedules(filteredSchedules);
  };

  //สำหรับการเลือก mobile แบบปกติ // ยังไม่ได้ใช้
  const DetailPopup = ({ onClose, dates }) => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4">
        <button onClick={onClose} className="bg-transparent">
          <IoChevronBackOutline size={24} />
        </button>

        <div className="flex flex-col">
          <h3 className="text-2xl text-black font-bold mb-6 font-CerFont">
            {i18n.language === "en" ? "Select Date" : "เลือกวันที่"}
          </h3>

          <div className="flex gap-3">
            <button
              className="bg-transparent rounded-full px-4 text-sm font-CerFont"
              style={{
                border: "1px solid #dddddd",
              }}
              onClick={() => setModalCalendar(true)}
            >
              {i18n.language === "en" ? "Select Date" : "เลือกวันที่"}
            </button>
            <button
              className="bg-transparent rounded-full px-4 text-sm font-CerFont"
              style={{
                border: "1px solid #dddddd",
              }}
              onClick={() => setMobileModalParticipants(true)}
            >
              {i18n.language === "th"
                ? `ผู้เข้าร่วม ${adultsCount + childrenCount} คน`
                : `${adultsCount + childrenCount} participant${
                    adultsCount + childrenCount > 1 ? "s" : ""
                  }`}
            </button>
          </div>

          <div className="flex flex-col gap-3 py-10">
            {Object.keys(groupedDates).map((dateKey) => (
              <div key={dateKey}>
                <div className="text-base font-bold font-CerFont p-2">
                  {dateKey}
                </div>
                {sortByTime(groupedDates[dateKey]).map((date, index) => (
                  <div
                    key={index}
                    className="p-6 mb-4 rounded-lg"
                    style={{ border: "1px solid #dddddd" }}
                  >
                    <div className="flex flex-row justify-between">
                      <div>
                        <div className="text-base font-medium font-CerFont">
                          {formatTime(date.activityTime?.start)}-
                          {formatTime(date.activityTime?.end)}
                        </div>
                        <div className="text-base font-CerFont">
                          <span className="text-base font-medium">
                            ฿{date.cost}
                          </span>{" "}
                          / คน
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() =>
                            handlePaymentNavigation(
                              date.id,
                              adultsCount,
                              childrenCount
                            )
                          }
                          className="buttonSelectDate"
                        >
                          <center>
                            {i18n.language === "en" ? "Choose" : "เลือก"}
                          </center>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col pt-3 text-base font-CerFont">
                      <span>รอบนี้กำลังเป็นที่นิยม</span>
                      <span>ขอเงินคืนไม่ได้</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {modalCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-22250">
          <div className="bg-white max-w-sm w-[90%] rounded-lg p-5 overflow-auto">
            <div className="flex items-center justify-between">
              <IoClose
                size={30}
                className="cursor-pointer"
                onClick={() => setModalCalendar(false)}
              />
              <span className="text-base font-CerFont font-bold flex-grow text-center">
                {i18n.language === "en" ? "Choose Date" : "เลือกช่วงวันที่"}
              </span>
              <div style={{ width: "30px" }}></div>
            </div>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n.language}
            >
              <DateCalendar
                className="date-calendar"
                defaultValue={selectedDate ? dayjs(selectedDate) : null}
                onChange={(newDate) => {
                  setSelectedDate(new Date(newDate));
                  setIsCleared(false);
                  setModalCalendar(false);
                  handleDateChange(newDate);
                }}
                shouldDisableDate={(date) => {
                  const currentDate = new Date(date).setHours(0, 0, 0, 0);
                  const today = new Date().setHours(0, 0, 0, 0);
                  return currentDate < today; // 🔥 ปิดวันก่อนวันนี้
                }}
              />
            </LocalizationProvider>

            <div className="flex justify-between pt-5">
              <button
                onClick={handleClearDate}
                className="underline font-bold bg-transparent"
              >
                {i18n.language === "en" ? "Clear Date" : "เคลียร์วันที่"}
              </button>
              <button
                onClick={() => setModalCalendar(false)}
                className="py-2 px-4 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors "
              >
                {i18n.language === "en" ? "Save" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
      {modalParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white max-w-sm w-[90%] rounded-lg overflow-auto">
            <div className="flex items-center justify-between p-5">
              <IoClose
                size={30}
                className="cursor-pointer"
                onClick={() => setModalParticipants(false)}
              />
              <span className="text-base font-CerFont font-bold flex-grow text-center">
                {i18n.language === "en" ? "Participants" : "ผู้เข้าร่วม"}
              </span>
              <div style={{ width: "30px" }}></div>
            </div>
            <div
              className="flex flex-col gap-5 p-4"
              style={{ border: "1px solid #dddddd" }}
            >
              {/* ผู้ใหญ่ */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-CerFont">
                    {i18n.language === "en" ? "Adult" : "ผู้ใหญ่"}
                  </div>
                  <div className="font-CerFont text-xs">
                    {i18n.language === "en"
                      ? "more than 13"
                      : "อายุ 13 ปีขึ้นไป"}
                  </div>
                </div>
                <div>
                  <button
                    className={`px-2 py-1 font-CerFont ${
                      adultsCount === 0 ? "text-gray-300" : "text-black"
                    }`}
                    onClick={handleDecreaseAdults}
                    disabled={adultsCount === 0}
                  >
                    -
                  </button>
                  <span className="mx-3">{adultsCount}</span>
                  <button
                    className="px-2 py-1 font-CerFont text-black"
                    onClick={handleIncreaseAdults}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* เด็ก */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-CerFont">
                    {i18n.language === "en" ? "Child" : "เด็ก"}
                  </div>
                  <div className="font-CerFont text-xs">
                    {i18n.language === "en" ? "4-12 years" : "อายุ 4-12 ปี"}
                  </div>
                </div>
                <div>
                  <button
                    className={`px-2 py-1 font-CerFont ${
                      childrenCount === 0 ? "text-gray-300" : "text-black"
                    }`}
                    onClick={handleDecreaseChildren}
                    disabled={childrenCount === 0}
                  >
                    -
                  </button>
                  <span className="mx-3">{childrenCount}</span>
                  <button
                    className="px-2 py-1 font-CerFont text-black"
                    onClick={handleIncreaseChildren}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-5 pb-10">
              <button
                onClick={() => setModalParticipants(false)}
                className="py-2 px-4 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-white shadow-md flex items-center justify-around py-4"
      style={{ zIndex: 50, borderTop: "1px solid #dddddd", padding: "10px" }}
    >
      <div>
        <div
          className="font-CerFont font-bold text-sm md:text-base"
          style={{ fontSize: "17px" }}
        >
          {i18n.language === "en"
            ? ` ฿${activity?.cost}/person`
            : ` ฿${activity?.cost}/คน`}
          <br />
          {selectedDate
            ? dayjs(selectedDate).format("YYYY-MM-DD")
            : i18n.language === "en"
            ? "(Please Select Date)"
            : "(กรุณาเลือกวันที่ก่อน)"}
        </div>
      </div>
      <div>
        <button
          className="buttonSelectDate"
          style={{ width: "120px", padding: "8px", margin: "5px" }}
          onClick={() => setModalParticipants(true)}
        >
          {i18n.language === "th"
            ? `ผู้เข้าร่วม ${adultsCount + childrenCount} คน`
            : `${adultsCount + childrenCount} participant${
                adultsCount + childrenCount > 1 ? "s" : ""
              }`}
        </button>
        {mobileFilteredSchedules.map((schedule, index) => (
          <button
            className="buttonSelectDate"
            style={{ width: "120px", padding: "8px", margin: "5px" }}
            onClick={() => {
              setModalCalendar(true);
            }}
          >
            <center>
              {i18n.language === "en" ? "Choose Date" : "เลือกวันที่"}
            </center>
          </button>
        ))}
      </div>
      {mobileFilteredSchedules.map((schedule, index) => (
        <button
          className="buttonSelectBook"
          style={{
            width: "280px",
            fontSize: "22px",
            height: "90px",
            padding: "8px",
            margin: "5px",
            backgroundColor: selectedDate ? "" : "lightgray", // เปลี่ยนสีพื้นหลังตามค่า selectedDate
            cursor: selectedDate ? "pointer" : "not-allowed", // เปลี่ยน cursor ตามค่า selectedDate
          }}
          onClick={() => {
            //alert(startDate);
            handlePaymentNavigation(
              activity._id,
              schedule._id,
              adultsCount,
              childrenCount,
              schedule.cost,
              selectedDate
            );
          }}
          disabled={!selectedDate}
        >
          <center>{i18n.language === "en" ? "Book" : "จองกิจกรรม"}</center>
        </button>
      ))}

      {/* ปฏิทิน mobile */}
      {modalCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-22250">
          <div className="bg-white max-w-sm w-[90%] rounded-lg p-5 overflow-auto">
            <div className="flex items-center justify-between">
              <IoClose
                size={30}
                className="cursor-pointer"
                onClick={() => setModalCalendar(false)}
              />
              <span className="text-base font-CerFont font-bold flex-grow text-center">
                {i18n.language === "en" ? "Choose Date" : "เลือกช่วงวันที่"}
              </span>
              <div style={{ width: "30px" }}></div>
            </div>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18n.language}
            >
              <DateCalendar
                className="date-calendar"
                defaultValue={selectedDate ? dayjs(selectedDate) : null}
                onChange={(newDate) => {
                  setSelectedDate(new Date(newDate));
                  setIsCleared(false);
                  setModalCalendar(false);
                  handleDateChange(newDate);
                }}
                shouldDisableDate={(date) => {
                  const currentDate = new Date(date).setHours(0, 0, 0, 0);
                  const today = new Date().setHours(0, 0, 0, 0);
                  return currentDate < today; // 🔥 ปิดวันก่อนวันนี้
                }}
              />
            </LocalizationProvider>

            <div className="flex justify-between pt-5">
              <button
                onClick={handleClearDate}
                className="underline font-bold bg-transparent"
              >
                {i18n.language === "en" ? "Clear Date" : "เคลียร์วันที่"}
              </button>
              <button
                onClick={() => setModalCalendar(false)}
                className="py-2 px-4 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors "
              >
                {i18n.language === "en" ? "Save" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
      {modalParticipants && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          style={{ padding: "10px" }}
        >
          <div className="bg-white max-w-sm w-[90%] rounded-lg overflow-auto">
            <div className="flex items-center justify-between p-5">
              <IoClose
                size={30}
                className="cursor-pointer"
                onClick={() => setModalParticipants(false)}
              />
              <span
                className="text-base font-CerFont font-bold  text-center"
                style={{ width: "100px" }}
              >
                {i18n.language === "en" ? "Participants" : "ผู้เข้าร่วม"}
              </span>
              <div style={{ width: "30px" }}></div>
            </div>
            <div
              className="flex flex-col gap-5 p-4"
              style={{ border: "1px solid #dddddd" }}
            >
              {/******************* ผู้ใหญ่ *******************/}
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-CerFont">
                    {i18n.language === "en" ? "Adult" : "ผู้ใหญ่"}
                  </div>
                  <div className="font-CerFont text-xs">
                    {" "}
                    {i18n.language === "en"
                      ? "more than 20"
                      : "อายุ 20 ปีขึ้นไป"}
                  </div>
                </div>
                <div>
                  <button
                    className={`px-2 py-1 font-CerFont ${
                      adultsCount === 0 ? "text-gray-300" : "text-black"
                    }`}
                    onClick={handleDecreaseAdults}
                    disabled={adultsCount === 0}
                  >
                    -
                  </button>
                  <span className="mx-3">{adultsCount}</span>
                  <button
                    className="px-2 py-1 font-CerFont text-black"
                    onClick={handleIncreaseAdults}
                  >
                    +
                  </button>
                </div>
              </div>

              {/*******************  เด็ก ***********************/}
              {/* <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="font-CerFont">
                    {i18n.language === "en" ? "Child" : "เด็ก"}
                  </div>
                  <div className="font-CerFont text-xs">
                    {i18n.language === "en" ? "4-12 years" : "อายุ 4-12 ปี"}
                  </div>
                </div>
                <div>
                  <button
                    className={`px-2 py-1 font-CerFont ${
                      childrenCount === 0 ? "text-gray-300" : "text-black"
                    }`}
                    onClick={handleDecreaseChildren}
                    disabled={childrenCount === 0}
                  >
                    -
                  </button>
                  <span className="mx-3">{childrenCount}</span>
                  <button
                    className="px-2 py-1 font-CerFont text-black"
                    onClick={handleIncreaseChildren}
                  >
                    +
                  </button>
                </div>
              </div> */}
            </div>

            <div className="flex justify-center pt-5 pb-10">
              <button
                onClick={() => setModalParticipants(false)}
                className="py-2 px-4 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
              >
                {i18n.language === "en" ? "Close" : "ปิด"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isDetailsOpen && (
        <DetailPopup onClose={() => setIsDetailsOpen(false)} dates={dates} />
      )}
    </div>
  );
};

const DateSelectorCarousel = ({
  dates,
  handlePaymentNavigation,
  formatThaiDate,
  formatTime,
  adults,
  children,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // ฟังก์ชันเพื่อกรองและเรียงลำดับวันที่ตั้งแต่วันนี้เป็นต้นไป
  const filteredDates = dates
    ?.filter((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ตั้งเวลาเป็น 00:00:00
      const activityDate = new Date(date?.activityTime?.start);
      return activityDate >= today; // กรองวันที่ที่เท่ากับหรือมากกว่าวันนี้
    })
    .sort((a, b) => {
      const dateA = new Date(a?.activityTime?.start);
      const dateB = new Date(b?.activityTime?.start);
      return dateA - dateB; // เรียงลำดับวันที่จากน้อยไปมาก
    });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTo = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = 210 * (direction === "right" ? 1 : -1);
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  const showLeftButton = scrollPosition > 0;
  const showRightButton =
    containerRef.current &&
    scrollPosition <
      containerRef.current.scrollWidth - containerRef.current.clientWidth;

  // ถ้าไม่มีวันที่เหลือหลังกรอง ให้ return null
  if (!filteredDates || filteredDates.length === 0) {
    return <div>ไม่มีวันที่ที่สามารถเลือกได้</div>;
  }

  return (
    <div className="relative">
      {!isMobile && showLeftButton && (
        <button
          onClick={() => scrollTo("left")}
          className="absolute left-0 top-[40%] -translate-y-1/2 z-10 bg-black flex justify-center items-center rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <ChevronLeft size={24} style={{ color: "white" }} />
        </button>
      )}

      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {filteredDates.map((date, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex flex-col p-6 w-[210px] rounded-lg hover:border-gray-300 transition-colors"
            style={{ border: "solid 1px black" }}
          >
            <div className="font-CerFont text-base font-semibold">
              {formatThaiDate(date?.activityTime.start)}
            </div>
            <div className="font-CerFont text-sm">
              {formatTime(date.activityTime.start)}-
              {formatTime(date.activityTime.end)}
            </div>
            <div className="font-CerFont text-base font-bold mt-8 mb-4">
              ฿{date.cost}
              <span className="font-CerFont text-sm font-normal"> / กลุ่ม</span>
            </div>
            <button
              type="button"
              onClick={() => handlePaymentNavigation(date.id, adults, children)}
              className="w-full py-2 px-4 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <center>{i18n.language === "en" ? "Choose" : "เลือก"}</center>
            </button>
          </div>
        ))}
      </div>

      {!isMobile && showRightButton && (
        <button
          onClick={() => scrollTo("right")}
          className="absolute right-0 top-[40%] -translate-y-1/2 z-10 bg-black flex justify-center items-center rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
        >
          <ChevronRight size={24} style={{ color: "white" }} />
        </button>
      )}
    </div>
  );
};

const MobileActivityDetails = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  const sections = [
    {
      id: 1,
      title: "รายละเอียดราคา",
      shortDesc: "ดูรายละเอียดเกี่ยวกับราคาและค่าใช้จ่ายต่างๆ",
      included: [
        "กำหนดการเดินทางที่กำหนดเอง",
        "เอ็กซ์พีเรียนซ์นำเที่ยว 5 หรือ 6 ชั่วโมง",
        "ข้อมูลเชิงลึกในท้องถิ่นและเคล็ดลับจากคนวงใน",
      ],
      notIncluded: [
        "ค่าเข้าชม",
        "อาหารและเครื่องดื่ม",
        "ค่าเดินทาง",
        "ค่าใช้จ่ายส่วนตัวอื่นๆ",
        "ค่าใช้จ่ายเพิ่มเติม: ผู้เข้าร่วมจะเป็นผู้จ่ายค่าเข้าชม ค่าอาหารกลางวัน และค่าเดินทางที่ไม่ใช่ขนส่งสาธารณะให้ผู้จัด",
      ],
    },
    {
      id: 2,
      title: "นโยบายยกเลิกการจอง",
      shortDesc: "ดูรายละเอียดเกี่ยวกับราคาและค่าใช้จ่ายต่างๆ",
      included: [
        "กำหนดการเดินทางที่กำหนดเอง",
        "เอ็กซ์พีเรียนซ์นำเที่ยว 5 หรือ 6 ชั่วโมง",
        "ข้อมูลเชิงลึกในท้องถิ่นและเคล็ดลับจากคนวงใน",
      ],
      notIncluded: [
        "ค่าเข้าชม",
        "อาหารและเครื่องดื่ม",
        "ค่าเดินทาง",
        "ค่าใช้จ่ายส่วนตัวอื่นๆ",
        "ค่าใช้จ่ายเพิ่มเติม: ผู้เข้าร่วมจะเป็นผู้จ่ายค่าเข้าชม ค่าอาหารกลางวัน และค่าเดินทางที่ไม่ใช่ขนส่งสาธารณะให้ผู้จัด",
      ],
    },
    {
      id: 3,
      title: "คุณสมบัติของผู้เข้าร่วม",
      shortDesc: "ดูรายละเอียดเกี่ยวกับราคาและค่าใช้จ่ายต่างๆ",
      included: [
        "กำหนดการเดินทางที่กำหนดเอง",
        "เอ็กซ์พีเรียนซ์นำเที่ยว 5 หรือ 6 ชั่วโมง",
        "ข้อมูลเชิงลึกในท้องถิ่นและเคล็ดลับจากคนวงใน",
      ],
      notIncluded: [
        "ค่าเข้าชม",
        "อาหารและเครื่องดื่ม",
        "ค่าเดินทาง",
        "ค่าใช้จ่ายส่วนตัวอื่นๆ",
        "ค่าใช้จ่ายเพิ่มเติม: ผู้เข้าร่วมจะเป็นผู้จ่ายค่าเข้าชม ค่าอาหารกลางวัน และค่าเดินทางที่ไม่ใช่ขนส่งสาธารณะให้ผู้จัด",
      ],
    },
  ];

  const DetailPopup = ({ section, onClose }) => (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="p-4">
        <button onClick={onClose} className="flex items-center gap-2 mb-4">
          <IoChevronBackOutline size={24} />
          <span className="font-CerFont">กลับ</span>
        </button>

        <h3 className="text-xl font-bold mb-6 font-CerFont">{section.title}</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-CerFont text-[14px] font-bold mb-2">
              มีอะไรรวมอยู่บ้าง
            </h4>
            {section.included.map((item, index) => (
              <div key={index} className="font-CerFont text-[14px] mb-1">
                · {item}
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-CerFont text-[14px] font-bold mb-2">
              สิ่งที่ไม่รวมในบริการ
            </h4>
            {section.notIncluded.map((item, index) => (
              <div key={index} className="font-CerFont text-[14px] mb-1">
                · {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionPreview = ({ section }) => (
    <button
      onClick={() => setSelectedSection(section)}
      className="w-full p-4 flex justify-between items-center bg-red-400"
      style={{
        borderBottom: "solid 1px #dddddd",
        backgroundColor: "transparent",
      }}
    >
      <div className="text-left">
        <h3 className="text-black font-semibold mb-1 font-CerFont text-[19px]">
          {section.title}
        </h3>
        <p className="text-sm text-gray-600 font-CerFont">
          {section.shortDesc}
        </p>
      </div>
      <IoChevronForwardOutline size={20} className="text-gray-400" />
    </button>
  );

  return (
    <div className="flex flex-col gap-3 md:hidden mb-20 md:mb-0">
      {sections.map((section) => (
        <SectionPreview key={section.id} section={section} />
      ))}

      {selectedSection && (
        <DetailPopup
          section={selectedSection}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </div>
  );
};
