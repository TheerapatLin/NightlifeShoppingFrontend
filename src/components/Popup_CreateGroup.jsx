// Popup_CreateGroup.jsx

import React, { useState } from "react";
import "../public/css/Popup.css";
import Swal from 'sweetalert2';


const PopupCreateGroup = ({ onClose, createGroupChatPopupData }) => {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);


  const handleCreateGroup = () => {
    // ตรวจสอบว่ากรอกชื่อกลุ่มหรือไม่
    if (!groupName) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter a group name!',
      });
      return;
    }

    // สร้างข้อมูลกลุ่มสนทนาใหม่
    const newGroupChat = {
      eventId: createGroupChatPopupData.eventId,
      imageUrl: groupImage,
      memberCount: 0, // เริ่มต้นที่ 0 สมาชิก
      isGroupChat: true,
      messages: [] // เริ่มต้นด้วยข้อความว่าง
    };

    // ทำการเก็บข้อมูลกลุ่มสนทนาใหม่ลงในไฟล์ data_venues.json
    fetch("/data/data_venue.json")
      .then((response) => response.json())
      .then((data) => {
        // เพิ่มข้อมูลกลุ่มสนทนาใหม่ลงในอาร์เรย์ของข้อมูล
        const newData = data.map((venue) => {
          if (venue.eventId === createGroupChatPopupData.eventId) {
            return {
              ...venue,
              eventchats: [...venue.eventchats, newGroupChat]
            };
          }
          return venue;
        });

        // ทำการบันทึกข้อมูลที่แก้ไขลงในไฟล์ data_venues.json
        fetch("/data/data_venue.json", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newData)
        })
          .then((response) => response.json())
          .then((result) => {
            console.log("New group chat created:", newGroupChat);
            onClose(); // ปิด Popup
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Group chat created successfully!',
            });
          })
          .catch((error) => {
            console.error("Error updating data:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div className="popup">
      <div className="popup-content Create-Group-Chat">
        <div style={{ fontStyle: "normal", display: "flex", alignItems: "center" }}>
          <p style={{ color: "#31ff64", fontSize: 25, fontWeight: "bold" }}>Create Group Chat</p>
          <i
            className="bi bi-x"
            style={{ fontStyle: "normal", marginLeft: "auto", fontSize: 30 }}
            onClick={onClose}
          ></i>
        </div>
        <div style={{display:'flex', flexDirection: 'column' , paddingBlock:25, gap:'10px'}}>
          <div>
            <i className="bi bi-people-fill"  style={{fontSize:30, color:'#E2346E',marginRight:10}}></i> 
            {" "}
            <input
              type="text"
              placeholder="Name Groupchat"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                background: '#EFEFEF',
                borderRadius: '100px',
                padding: 5,
                width: '70%',
                height: 'auto',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
                fontSize: 16,
              }}
            />
          </div>
          <div>
            <i className="bi bi-people-fill"  style={{fontSize:30, color:'#E2346E',marginRight:10}}></i> 
            {" "}
            <input
              type="text"
              placeholder="Name Groupchat"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                background: '#EFEFEF',
                borderRadius: '100px',
                padding: 5,
                width: '70%',
                height: 'auto',
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
                fontSize: 16,
              }}
            />
          </div>
          {/* <p>Image</p>
          <input
            type="file"
            onChange={(e) => setGroupImage(e.target.files[0])}
            style={{
              background: '#EFEFEF',
              borderRadius: '100px',
              padding: 5,
              width: '70%',
              height: 'auto',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
              fontSize:16,
            }}
          /> */}
        </div>
        <div style={{ display:'flex', gap:'10px', justifyContent: 'center', marginTop:10}}>
          <button onClick={handleCreateGroup} style={{ backgroundColor: '#41B656' }}>Create</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PopupCreateGroup;
