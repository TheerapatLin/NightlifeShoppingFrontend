import React, { useState, useEffect } from "react";
import "../public/css/Popup.css";
import Swal from 'sweetalert2';

const PopupCreateGroup = ({ onClose, createGroupChatPopupData }) => {
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { value: inputGroupName } = await Swal.fire({
        title: "Enter your groupName",
        input: "text",
        inputLabel: "groupName",
        inputPlaceholder: "Enter your groupName",
        inputAttributes: {
          maxlength: "10",
          // autocapitalize: "off",
          // autocorrect: "off"
        }
      });
      if (inputGroupName) {
        setGroupName(inputGroupName);
        Swal.fire(`Entered groupName: ${inputGroupName}`);
      }
    };

    fetchData();
  }, []);
  
};

export default PopupCreateGroup;
