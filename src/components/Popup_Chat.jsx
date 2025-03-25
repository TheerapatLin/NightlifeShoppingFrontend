//Popup_Chat.jsx

import React, { useState } from "react";
import "../public/css/Popup.css";
import userData from "../../public/data/data_user.json";

const PopupChat = ({ chatData, onClose }) => {
  // State เก็บข้อความที่ผู้ใช้พิมพ์
  const [newMessage, setNewMessage] = useState("");

  // ฟังก์ชันสำหรับส่งข้อความ
  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      // สร้างข้อความใหม่
      const message = {
        userID: "U00005", // แทนที่ด้วย ID ของผู้ใช้ปัจจุบัน
        content: newMessage,
        timestamp: new Date().toISOString() // ใช้เวลาปัจจุบัน
      };
      // จำลองการส่งข้อความโดยการเพิ่มข้อความใหม่ลงใน chatData
      // โดยการเพิ่ม message ใหม่ไปยัง chatData.messages
      chatData.messages.push(message);
      // ตั้งค่าให้ newMessage เป็นค่าว่าง เพื่อให้ input ว่าง
      setNewMessage("");
    }
  };

  if (!chatData) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <p style={{ color: "#31ff64", fontSize: 25, fontWeight: "bold" }}>Group Chat 01</p>
          <i
            className="bi bi-x"
            style={{ marginLeft: "auto", fontSize: 30, cursor: "pointer" }}
            onClick={onClose}
          ></i>
        </div>
        <div 
          className="chat_content" 
          style={{
            backgroundImage: `url(${chatData.imageUrl})`,
            backgroundSize: "cover",
            height: "100%",
            padding:20, 
          }}
        >
          <div className="chat_container">
            {/* Render chat messages from chatData */}
            {chatData.messages.map((message, index) => {
              // Find sender's data from userData.json using userID
              const senderData = userData.find((user) => user.userID === message.userID);
              return (
                <div key={index} className="chat_message">
                  {/* Render sender's name and profile */}
                  <div className="sender_info">
                    <img src={senderData.profileImage} alt="Profile" className="profile_image" />
                    <p className="sender_name">{senderData.userName}</p>
                  </div>
                  {/* Render message content */}
                  <div className="message_content">
                    <p style={{color:'#000'}}>{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input for new message */}
          <div className="input_container">
            <input
              type="text"
              placeholder="Type your message here..."
              className="message_input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
            />
            <i 
              className="bi bi-send-fill" 
              style={{ fontSize:30, display: "block", margin: "auto", color:'#E2346E', cursor: "pointer", paddingLeft:20 }}
              onClick={sendMessage}
            ></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupChat;
