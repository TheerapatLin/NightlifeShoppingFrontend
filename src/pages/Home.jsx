// Home.jsx
import { useEffect, useState } from "react";
import "../public/css/App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import EventSlider3 from "../components/EventSlider3";
import { useGlobalEvent } from "../context/GlobalEventContext";
import { useAuth } from "../context/AuthContext";
import EventSlider4 from "../components/EventSlider4";
import CustomModal from "../components/CustomModal";
import WeekendTurnUp from "../components/WeekendTurnUp";
import AllEventsInclude from "../components/AllEventsInclude";
import Videotextnightlife from "../components/Videotextnightlife";
import VideotextnightlifeMobile from "../components/VideotextnightlifeMobile";
import ElfsightWidget from "../views/ElfsightWidget";
import DealCard from "./DealCard";
import axios from "axios";
import { useTranslation } from "react-i18next";

function Home() {
  const { t, i18n } = useTranslation();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { isLoggedIn, logout, user } = useAuth();
  const [eventData, setEventData] = useState([]);
  const [eventData2, setEventData2] = useState([]);
  const [venueData, setVenueData] = useState([]);
  const [venueData2, setVenueData2] = useState([]);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const { isScrolled, currentPage, updateCurrentPage, windowSize } =
    useGlobalEvent();

  const [showClaimDealSuccess, setShowClaimDealSuccess] = useState(false);
  const [showNotLoggedInModal, setShowNotLoggedInModal] = useState(false);
  const [claimErrorMessage, setClaimErrorMessage] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState(null); // null | 'success' | 'fail'
  // null | 'success' | 'fail'

  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/deal`);
        setDeals(res.data); // ตรวจสอบว่า API คืน array หรือ object ที่มี field เป็น deals[]
      } catch (err) {
        console.error("Error loading deals:", err);
      }
    };
    fetchDeals();
  }, []);

  const handleClaim = async (dealId) => {
    if (!isLoggedIn) {
      setShowNotLoggedInModal(true);
      return;
    }

    if (isClaiming) return;
    setIsClaiming(true);

    setClaimStatus(null);
    setClaimErrorMessage("");

    try {
      const response = await axios.post(
        `${BASE_URL}/user-deal/claim`,
        { dealId },
        {
          headers: {
            "device-fingerprint": "12345678",
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        // ✅ ให้ผู้ใช้เห็น modal ก่อน แล้วค่อย reload
        setClaimStatus("success");
      } else {
        const errorCode = response.data?.errorCode;
        const fallback = response.data?.error || t("profile.useFailed");
        setClaimErrorMessage(errorCode ? t(`deal.${errorCode}`) : fallback);
        setClaimStatus("fail");
      }
    } catch (error) {
      const errorCode = error?.response?.data?.errorCode;
      const fallback = error?.response?.data?.error || t("profile.useFailed");
      setClaimErrorMessage(errorCode ? t(`deal.${errorCode}`) : fallback);
      setClaimStatus("fail");
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/data_event.json");
        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      try {
        const response = await fetch("/data/data2.json");
        const data = await response.json();
        setEventData2(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      try {
        const response = await fetch("/data/data_venue.json");
        const data = await response.json();
        setVenueData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      try {
        const response = await fetch("/data/data_Selected_venues.json");
        const data = await response.json();
        setVenueData2(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleBanner = () => {
    alert("Banner Click");
  };

  return (
    <div>
      {/***************** Modal เตือนให้ล็อกอิน *****************/}
      {claimStatus === "success" && (
        <CustomModal
          message={
            i18n.language == "en"
              ? "🎉Deal claimed successfully"
              : "🎉รับดีลเรียบร้อยแล้ว"
          }
          type="success"
          showOkButton={true}
          showCloseButton={false}
          onClose={() => {
            setClaimStatus(null);
            window.location.reload(); // ✅ รีเฟรชหลังจากผู้ใช้กด OK
          }}
          autoClose={false}
        />
      )}

      {claimStatus === "fail" && (
        <CustomModal
          message={claimErrorMessage}
          type="error"
          showOkButton={true}
          onClose={() => setClaimStatus(null)}
          autoClose={false}
        />
      )}

      {/* {showNotLoggedInModal && (
        <CustomModal
          message="กรุณาเข้าสู่ระบบก่อนใช้งาน"
          type="error"
          showOkButton={true}
          onClose={() => setShowNotLoggedInModal(false)}
          autoClose={false}
        />
      )} */}

      {/***************** Modal เตือนให้ล็อกอิน *****************/}
      {showNotLoggedInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 relative w-[90%] max-w-sm shadow-xl">
            {/* ปุ่ม X */}
            <button
              onClick={() => setShowNotLoggedInModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
            >
              ×
            </button>

            {/* เนื้อหา */}
            <h2 className="text-center text-lg font-semibold mb-4">
              <br />
              Please log in
              <br />
              before claiming deals!
            </h2>
            <button
              onClick={() => navigate("/signup")}
              className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Go to Log in
            </button>
          </div>
        </div>
      )}

      {/***************** Main Banners *****************/}
      {/* <div 
        className="container col99" 
        style={{
          paddingTop: "180px", 
          paddingBottom: "30px", 
          maxWidth: "100%",
          cursor: hover ? "pointer" : ""
        }}
        onClick={handleBanner}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          src="img/main_banner_1.jpg"
          style={{ width: "100%", borderRadius: "10px", boxShadow: "0 0 80px 1px rgba(255,255,255,.5)" }}
        ></img>
      </div> */}

      <div className="App">
        {windowSize.width > 768 ? (
          <Videotextnightlife />
        ) : (
          <VideotextnightlifeMobile />
        )}
      </div>

      {/***************** Deal Cards *****************/}
      <>
        <style>{`
        .glow-img {
          box-shadow: 0 0 12px rgba(255, 255, 255, .4);
        }
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

        <div className="w-full px-4 py-8 max-w-screen-xl mx-auto">
          <h2 className="glow-text text-2xl text-white flex items-center gap-2 mb-6 justify-center md:justify-start">
            <span className="text-3xl">🔥</span>
            {i18n.language === "th" ? "ดีลร้อนวันนี้" : "Today's Hot Deals"}
          </h2>

          <div
            className={`grid gap-6 ${
              deals.length === 1
                ? "grid-cols-1"
                : deals.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {deals.map((deal) => (
              <div key={deal._id} className="p-2 sm:p-3 lg:p-4">
                <DealCard
                  frontImg={deal.images?.[0] || "/default.jpg"}
                  title={deal.title?.[i18n.language] || t("profile.noTitle")}
                  subtitle={deal.subTitle?.[i18n.language] || ""}
                  description={[
                    deal.description?.[i18n.language] || "",
                    deal.howToUse?.[i18n.language] || "",
                  ]}
                  onClaim={() => handleClaim(deal._id)}
                />
              </div>
            ))}
          </div>
        </div>
      </>

      {/***************** Weekend Turn-Up *****************/}
      {/* <div
        className="container"
        style={{ paddingTop: "70px", maxWidth: "90%" }}
      >
        <WeekendTurnUp />
      </div> */}

      <div
        className="container"
        style={{ paddingTop: "70px", maxWidth: "90%" }}
      >
        <AllEventsInclude />
      </div>

      {/***************** Selected Venues *****************/}
      <div
        className="container"
        style={{ paddingTop: "70px", maxWidth: "90%" }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "end",
            justifyContent: "center",
          }}
        >
          <div className="EventSlideHeaderText1">Selected Venues</div>
        </div>
      </div>

      <EventSlider4
        data={venueData2}
        intervalTime={3000}
        bottomPadding={20}
        cardWidth={300}
        detailHeight={150}
        ratio={2}
        isStartAtRim={true}
        autoplay={false}
        // cardShadow={'0 0 20px 0px rgba(0,0,0,.45)'}
        cardShadowHover={"0 0 20px 1px rgba(255,255,255,1)"}
        showDot={true}
        showDetail={false}
        showInnerDetail={true}
        onCardClick={(data, index) => {
          // alert(`คุณคลิกการ์ดที่ ${index}`);
          //...เขียนการทำงานเพิ่มเติมตรงนี้ได้เลย
          console.log(data);
          navigate(`/info_venues`, { state: { eventData: data } });
        }}
        detailElement={(data, index) => (
          <div>
            <h3
              className="item03"
              style={{ color: "white", padding: "5px 0px 5px 20px" }}
            >
              <b>{data?.caption ?? ""}</b>
            </h3>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-calendar3"></i> {data?.date ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-clock"></i> {data?.time ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 15px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
            </p>
          </div>
        )}
        detailInnerElement={(data, index) => (
          <div>
            <h3
              className="item03"
              style={{ color: "white", padding: "5px 0px 5px 20px" }}
            >
              <b>{data?.caption ?? ""}</b>
            </h3>
            <p
              className="item03"
              style={{
                color: "#FFFF00",
                padding: "0px 0px 15px 20px",
                fontSize: "16px",
              }}
            >
              {data?.popularity >= 5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </span>
              ) : data?.popularity >= 4.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                </span>
              ) : data?.popularity >= 4 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 3.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 3 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 2.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 2 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 1.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 1 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : (
                <span>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              )}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-calendar3"></i> {data?.date ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-clock"></i> {data?.time ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 15px 20px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
            </p>
          </div>
        )}
        imageGallery={venueData2
          .map((venue) => venue.gallery.map((image) => image.url))
          .flat()}
      />

      {/***************** Recommended Venues *****************/}

      <div
        className="container"
        style={{ paddingTop: "70px", maxWidth: "90%" }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "end",
            justifyContent: "center",
          }}
        >
          <div className="EventSlideHeaderText1">Recommended Venues</div>
          <div className="EventSlideHeaderText2 col-3">view all &gt;</div>
        </div>
      </div>

      <EventSlider3
        data={venueData}
        intervalTime={3000}
        bottomPadding={20}
        cardWidth={250}
        detailHeight={150}
        ratio={1.5}
        isStartAtRim={true}
        // cardShadow={'0 0 20px 0px rgba(0,0,0,.45)'}
        cardShadowHover={"0 0 20px 1px rgba(255,255,255,1)"}
        showDot={true}
        showDetail={false}
        showInnerDetail={true}
        onCardClick={(data, index) => {
          // alert(`คุณคลิกการ์ดที่ ${index}`);
          //...เขียนการทำงานเพิ่มเติมตรงนี้ได้เลย
          console.log(data);
          navigate(`/info_venues`, { state: { eventData: data } });
        }}
        detailElement={(data, index) => (
          <div>
            <h3
              className="item03"
              style={{ color: "white", padding: "5px 0px 5px 20px" }}
            >
              <b>{data?.caption ?? ""}</b>
            </h3>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-calendar3"></i> {data?.date ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-clock"></i> {data?.time ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 15px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
            </p>
          </div>
        )}
        detailInnerElement={(data, index) => (
          <div>
            <h3
              className="item03"
              style={{ color: "white", padding: "5px 0px 5px 20px" }}
            >
              <b>{data?.caption ?? ""}</b>
            </h3>
            <p
              className="item03"
              style={{
                color: "#FFFF00",
                padding: "0px 0px 15px 20px",
                fontSize: "16px",
              }}
            >
              {data?.popularity >= 5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </span>
              ) : data?.popularity >= 4.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                </span>
              ) : data?.popularity >= 4 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 3.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 3 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 2.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 2 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 1.5 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : data?.popularity >= 1 ? (
                <span>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              ) : (
                <span>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                  <i className="bi bi-star"></i>
                </span>
              )}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-calendar3"></i> {data?.date ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-clock"></i> {data?.time ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 15px 20px",
                fontSize: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
            </p>
          </div>
        )}
      />
      {/***************** Recommended Events ****************/}

      <div
        className="container"
        style={{ paddingTop: "70px", maxWidth: "90%" }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "end",
            justifyContent: "center",
          }}
        >
          <div className="EventSlideHeaderText1">Recommended Events</div>
          <div className="EventSlideHeaderText2 col-3">view all &gt;</div>
        </div>
      </div>

      <EventSlider3
        data={eventData}
        intervalTime={4000}
        bottomPadding={20}
        ratio={1.5}
        cardWidth={250}
        detailHeight={120}
        // cardShadow={'0 0 20px 0px rgba(0,0,0,.45)'}
        cardShadowHover={"0 0 20px 1px rgba(255,255,255,1)"}
        showDot={true}
        showDetail={true}
        showInnerDetail={false}
        onCardClick={(data, index) => {
          // alert(`คุณคลิกการ์ดที่ ${index}`);
          //...เขียนการทำงานเพิ่มเติมตรงนี้ได้เลย
          console.log(data);
          navigate(`/info_event`, { state: { eventData: data } });
        }}
        detailElement={(data, index) => (
          <div>
            <h3
              className="item03"
              style={{ color: "white", padding: "5px 0px 5px 20px" }}
            >
              <b>{data?.caption ?? ""}</b>
            </h3>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-calendar3"></i> {data?.date ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-clock"></i> {data?.time ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 15px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
            </p>
          </div>
        )}
        detailInnerElement={(data, index) => (
          <div>
            <h3
              className="item03"
              style={{ color: "white", padding: "5px 0px 5px 20px" }}
            >
              <b>{data?.caption ?? ""}</b>
            </h3>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-calendar3"></i> {data?.date ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 0px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-clock"></i> {data?.time ?? ""}
            </p>
            <p
              className="item03"
              style={{
                color: "#31ff64",
                padding: "0px 0px 15px 20px",
                fontSize: "12px",
              }}
            >
              <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
            </p>
          </div>
        )}
      />

      {/***************** Test Banner ****************/}
      <div className="container" style={{ marginTop: 70, maxWidth: "90%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div className="EventSlideHeaderText1">Hot Events</div>
          <div className="EventSlideHeaderText2 col-3">ดูทั้งหมด &gt;</div>
        </div>
      </div>

      <div
        className="container"
        style={{ paddingTop: "0px", paddingBottom: "30px", maxWidth: "100%" }}
      >
        <img
          src="img/testbanner1.jpg"
          style={{ width: "100%", borderRadius: "10px" }}
        ></img>
      </div>

      {/***************** Test Banner ****************/}
      <div className="container" style={{ marginTop: 50, maxWidth: "90%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div className="EventSlideHeaderText1">Popular Event</div>
          <div className="EventSlideHeaderText2 col-3">ดูทั้งหมด&gt;</div>
        </div>
      </div>

      <EventSlider3
        data={eventData2}
        intervalTime={4000}
        cardShadow={"0 0 20px 0px rgba(0,0,0,.15)"}
        cardWidth={450}
        imageHeight={247}
        cardShadowHover={"0 0 20px 1px rgba(255,52,210,1)"}
        showDot={true}
        onCardClick={(data, index) => {
          // alert(`คุณคลิกการ์ดที่ ${index}`);
          // alert(`คุณคลิกการ์ดที่ ${JSON.stringify(data, null, 2)}`);
          console.log(data);
          navigate(`/info_event`, { state: { eventData: data } });
        }}
      />
      {/***************** Test Banner ****************/}
      <div>
        <ElfsightWidget />
      </div>
      <div
        className="container"
        style={{ paddingTop: "50px", paddingBottom: "100px", maxWidth: "100%" }}
      >
        <img
          src="img/banner1.jpeg"
          style={{ width: "100%", borderRadius: "20px" }}
        ></img>
      </div>
    </div>
  );
}

export default Home;
