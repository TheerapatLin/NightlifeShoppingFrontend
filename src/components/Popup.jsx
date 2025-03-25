// Popup.jsx

import React, { useState } from "react";
import "../public/css/Popup.css";
import "../public/css/Animation.css"; // เพิ่ม CSS สำหรับ animation
import NumberStepper from "./TextMobileStepper"; // เพิ่ม import สำหรับ NumberStepper

const Popup = ({ eventData, buyTicketPopupData, onClose }) => {
  const [ticketQuantity, setTicketQuantity] = React.useState(0);
  const [showPopup, setShowPopup] = useState(true); // เพิ่ม state สำหรับการแสดง popup

  const handleTicketQuantityChange = (quantity) => {
    setTicketQuantity(quantity);
  };

  // Function เมื่อคลิกปิด popup
  const handleClose = () => {
    setShowPopup(false); // ปิด popup
    setTimeout(onClose, 500); // เรียกใช้ onClose function หลังจาก animation เสร็จสิ้น (500ms)
  };

  if (!buyTicketPopupData) {
    return null; // ไม่แสดง Popup ถ้าไม่มีข้อมูล
  }

  return (
    <div className = 'popup'>
      <div className={`popup-content ${showPopup ? '' : 'slideOut'}`}>
        <div style={{ fontStyle: "normal", display: "flex", alignItems: "center" }}>
          <p style={{ color: "#31ff64", fontSize: 25, fontWeight: "bold" }}>Choose card type</p>
          <i
            className="bi bi-x"
            style={{ fontStyle: "normal", marginLeft: "auto", fontSize: 30 }}
            onClick={handleClose}
          ></i>
        </div>
        {/* แสดงราคาต่าง ๆ ตามที่เพิ่มใน data.json */}

        <div className="content-flexDirection">
          <div style={{ width: "100%" }}>
            {eventData.tickets.map((ticket, index) => (
              <div key={ticket.ticketId} style={{ width: "100%", alignItems: "center" }}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    borderRadius: "10px",
                    minHeight: "100px",
                    // margin: "10px",
                    padding: "10px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "start", flex: "1"}}>
                    <div style={{ fontSize: "22px", fontWeight: "900" }}>{ticket.ticketName}</div>
                    <div style={{ fontSize: "30px", fontWeight: "900", color: "black" }}>฿{ticket.price}</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "rgba(0,0,0,.4)" }}>
                      {eventData.location} | {ticket.date === "" ? ticket.date : eventData.date} |
                      {ticket.time === "" ? ticket.time : eventData.time}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "end",
                      flex: "1",
                      maxWidth:'250px'
                    }}
                  >
                    <NumberStepper />
                  </div>
                </div>
                {index < eventData.tickets.length - 1 && <hr style={{ width: "100%" }} />}
              </div>
            ))}
          </div>
          <div className="order-summary" style={{ flex: "50%" ,padding:'20px'}}>
            <p
              style={{
                color: "#000",
                fontSize: 23,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Order summary
            </p>
            <div style={{ display: "flex", paddingInline: "10px" }}>
              <p style={{ color: "#000", fontSize: 20 }}>Quantity: {1}</p>
              <p style={{ color: "#000", fontSize: 20, marginLeft: "auto" }}>฿ {0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
