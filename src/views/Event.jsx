// Event.jsx

import { useEffect, useState } from "react";
import "../public/css/Container_grid.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import EventSlider from "../components/EventSlider";
import EventSlider3 from "../components/EventSlider3";
import InfoEvent from "./info_event";
import Popup from "../components/Popup";
import { useNavigate, useLocation } from "react-router-dom";

function Event() {
  const [eventData, setEventData] = useState([]);
  const [eventData2, setEventData2] = useState([]);
  const [venueData, setVenueData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [buyTicketPopupData, setBuyTicketPopupData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const shouldShowPagination = searchTerm === "" || searchResults.length > 0;


  const navigate = useNavigate();

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

    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase().replace(/\s+/g, "");
    const results = eventData.filter((event) =>
      event.caption.toLowerCase().replace(/\s+/g, "").includes(trimmedSearchTerm)
    );
    setSearchResults(results);
    setCurrentPage(1);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleGridContainerClick = (data) => {
    setSelectedEventData(data);
    navigate(`/info_event`, { state: { eventData: data } });
  };

  return (
    <div>
      <div className="container" style={{ paddingTop: "70px", maxWidth: "90%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "end",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <div className="EventSlideHeaderText1">Popular Events</div>
          <div className="EventSlideHeaderText2">ดูทั้งหมด&gt;</div>
        </div>
      </div>
      <div className="col99">
        <EventSlider3
          data={eventData2}
          intervalTime={4000}
          cardShadow={"0 0 20px 0px rgba(0,0,0,.15)"}
          cardWidth={450}
          imageHeight={247}
          cardShadowHover={"0 0 20px 1px rgba(255,52,210,1)"}
          showDot={true}
          onCardClick={(data, index) => {
            navigate(`/info_event`, { state: { eventData: data } });
          }}
        />
      </div>

      <div className="container" style={{ paddingTop: "70px", maxWidth: "90%"  }}>
        <div
          style={{ 
            width: "100%", 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "end", 
            justifyContent: "center" 
          }}
        >
          <div className="EventSlideHeaderText1">Recommended Events</div>
          <div className="EventSlideHeaderText2">view all &gt;</div>
        </div>
      </div>
      <div className="col99">
        <EventSlider3
          data={eventData}
          intervalTime={2000}
          bottomPadding={20}
          cardShadowHover={"0 0 20px 1px rgba(255,255,255,1)"}
          ratio={1.5}
          cardWidth={250}
          // detailHeight = {150}
          showDot={false}
          showDetail={true}
          showInnerDetail={false}
          onCardClick={(data, index) => {
            navigate(`/info_event`, { state: { eventData: data } });
          }}
          detailElement={(data, index) => (
            <div>
              <h3 className="item03" style={{ color: "white", padding: "5px 0px 5px 20px" }}>
                <b>{data?.caption ?? ""}</b>
              </h3>
              <p className="item03" style={{ color: "#FFFF00", padding: "0px 0px 15px 20px", fontSize: "16px" }}>
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
          detailInnerElement={(data, index) => (
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
              <p className="item03" style={{ color: "#31ff64", padding: "0px 0px 15px 20px", fontSize: "12px" }}>
                <i className="bi bi-geo-alt-fill"></i> {data?.popularity ?? ""}
              </p>
            </div>
          )}
        />
      </div>
      

      <div className="container" style={{ maxWidth: '90%' }}>
        <div className="searchbar">
          <div className="EventSlideHeaderText1">Event All</div>
          <div
            className="EventSlideHeaderText2 col-1"
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
            style={{
              background: "#EFEFEF",
              borderRadius: "100px",
              padding: 5,
              height: "auto",
              boxShadow:
                searchTerm || isSearchHovered ? "0 0 30px rgba(255, 255, 255)" : "0 0 30px rgba(255, 255, 255, 0.5)",
            }}
          >
            <div>
              <i className="bi bi-search" style={{ marginInline: "10px", color: "black" }}></i>
              <input
                type="text"
                placeholder="Search Event"
                value={searchTerm}
                onKeyPress={handleKeyPress}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  marginLeft: "5px",
                  flex: "1",
                  fontSize: 15,
                  width: "80%",
                }}
              />
            </div>
          </div>
        </div>

        <div className="container">
          {searchTerm !== "" ? (
            <div>
              <div className="grid-container">
                {searchResults.slice((currentPage - 1) * 12, currentPage * 12).map((result, index) => (
                  <div
                    key={index}
                    className="flex-item"
                    style={{
                      backdropFilter: "blur(40px)",
                      backgroundColor: "rgba(20, 0, 20, 0.2)",
                      borderRadius: 25,
                      height: 'auto',
                    }}
                  >
                    <div
                      className="imgVenues"
                      key={index}
                      onClick={() => {
                        handleGridContainerClick(result, index);
                        navigate(`/info_event`, { state: { eventData: result } });
                      }}
                      style={{
                        backgroundImage: `url(${result.imageUrl})`,
                        backgroundSize: "cover",
                        borderRadius: "25px 0 0 25px",
                        height: "100%",
                      }}
                    ></div>
                    <div className="caption" style={{ padding: 10, height:'100%' }}>
                      <div
                        key={index}
                        onClick={() => {
                          handleGridContainerClick(result, index);
                          navigate(`/info_event`, { state: { eventData: result } });
                        }}
                      >
                        <h3>{result.caption}</h3>
                        <div style={{ color: "#FFFF00"}}>
                          {result?.popularity >= 5  ?(
                            <span>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                              <i className="bi bi-star-fill"></i>
                            </span>
                            ) : result?.popularity >= 4.5 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                              </span>
                            ) : result?.popularity >= 4 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : result?.popularity >= 3.5  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : result?.popularity >= 3  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : result?.popularity >= 2.5 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : result?.popularity >= 2  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : result?.popularity >= 1.5 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : result?.popularity >= 1  ?(
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
                            )
                          }
                        </div>
                        <p>{result.date}</p>
                        <p>{result.time}</p>
                        <p>
                          <i className="bi bi-geo-alt-fill"> </i>
                          {result.location}
                        </p>
                      </div>
                      <div
                        className="buyTicket"
                        onClick={() => setBuyTicketPopupData(result)}
                        style={{
                          backgroundColor: "#E2346E",
                          textAlign: "center",
                          borderRadius: 50,
                          marginTop: "35px",
                          color: "#fff",
                          padding: 5,
                        }}
                      >
                        <span>Buy a ticket</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {shouldShowPagination && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    <i className="bi bi-chevron-left"></i>
                    {" "}
                    Previous
                  </button>
                  <span className="pagination-page">Page {currentPage}</span>
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    disabled={currentPage * 12 >= searchResults.length}
                    className="pagination-button"
                  >
                    Next
                    {" "}
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="grid-container">
                {eventData.slice((currentPage - 1) * 12, currentPage * 12).map((event, index) => (
                  <div
                    key={index}
                    className="flex-item"
                    style={{
                      backdropFilter: "blur(40px)",
                      backgroundColor: "rgba(20, 0, 20, 0.2)",
                      borderRadius: 25,
                      height: 'auto',
                    }}
                  >
                    <div
                      className="imgVenues"
                      key={index}
                      onClick={() => {
                        handleGridContainerClick(event, index);
                        navigate(`/info_event`, { state: { eventData: event } });
                      }}
                      style={{
                        backgroundImage: `url(${event.imageUrl})`,
                        backgroundSize: "cover",
                        borderRadius: "25px 0 0 25px",
                        height: "auto",
                      }}
                    ></div>
                    <div className="caption" style={{ padding: 10 }}>
                      <div
                        key={index}
                        onClick={() => {
                          handleGridContainerClick(event, index);
                          navigate(`/info_event`, { state: { eventData: event } });
                        }}
                      >
                        <h3>{event.caption}</h3>
                        <div style={{ color: "#FFFF00"}}>
                          {event?.popularity >= 5  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                              </span>
                            ) : event?.popularity >= 4.5 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                              </span>
                            ) : event?.popularity >= 4 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : event?.popularity >= 3.5  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : event?.popularity >= 3  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : event?.popularity >= 2.5 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : event?.popularity >= 2  ?(
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : event?.popularity >= 1.5 ? (
                              <span>
                                <i className="bi bi-star-fill"></i>
                                <i className="bi bi-star-half"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                                <i className="bi bi-star"></i>
                              </span>
                            ) : event?.popularity >= 1  ?(
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
                            )
                          }
                        </div>
                        <p>{event.date}</p>
                        <p>{event.time}</p>
                        <p>
                          <i className="bi bi-geo-alt-fill"></i> {event.location}
                        </p>
                      </div>
                      <div
                        className="buyTicket"
                        onClick={() => setBuyTicketPopupData(event)}
                        style={{
                          backgroundColor: "#E2346E",
                          textAlign: "center",
                          borderRadius: 50,
                          marginTop: "35px",
                          color: "#fff",
                          padding: 5,
                        }}
                      >
                        <span>Buy a ticket</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="container">
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    <i className="bi bi-chevron-left"></i>
                    {" "}
                    Previous
                  </button>
                  <span className="pagination-page">Page {currentPage}</span>
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    disabled={currentPage * 12 >= eventData.length}
                    className="pagination-button"
                  >
                    Next
                    {" "}
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {searchTerm !== "" && (searchResults.length === 0 || !isSearchHovered) ? (
          <div style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
            {searchResults.length === 0 ? `No results found for "${searchTerm}"` : " "}
          </div>
        ) : null}
        {selectedEventData && <InfoEvent data={selectedEventData} onClose={() => setSelectedEventData(null)} />}
        {buyTicketPopupData && (
          <Popup
            eventData={buyTicketPopupData}
            buyTicketPopupData={buyTicketPopupData}
            onClose={() => setBuyTicketPopupData(null)}
          />
        )}

      </div>

      <div className="container" style={{ marginTop: 70, maxWidth:'90%' }}>
        <div 
          style={{ 
            width: "100%", 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center" 
          }}
        >
          <div className="EventSlideHeaderText1">Hot Venues</div>
          <div className="EventSlideHeaderText2">ดูทั้งหมด &gt;</div>
        </div>
      </div>
      <div className="container" style={{ paddingTop: "0px", paddingBottom: "30px" }}>
        <img src="img/testbanner1.jpg" style={{ width: "100%", borderRadius: "10px" }}></img>
      </div>
    </div>
  );
}

export default Event;
