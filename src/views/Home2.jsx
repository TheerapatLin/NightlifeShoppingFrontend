// Home.jsx

import { useEffect, useState } from "react";
import "../public/css/App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import EventSlider from "../components/EventSlider";
import { useNavigate, useLocation, Link } from "react-router-dom";
import EventSlider2 from "../components/EventSlider2";
import EventSlider3 from "../components/EventSlider3";
import { useGlobalEvent } from "../context/GlobalEventContext";
import Footer from "../components/Footer";
import EventSlider4 from "../components/EventSlider4";
import WeekendTurnUp from "../components/WeekendTurnUp";
import AllEventsInclude from "../components/AllEventsInclude";
import Videotextnightlife from "../components/Videotextnightlife";

function Home() {
  const [eventData, setEventData] = useState([]);
  const [eventData2, setEventData2] = useState([]);
  const [venueData, setVenueData] = useState([]);
  const [venueData2, setVenueData2] = useState([]);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  // const { isScrolled, currentPage, updateCurrentPage, windowSize } = useGlobalEvent();

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
      <a href="/activityDetails/6787dd2b5e47d804bdc6b012">
        <div className="App">
          <Videotextnightlife />
        </div>
      </a>
      {/***************** Weekend Turn-Up *****************/}
      <div
        className="container"
        style={{ paddingTop: "70px", maxWidth: "90%" }}
      >
        <WeekendTurnUp />
      </div>

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
