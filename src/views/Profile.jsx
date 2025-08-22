// ProfilePage.jsx

import React, { useEffect, useState } from "react";
import userData from "../../public/data/data_user.json";
import eventData from "../../public/data/data_event.json";
import imgCoin from "../img/Profile/coin.png";
import imgExchange from "../img/Profile/Exchange_money_for_coins.png";
import imgQrcode from "../img/Profile/qrcode.png";
import imgChampagne from "../img/Profile/champagne-glass.png";
import "../public/css/Animation.css";
import "../public/css/Popup.css";
import { Link, useLocation } from "react-router-dom";
import ManageProfile from "../views/ManageProfile";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

const ProfilePage = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [deals, setDeals] = useState([]);

  const [showPopup, setShowPopup] = useState(true);
  const location = useLocation(); // ใช้ hook useLocation จาก React Router

  useEffect(() => {
    const fetchActivitySlots = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/activity-slot`, {
          withCredentials: true,
        });

        const mappedEvents = res.data.map((slot) => ({
          id: slot._id,
          title:
            slot.activityId?.nameTh || slot.activityId?.nameEn || "กิจกรรม",
          start: slot.startTime,
          end: slot.endTime,
          extendedProps: {
            description: slot.notes,
            expenses: slot.cost,
            participantLimit: slot.participantLimit,
            location: slot.location,
            creator: slot.creator,
            activityId: slot.activityId?._id,
            slotId: slot._id,
            // ✅ เพิ่ม subscription pricing
            subscriptionPricing: slot.subscriptionPricing,
          },
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error fetching activity slots:", err);
      }
    };

    fetchActivitySlots();
  }, []);

  useEffect(() => {
    const userId = "U00005";
    const currentUser = userData.find((user) => user.userID === userId);
    setUser(currentUser);

    if (currentUser && currentUser.myEvent) {
      const userEventIds = Array.isArray(currentUser.myEvent.eventId)
        ? currentUser.myEvent.eventId
        : [currentUser.myEvent.eventId];
      const userEvents = eventData.filter((event) =>
        userEventIds.includes(event.eventId)
      );
      setEvents(userEvents);
    }

    if (currentUser && currentUser.myVenues) {
      const userVenueIds = Array.isArray(currentUser.myVenues.venueId)
        ? currentUser.myVenues.venueId
        : [currentUser.myVenues.venueId];
      const userVenues = venueData.filter((venue) =>
        userVenueIds.includes(venue.venueId)
      );
      setVenues(userVenues);
    }

    if (currentUser && currentUser.myDeals) {
      const userDealIds = Array.isArray(currentUser.myDeals.dealsId)
        ? currentUser.myDeals.dealsId
        : [currentUser.myDeals];
      const userDeals = dealsData.filter((deals) =>
        userDealIds.includes(deals.deals)
      );
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    setTimeout(onClose, 500);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.5)",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className={`popup-right ${showPopup ? "" : "slideOut"}`}
        style={{ display: "block", maxWidth: "100%" }}
      >
        <div
          style={{
            fontStyle: "normal",
            display: "flex",
            alignItems: "center",
            marginInline: 20,
          }}
        >
          <p style={{ color: "#31ff64", fontSize: 25, fontWeight: "bold" }}>
            Profile Page
          </p>
          <i
            className="bi bi-x"
            style={{ fontStyle: "normal", marginLeft: "auto", fontSize: 30 }}
            onClick={handleClose}
          ></i>
        </div>
        <div>
          {user && (
            <img
              src={user.profileImage}
              alt="Profile"
              className="profile-image"
              style={{ height: "450px", filter: "blur(2px)" }}
            />
          )}
        </div>
        <div
          className="popup-container"
          style={{
            position: "relative",
            top: "-200px",
            marginBottom: "-180px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="photo-profile"
            style={{
              marginBottom: "-80px",
              position: "relative",
              zIndex: "999",
            }}
          >
            {user && (
              <img
                src={user.profileImage}
                alt="Profile"
                className="profile-image col66"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  boxShadow: "rgb(38, 57, 77) 0px 20px 30px -10px",
                }}
              />
            )}
          </div>
          <div
            className="popup-content Profile"
            style={{ background: "rgba(206, 206, 206, 0.5)" }}
          >
            <div
              className="profile-username"
              style={{
                flex: 1,
                overflow: "auto",
                padding: "inherit",
                marginBottom: "20px",
                marginTop: "50px",
              }}
            >
              {user && (
                <div style={{}}>
                  <h2 style={{ color: "#31ff64" }}>{user.userName}</h2>
                </div>
              )}
            </div>
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "inherit",
                backgroundColor: "rgb(43,43,43)",
                borderRadius: "100px",
                display: "flex",
                justifyContent: "space-around",
                boxShadow:
                  "rgb(5 5 38) 0px 30px 60px -12px inset, rgb(0 0 0 / 63%) 0px 18px 36px -18px inset",
                marginBlock: 20,
              }}
            >
              <div>
                <h3 style={{ color: "#fff" }}>Follower</h3>
                {user && (
                  <div style={{}}>
                    <h3 style={{ color: "#E2346E" }}>{user.follower}</h3>
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ color: "#fff" }}>Following</h3>
                {user && (
                  <div style={{}}>
                    <h3 style={{ color: "#E2346E" }}>{user.following}</h3>
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "inherit",
                backgroundColor: "rgb(43,43,43)",
                borderRadius: "100px",
                display: "flex",
                justifyContent: "space-around",
                boxShadow:
                  "rgb(5, 5, 38) 0px -20px 60px -12px inset, rgba(0, 0, 0, 0.63) 0px -20px 36px -18px inset",
              }}
            >
              <div style={{}}>
                <h3 style={{ color: "#fff" }}>Coin</h3>
                {user && (
                  <div style={{}}>
                    <h3 style={{ color: "#E2346E" }}>
                      <img src={imgCoin} style={{ width: 15 }} />{" "}
                      {user.myCoin.total}
                    </h3>
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ color: "#fff" }}>Point</h3>
                {user && (
                  <div style={{}}>
                    <h3 style={{ color: "#E2346E" }}>
                      <img src={imgChampagne} style={{ width: 15 }} />{" "}
                      {user.myPoint}
                    </h3>
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginTop: 20,
                padding: "inherit",
              }}
            >
              <div className="Add_Coin">
                <img src={imgCoin} style={{ width: 50 }} />
                <p>Add Coin</p>
              </div>
              <div className="Scan">
                <img src={imgQrcode} style={{ width: 50 }} />
                <p>Scan</p>
              </div>
              <div className="Widthdraw">
                <img src={imgExchange} style={{ width: 50 }} />
                <p>Widthdraw</p>
              </div>
            </div>
          </div>
          <div
            className="popup-content Manage-profile"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "inherit",
              background: "rgba(206, 206, 206, 0.5)",
            }}
          >
            <div>
              <h3
                style={{
                  backgroundColor: "#E2346E",
                  color: "#FFF",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "start",
                  flexGrow: 1,
                  paddingBlock: 10,
                  borderBottom: "none",
                }}
              >
                <Link
                  to="/ManageProfile"
                  onClick={handleClose}
                  className={`${
                    location.pathname === "/ManageProfile" ? "active" : ""
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <i
                    className="bi bi-person-fill"
                    style={{ marginInline: 20, fontStyle: "normal" }}
                  >
                    {" "}
                    Manage Profile
                  </i>
                </Link>
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                }}
              >
                <Link
                  to="/MyPurchase"
                  onClick={handleClose}
                  className={`${
                    location.pathname === "/MyPurchase" ? "active" : ""
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <i
                    className="bi bi-handbag-fill"
                    style={{ marginInline: 20, fontStyle: "normal" }}
                  >
                    {" "}
                    MY PURCHASE
                  </i>
                </Link>
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                }}
              >
                <Link
                  to="/MyTicket"
                  onClick={handleClose}
                  className={`${
                    location.pathname === "/MyTicket" ? "active" : ""
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <i
                    className="bi bi-ticket-detailed-fill"
                    style={{ marginInline: 20, fontStyle: "normal" }}
                  >
                    {" "}
                    MY TICKET
                  </i>
                </Link>
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                }}
              >
                <Link
                  to="/MyVoucher"
                  onClick={handleClose}
                  className={`${
                    location.pathname === "/MyVoucher" ? "active" : ""
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <i
                    className="bi bi-ticket-perforated-fill"
                    style={{ marginInline: 20, fontStyle: "normal" }}
                  >
                    {" "}
                    MY VOUCHER
                  </i>
                </Link>
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                }}
              >
                <Link
                  to="/MyBooking"
                  onClick={handleClose}
                  className={`${
                    location.pathname === "/MyBooking" ? "active" : ""
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <i
                    className="bi bi-journal-bookmark"
                    style={{ marginInline: 20, fontStyle: "normal" }}
                  >
                    {" "}
                    MY BOOKING
                  </i>
                </Link>
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                  borderBottom: "none",
                }}
              >
                <Link
                  to="/MyCoin"
                  onClick={handleClose}
                  className={`${
                    location.pathname === "/MyCoin" ? "active" : ""
                  }`}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "start",
                  }}
                >
                  <i
                    className="bi bi-coin"
                    style={{ marginInline: 20, fontStyle: "normal" }}
                  >
                    {" "}
                    MY COIN
                  </i>
                </Link>
              </h3>
            </div>
          </div>
          <div
            className="popup-content My-Venues"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "inherit",
              background: "rgba(206, 206, 206, 0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2B2B2B",
              }}
            >
              <h3
                style={{
                  color: "#FFF",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "start",
                  flexGrow: 1,
                  paddingBlock: 10,
                  borderBottom: "none",
                }}
              >
                <i
                  className="bi bi-geo-alt-fill"
                  style={{ marginInline: 20 }}
                ></i>
                My Venue
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  borderBottom: "none",
                  paddingRight: 20,
                }}
              >
                <i
                  className="bi bi-plus-lg"
                  style={{ fontStyle: "normal", color: "rgb(49, 255, 100)" }}
                >
                  {" "}
                  Create Venue
                </i>
              </h3>
            </div>
            <div style={{ flex: 1 }}>
              {venues.length > 0 ? (
                venues.map((venue) => (
                  <div
                    key={venue.venueId}
                    className="myvenue"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        backgroundImage: `url(${venue.imageUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        width: 100,
                        height: 100,
                      }}
                    ></div>
                    <h4 style={{ color: "#fff", paddingInline: 20 }}>
                      {venue.name}
                    </h4>
                    {/* เพิ่มข้อมูลเพิ่มเติมที่ต้องการแสดง เช่น รายละเอียดของ venues เป็นต้น */}
                  </div>
                ))
              ) : (
                <div style={{ paddingInline: 25, color: "#fff" }}>
                  No venue found
                </div>
              )}
            </div>
          </div>
          <div
            className="popup-content My-Event"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "inherit",
              background: "rgba(206, 206, 206, 0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2B2B2B",
              }}
            >
              <h3
                style={{
                  color: "#FFF",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "start",
                  flexGrow: 1,
                  paddingBlock: 10,
                  borderBottom: "none",
                }}
              >
                <i
                  className="bi bi-house-add-fill"
                  style={{ marginInline: 20 }}
                ></i>
                My Event
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  borderBottom: "none",
                  paddingRight: 20,
                  cursor: "pointer",
                }}
                onClick={() => {
                  // เพิ่มโค้ดสำหรับสร้างเหตุการณ์ใหม่ที่นี่
                  // โดยสามารถใช้ Popup หรือ Modal เพื่อให้ผู้ใช้กรอกรายละเอียดเหตุการณ์
                }}
              >
                <i
                  className="bi bi-plus-lg"
                  style={{ fontStyle: "normal", color: "rgb(49, 255, 100)" }}
                >
                  {" "}
                  Create Event
                </i>
              </h3>
            </div>
            <div style={{ flex: 1 }}>
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.eventId}
                    className="myevent"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: "auto",
                    }}
                  >
                    <div
                      style={{
                        backgroundImage: `url(${event.imageUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        width: 70,
                        height: "6rem",
                      }}
                    ></div>
                    <h4 style={{ color: "#fff", paddingInline: 20 }}>
                      {event.caption}
                    </h4>
                    {/* เพิ่มข้อมูลเพิ่มเติมที่ต้องการแสดง เช่น รายละเอียดตั๋ว เป็นต้น */}
                    <div>
                      <button
                        style={{
                          marginRight: "10px",
                          backgroundColor: "#E8E100",
                        }}
                      >
                        <i
                          className="bi bi-pencil-square"
                          style={{ fontStyle: "normal", color: "#000" }}
                        >
                          {" "}
                          Edit{" "}
                        </i>
                      </button>
                      <button
                        style={{
                          marginRight: "10px",
                          backgroundColor: "#ff0000",
                        }}
                      >
                        <i
                          className="bi bi-x-lg"
                          style={{ fontStyle: "normal" }}
                        ></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ paddingInline: 25, color: "#fff" }}>
                  No event found
                </div>
              )}
            </div>
          </div>
          <div
            className="popup-content My-Deal"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "inherit",
              background: "rgba(206, 206, 206, 0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2B2B2B",
              }}
            >
              <h3
                style={{
                  color: "#FFF",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "start",
                  flexGrow: 1,
                  paddingBlock: 10,
                  borderBottom: "none",
                }}
              >
                <i
                  className="bi bi-house-add-fill"
                  style={{ marginInline: 20 }}
                ></i>
                My Deal
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  borderBottom: "none",
                  paddingRight: 20,
                  cursor: "pointer",
                }}
                onClick={() => {
                  // เพิ่มโค้ดสำหรับสร้างเหตุการณ์ใหม่ที่นี่
                  // โดยสามารถใช้ Popup หรือ Modal เพื่อให้ผู้ใช้กรอกรายละเอียดเหตุการณ์
                }}
              >
                <i
                  className="bi bi-plus-lg"
                  style={{ fontStyle: "normal", color: "rgb(49, 255, 100)" }}
                >
                  {" "}
                  Create Deal
                </i>
              </h3>
            </div>
            <div style={{ flex: 1 }}>
              {deals.length > 0 ? (
                deals.map((deal) => (
                  <div
                    key={deal.dealId}
                    className="myvenue"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        backgroundImage: `url(${deal.imageUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        width: 100,
                        height: 100,
                      }}
                    ></div>
                    <h4 style={{ color: "#fff", paddingInline: 20 }}>
                      {deal.name}
                    </h4>
                  </div>
                ))
              ) : (
                <div style={{ paddingInline: 25, color: "#fff" }}>
                  No venue found
                </div>
              )}
            </div>
          </div>
          <div
            className="popup-content About-Us"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "inherit",
              background: "rgba(206, 206, 206, 0.5)",
            }}
          >
            <div>
              <h3
                style={{
                  backgroundColor: "#2B2B2B",
                  color: "#FFF",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "start",
                  flexGrow: 1,
                  paddingBlock: 10,
                  borderBottom: "none",
                }}
              >
                <i
                  className="bi bi-chat-dots-fill"
                  style={{ marginInline: 20 }}
                ></i>
                About Us
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                }}
              >
                <i
                  className="bi bi-shield-fill-exclamation"
                  style={{ marginInline: 20 }}
                ></i>
                PRIVACY
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                }}
              >
                <i className="bi bi-headset" style={{ marginInline: 20 }}></i>
                Contact Us
              </h3>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "start",
                  paddingBlock: 10,
                  color: "#fff",
                  borderBottom: "none",
                }}
              >
                <i
                  className="bi bi-journal-album"
                  style={{ marginInline: 20 }}
                ></i>
                Terms of Service
              </h3>
              {/* <h3 style={{display:'flex', justifyContent:'start', paddingBlock:10, color:'#fff', borderBottom: 'none'}}><i className="bi bi-box-arrow-right" style={{marginInline:20}}></i>LOG OUT</h3> */}
            </div>
          </div>
          <div
            className="popup-content LOG-OUT"
            style={{
              flex: 1,
              overflow: "auto",
              padding: "inherit",
              background: "rgba(206, 206, 206, 0.5)",
            }}
          >
            <div>
              <h3
                style={{
                  backgroundColor: "#FF0000 ",
                  color: "#FFF",
                  borderRadius: "10px 10px 0 0",
                  display: "flex",
                  justifyContent: "start",
                  flexGrow: 1,
                  paddingBlock: 10,
                  borderBottom: "none",
                }}
              >
                <i
                  className="bi bi-box-arrow-right"
                  style={{ marginInline: 20 }}
                ></i>
                LOG OUT
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
