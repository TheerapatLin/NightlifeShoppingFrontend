// info_venues.jsx

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../public/css/Container_grid.css";
import "../public/css/info_event.css";
import Popup from "../components/Popup";
import PopupCreateGroup from "../components/Popup_CreateGroup"
import PopupCreateGroup2 from "../components/Popup_CreateGroup2"
import PopupChat from "../components/Popup_Chat";
import PopupReservation from "../components/Popup_Reservation"
import Swal from 'sweetalert2';
import { useGlobalEvent } from '../context/GlobalEventContext'; // import GlobalEventContext

const InfoVenues = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eventData = location.state?.eventData;
  const containerRef = useRef(null);
  const { isScrolled } = useGlobalEvent(); // เรียกใช้ isScrolled จาก GlobalEventContext

  const [isHeartClicked, setIsHeartClicked] = useState(false);
  const [reservationSticky, setReservationSticky] = useState(false); // เพิ่ม state สำหรับการเลื่อนตำแหน่งของ reservation


  const handleBack = () => {
    navigate("/venues");
  };

  const handleDeleteChat = (eventData, chatIndex) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Deleted!',
          'Your chat has been deleted.',
          'success'
        );
      }
    });
  };
  

  // const [selectedEventData, setSelectedEventData] = useState(null);
  const [buyTicketPopupData, setBuyTicketPopupData] = useState(null);
  const [reservationPopupData, setReservationPopupData] = useState(null);
  const [createGroupChatPopupData, setCreateGroupChatPopupData] = useState(null);
  const [groupChatPopupData, setGroupChatPopupData] = useState(null);

  useEffect(() => {
    // ตรวจสอบค่า isScrolled เพื่อกำหนดค่า reservationSticky
    setReservationSticky(isScrolled);
  }, [isScrolled]);

  return (
    <div ref={containerRef}>
      <div className="container" style={{ paddingTop: "150px", maxWidth: "90%"  }}>
      <div
        style={{
          color: "white",
          textShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
          fontSize: "25px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <i className="bi bi-chevron-left" style={{ fontStyle: "normal" }} onClick={handleBack}>
          {" "}
          details
        </i>
        <div style={{ marginLeft: "auto" }}>
          <i className="bi bi-share-fill"></i>
        </div>
      </div>
      </div>
      <div className="container" style={{ maxWidth: "90%" }}>  
        {eventData && (
          <div className="flex-item01"               
          style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 50,
              marginTop: 50,
              boxShadow: "0 0 20px 0px rgba(0, 0, 0, 0.15)",
              borderRadius: "25px 25px 25px 25px",
              backdropFilter: "blur(50px)",
            }}>
            <div
              className="imgVenues"
              style={{
                backgroundImage: `url(${eventData.imageUrl})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            ></div>
            <div className="content">
              <div style={{ display:"flex", alignItems:"center"}}>
                <h1 style={{ color: "#EFEFEF", fontSize: 40 }}>{eventData.caption}</h1>
                <div style={{ marginLeft: "auto", fontSize:25 }}>
                  {isHeartClicked ? <i className="bi bi-heart-fill" style={{ color:'#E2346E' }} onClick={() => setIsHeartClicked(!isHeartClicked)}></i> : <i className="bi bi-heart" style={{ color:'#fff' }} onClick={() => setIsHeartClicked(!isHeartClicked)}></i> }
                </div>
              </div>
              <div style={{ color: "#FFFF00", fontSize:20, marginBlock:15 }}>
                {eventData?.popularity >= 5  ?(
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill"></i>
                  </span>
                ) : eventData?.popularity >= 4.5 ? (
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-half"></i>
                  </span>
                ) : eventData?.popularity >= 4 ? (
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                ) : eventData?.popularity >= 3.5  ?(
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-half" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star"></i>
                  </span>
                ) : eventData?.popularity >= 3  ?(
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                ) : eventData?.popularity >= 2.5 ? (
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-half" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                ) : eventData?.popularity >= 2  ?(
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                ) : eventData?.popularity >= 1.5 ? (
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star-half" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                ) : eventData?.popularity >= 1  ?(
                  <span>
                    <i className="bi bi-star-fill" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                    <i className="bi bi-star" style={{ marginRight: "5px" }}></i>
                  </span>
                )}
              </div>
              <p style={{ color: "#31ff64" }}>
                <i className="bi bi-calendar3" style={{ fontStyle: "normal" }}>
                  {" "}
                  Date :{" "}
                </i>
                {eventData.date}
              </p>
              <p style={{ color: "#31ff64" }}>
                <i className="bi bi-clock" style={{ fontStyle: "normal" }}>
                  {" "}
                  Time :{" "}
                </i>
                {eventData.time}
              </p>
              <p style={{ color: "#31ff64" }}>
                <i className="bi bi-geo-alt-fill" style={{ fontStyle: "normal" }}>
                  {" "}
                  Location :{" "}
                </i>
                {eventData.location}
              </p>
              <div style={{ color: "#31ff64" }}>
                  Description:{" "}
                <p style={{ color: "#ffff" }}>{eventData.description}</p>
              </div>
              <p style={{marginTop:'50px', marginBottom:'10px', color: "#31ff64"}}>Group Chat :</p>
              <div className="chatEvent" style={{style:'none'}}>
                <div className="createGroupChat" onClick={() => setCreateGroupChatPopupData(eventData)}>
                  <div className="createGroupChatButton">
                    <i className="bi bi-plus-lg" style={{ fontSize:'40px', color:"#ffff", paddingTop:'5px' }}></i>
                  </div>
                  <p>Create group</p>
                </div>
                {eventData.eventchats &&
                  eventData.eventchats.map((chat, index) => (
                    <div className="groupChat" key={index}>
                      <p className="deleteChat" onClick={() => handleDeleteChat(eventData, index)}>
                        <i className="bi bi-x-lg"></i>
                      </p>
                      <p className="statusChat"> 
                        {chat.messages.length > 99 ? "99+" : chat.messages.length}  {/*ไว้สำหรับเช็คจำนวนข้อความ */}
                      </p>
                      <div
                        onClick={() => setGroupChatPopupData(chat)}
                        style={{
                          backgroundImage: `url(${chat.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                          height: "80px",
                          width: "80px",
                          borderRadius: "50%",
                        }}
                      ></div>
                      <p><i className="bi bi-people-fill" style={{ fontStyle: "normal" }}>{" "}{chat.memberCount}</i></p>
                      </div>
                  ))}
              </div>
              <div className="buyticket">
                <h3 style={{ color: "#5F5F5F", marginLeft: 20 }}>Starting Price :</h3>
                <h3 style={{ color: "#5F5F5F", marginLeft: 20 }}>฿ 950</h3>
                <div className="buy" style={{ marginLeft: "auto" }}>
                  <p onClick={() => setBuyTicketPopupData(eventData)}>Buy Tickets</p>
                </div>
              </div>
              <div className="visible">
                <div>
                  <p onClick={() => setBuyTicketPopupData(eventData)}>Buy Tickets</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="box-reservation" style={{ position: 'fixed', top: isScrolled ? '92%' : '95%', transform: isScrolled ? '' : '', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth:'90%', margin: '0 auto', width:'25rem' }}>
        <div className="reservation">
          <div>
            <p onClick={() => setReservationPopupData(eventData)}>GET RESERVATION</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth:'90%' }}>
        <div className="gallery">
        {eventData?.gallery && eventData.gallery.map((image, index) => (
          <img key={index} src={image.url} style={{ width:'100%', marginBottom:10, borderRadius:25 }} />
        ))}
        </div>
      </div>
      {buyTicketPopupData && (
        <Popup
          eventData={eventData}
          buyTicketPopupData={buyTicketPopupData}
          onClose={() => setBuyTicketPopupData(null)}
        />
      )}
      {reservationPopupData && (
        <PopupReservation
          eventData={eventData}
          reservationPopupData={reservationPopupData}
          onClose={() => setReservationPopupData(null)}
        />
      )}
      {createGroupChatPopupData && (
        <PopupCreateGroup
          createGroupChatPopupData={createGroupChatPopupData}
          onClose={() => setCreateGroupChatPopupData(null)}
        />
      )}
      {groupChatPopupData && (
        <PopupChat
          chatData={groupChatPopupData}
          onClose={() => setGroupChatPopupData(null)}
        />
      )}
    </div>
  );
};

export default InfoVenues;
