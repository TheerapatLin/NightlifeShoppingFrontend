import { useEffect, useState } from "react";
import "../public/css/App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Overlay0 from "../img/overlay0.png";
import Overlay1 from "../img/overlay1.png";
import Overlay2 from "../img/overlay2.png";
import Overlay3 from "../img/overlay3.png";
import Overlay4 from "../img/overlay4.png";
import Gra1 from "../img/gra1.png";
import TopNavigation from "../components/TopNavigation";
import Footer from "../components/Footer";
import { useGlobalEvent } from "../context/GlobalEventContext";
import EventSlider3 from "../components/EventSlider3";
import axios from "axios";

function Home() {
  const { isScrolled, windowSize } = useGlobalEvent();
  const [currentPage, setCurrentPage] = useState("home");
  const [mainBannerData, setMainBannerData] = useState([]);
  const [mainBannerData_m, setMainBannerData_m] = useState([]);
  const [posterBannerData, setPosterBannerData] = useState([]);
  const [longBannerData, setLongBannerData] = useState([]);
  const [landscapeBannerData, setlandscapeBannerData] = useState([]);
  const [top, setTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(windowSize.height);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/data/banners_home.json`);
        const data = await response.json();
        //alert(JSON.stringify(data["main_banner_desktop"], null, 2));
        //console.log(`data["main_banner_desktop"] = ${JSON.stringify(data["main_banner_desktop"], null, 2)}`);

        setMainBannerData(data["main_banner_desktop"]);
        setMainBannerData_m(data["main_banner_mobile"]);
        setPosterBannerData(data["banner_poster"]);
        setLongBannerData(data["banner_long"]);
        setlandscapeBannerData(data["banner_landscape"]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    const handleScroll = () => {
      setTop(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div class="relative flex justify-center items-center w-full h-full p-0 m-0">
      <div
        className={`App ${isScrolled ? "scrolled" : ""}`}
        style={{ position: "absolute", zIndex: "3000", width: "100%", padding: "0px", margin: "0px" }}
      >
        <center>
          sdfsdfsdfdfsd
          <div
            style={{
              width: "100vw",
              margin: "0px",
              padding: windowSize.width <= 1280 && windowSize.width >= 1000 ? "0px 170px " : "0px",
              paddingBottom: "0px",
              marginBottom: "0px",
              position: "relative",
            }}
          >
            <TopNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

            {windowSize.width >= 600 ? (
              <div style={{}}>
                <EventSlider3
                  ratio={0.42}
                  cardMargin={0}
                  isFullWidthCard={true}
                  isStartAtRim={true}
                  topPadding={100}
                  data={mainBannerData}
                  windowSize={windowSize}
                  intervalTime={5000}
                  width="100%"
                  maxWidth="1280px"
                  allPadding="100px"
                  showDot={true}
                  cardBorderRadius={10}
                  onCardClick={(data, index) => {
                    if (data.link != "") {
                      window.open(data.link);
                    }
                  }}
                />
              </div>
            ) : (
              <div style={{}}>
                <EventSlider3
                  ratio={1}
                  cardMargin={0}
                  isFullWidthCard={true}
                  isStartAtRim={true}
                  topPadding={100}
                  data={mainBannerData_m}
                  intervalTime={5000}
                  windowSize={windowSize}
                  allPadding="100px"
                  showDot={true}
                  cardBorderRadius={0}
                  onCardClick={(data, index) => {
                    if (data.link != "") {
                      window.open(data.link);
                    }
                  }}
                />
              </div>
            )}

            <div className="container" style={{ marginTop: 70, maxWidth: "90%" }}>
              <div style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div className="EventSlideHeaderText1">กิจกรรมแนะนำสำหรับคุณ</div>
                <div className="EventSlideHeaderText2">ดูทั้งหมด &gt;</div>
              </div>
            </div>
            {windowSize.width >= 600 ? (
              <EventSlider3
                showDetail={true}
                detailHeight={150}
                isStartAtRim={true}
                data={posterBannerData}
                minWidth="1140"
                ratio={1.333}
                intervalTime={6000}
                bottomPadding={20}
                // cardShadow={'0 0 20px 0px rgba(0,0,0,.45)'}
                cardShadowHover={"0 0 20px 1px rgba(255,255,255,1)"}
                showDot={true}
                onCardClick={(data, index) => {
                  if (data.link != "") {
                    window.open(data.link);
                  }
                }}
                detailElement={(data, index) => (
                  <div>
                    <h3 className="item03" style={{ color: "white", padding: "5px 0px 5px 20px" }}>
                      <b>{data?.caption ?? ""}</b>
                    </h3>
                    <p className="item03" style={{ color: "#31ff64", padding: "0px 0px 0px 20px", fontSize: "12px" }}>
                      <i className="bi bi-calendar3"></i> {data?.date ?? ""}
                    </p>
                    <p className="item03" style={{ color: "#31ff64", padding: "0px 0px 0px 20px", fontSize: "12px" }}>
                      <i className="bi bi-clock"></i> {data?.time ?? ""}
                    </p>
                    <p className="item03" style={{ color: "#31ff64", padding: "0px 0px 15px 20px", fontSize: "12px" }}>
                      <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
                    </p>
                  </div>
                )}
              />
            ) : (
              <EventSlider3
                isStartAtRim={true}
                data={posterBannerData}
                minWidth="1140"
                ratio={1.333}
                intervalTime={6000}
                bottomPadding={20}
                cardWidth={290}
                cardShadowHover={"0 0 20px 1px rgba(255,255,255,1)"}
                showDot={true}
                onCardClick={(data, index) => {
                  if (data.link != "") {
                    window.open(data.link);
                  }
                }}
                detailElement={(data, index) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backdropFilter: "blur(40px)",
                      backgroundColor: "rgba(20,0,20,0.2)",
                      height: "140px",
                      padding: "0px",
                      margin: "0px",
                    }}
                    key={index}
                  >
                    <div
                      style={{
                        color: "white",
                        padding: "0px 0px 10px 0px",
                        fontSize: "16px",
                        lineHeight: `18px`,
                        whiteSpace: "pre-line",
                      }}
                    >
                      <b>{data?.caption ?? ""}</b>
                    </div>
                    <div style={{ color: "black", padding: "0px 0px 0px 0px", fontSize: "14px" }}>
                      <i className="bi bi-calendar3"></i> {data?.date ?? ""}
                    </div>
                    <div style={{ color: "black", padding: "0px 0px 0px 0px", fontSize: "14px" }}>
                      <i className="bi bi-clock"></i> {data?.time ?? ""}
                    </div>
                    <div style={{ color: "black", padding: "0px 0px 0px 0px", fontSize: "14px" }}>
                      <i className="bi bi-geo-alt-fill"></i> {data?.location ?? ""}
                    </div>
                  </div>
                )}
              />
            )}

            <div className="container" style={{ marginTop: 70, maxWidth: "90%" }}>
              <div style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div className="EventSlideHeaderText1">
                  องค์กร/กลุ่มแนะนำวันนี้ : "เปเปอร์ เรนเจอร์ - จิตอาสาสมุดเพื่อน้อง"
                </div>
                {/* <div className='EventSlideHeaderText2'>ดูทั้งหมด &gt;</div> */}
              </div>
            </div>
            <div
              className="container"
              style={{ width: "100%", paddingTop: "20px", paddingBottom: "5px", maxWidth: "1280px" }}
            >
              {longBannerData && longBannerData[0] && (
                <a href={longBannerData[0]["link"]}>
                  {windowSize.width > 600 ? (
                    <img
                      src={longBannerData[0]["imageUrl"] ?? ""}
                      style={{ width: "100%", borderRadius: "10px" }}
                    ></img>
                  ) : (
                    <div style={{ maxWidth: "90%" }}>
                      <img
                        src={longBannerData[0]["imageUrl_m"] ?? ""}
                        style={{ width: "100%", borderRadius: "10px", boxShadow: "0px 0px 18px 0px #FFFFFF" }}
                      ></img>
                    </div>
                  )}
                </a>
              )}
            </div>

            <hr style={{ width: "90%", marginBottom: "0px", marginTop: "20px" }} />

            <div className="container" style={{ marginTop: 50, maxWidth: "90%", marginBottom: "10px" }}>
              <div style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div className="EventSlideHeaderText1">กิจกรรมใกล้คุณ</div>
                <div className="EventSlideHeaderText2">ดูทั้งหมด &gt;</div>
              </div>
            </div>
            {windowSize.width > 600 ? (
              <EventSlider3
                isStartAtRim={true}
                data={landscapeBannerData}
                intervalTime={4000}
                cardShadow={"0 0 20px 0px rgba(0,0,0,.15)"}
                cardWidth={450}
                imageHeight={247}
                cardShadowHover={"0 0 20px 1px rgba(255,52,210,1)"}
                showDot={true}
                onCardClick={(data, index) => {
                  if (data.link != "") {
                    window.open(data.link);
                  }
                }}
              />
            ) : (
              posterBannerData2.map((event, index) => (
                <div key={index} style={{ width: "90%", marginBottom: "10px" }}>
                  <a href={event?.link}>
                    <img
                      src={event?.imageUrl}
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        boxShadow: "0px 2px 5px 1px rgba(0,0,0,.3)",
                        border: "0px solid rgba(0,0,0,0)",
                      }}
                    />
                  </a>
                </div>
              ))
            )}

            {windowSize.width >= 600 ? (
              <div
                className="container"
                style={{
                  width: "100%",
                  paddingTop: "50px",
                  paddingBottom: "100px",
                  maxWidth: "1280px",
                }}
              >
                <img src="img/banner1.jpg?update=10012024_1350" style={{ width: "100%", borderRadius: "20px" }} />
              </div>
            ) : (
              <div style={{ width: "100%", paddingTop: "50px", maxWidth: "1280px" }}>
                <img
                  src="img/banner1_m.jpg?update=10012024_1350"
                  style={{ width: "100%", borderRadius: "0px", display: "block" }}
                />
              </div>
            )}
          </div>
          {windowSize.width >= 600 && <Footer />}
        </center>
      </div>

      {windowSize.width > 1000 && (
        <>
          <div
            style={{
              position: "fixed",
              left: "-12%",
              top: `${40 - top * 0.2}px`,
              padding: "0px",
              margin: "0px",
              zIndex: "401",
              width: "55vw",
              minWidth: "250px",
            }}
          >
            <img
              src={Overlay0}
              style={{
                padding: "0px",
                margin: "0px",
                width: "100%",
                filter: "blur(4.5px)",
                transform: `rotate(${-top / 200}deg)`,
              }}
            />
          </div>
          <div
            style={{
              position: "fixed",
              right: "-1%",
              bottom: `${top * 1.4}px`,
              padding: "0px",
              margin: "0px",
              zIndex: "100001",
              width: "27vw",
              minWidth: "250px",
            }}
          >
            <img
              src={Overlay2}
              style={{
                padding: "0px",
                margin: "0px",
                width: "100%",
                filter: `blur(${(top - windowSize.height * 0.3) / 60}px)`,
                transform: `rotate(${-top / 100}deg) scale(${1 + top / 3000})`,
              }}
            />
          </div>
          <div
            style={{
              position: "fixed",
              left: "-6%",
              top: `${viewportHeight + viewportHeight * 2 - window.innerWidth * 0.3 - top * 2.5}px`,
              padding: "0px",
              margin: "0px",
              zIndex: "30000",
              width: "25vw",
              minWidth: "250px",
            }}
          >
            <img
              src={Overlay4}
              style={{
                padding: "0px",
                margin: "0px",
                width: "100%",
                filter: `blur(${0 + (top - windowSize.height * 0.87) / 30}px)`,
                transform: `rotate(${-(top - windowSize.height * 1) / 20}deg) scale(${
                  0.7 + (top - windowSize.height * 0.7) / 2000
                })`,
              }}
            />
          </div>
          <div
            style={{
              position: "fixed",
              right: "-6%",
              top: `${viewportHeight + viewportHeight * 1.9 - windowSize.width * 0.2 - top * 1.3}px`,
              padding: "0px",
              margin: "0px",
              zIndex: "100002",
              width: "27vw",
              minWidth: "250px",
            }}
          >
            <img
              src={Overlay3}
              style={{
                padding: "0px",
                margin: "0px",
                width: "100%",
                filter: "blur(0px)",
                transform: `rotate(${-20 + top / 70}deg)`,
              }}
            />
          </div>
          <div
            style={{
              position: "fixed",
              left: "-2%",
              bottom: `${top - (document.documentElement.scrollHeight - viewportHeight)}px`,
              padding: "0px",
              margin: "0px",
              zIndex: "100002",
              width: "20vw",
              minWidth: "250px",
              transform: `translateY(${0})px`,
            }}
          >
            <img src={Overlay1} style={{ padding: "0px", margin: "0px", width: "100%", filter: "blur(0px)" }} />
          </div>
        </>
      )}

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "fixed",
            top: `${-top - windowSize.height * 0.05}px`,
            margin: "auto",
            zIndex: "1001",
            width: "100vw",
            maxWidth: "1280px",
            padding: windowSize.width <= 1280 && windowSize.width >= 1000 ? "0px 170px " : "0px",
            paddingTop: "140px",
            filter: "blur(10px)",
            opacity: ".6",
          }}
        >
          <img src={Gra1} style={{ padding: "0px", margin: "0px", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

export default Home;
