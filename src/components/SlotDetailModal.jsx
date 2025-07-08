// components/SlotDetailModal.jsx (ไฟล์สมบูรณ์ พร้อมแก้ Swal ให้ขึ้นหน้าสุด ไม่มักง่าย)

import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Swal from "sweetalert2";
import axios from "axios";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

function SlotDetailModal({ open, onClose, slot, refreshSlots }) {
  const [formData, setFormData] = useState({
    cost: slot.extendedProps.expenses || 0,
    participantLimit: slot.extendedProps.participantLimit || 1,
    notes: slot.extendedProps.description || "",
    startTime: dayjs(slot.start),
    endTime: dayjs(slot.end),
  });

  useEffect(() => {
    setFormData({
      cost: slot.extendedProps.expenses || 0,
      participantLimit: slot.extendedProps.participantLimit || 1,
      notes: slot.extendedProps.description || "",
      startTime: dayjs(slot.start),
      endTime: dayjs(slot.end),
    });
  }, [slot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (name, newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_API_URL_LOCAL}/activity-slot/${slot.id}`,
        {
          cost: parseInt(formData.cost),
          participantLimit: parseInt(formData.participantLimit),
          notes: formData.notes,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
        },
        {
          headers: { "device-fingerprint": "12345678" },
          withCredentials: true,
        }
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        showConfirmButton: false,
        timer: 2000,
        didOpen: () => {
          document.querySelector(".swal2-container").style.zIndex = "1600";
        },
      });

      refreshSlots();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
        didOpen: () => {
          document.querySelector(".swal2-container").style.zIndex = "1600";
        },
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: "ต้องการลบรอบนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่ ลบเลย",
      cancelButtonText: "ยกเลิก",
      didOpen: () => {
        document.querySelector(".swal2-container").style.zIndex = "1600";
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_BASE_API_URL_LOCAL}/activity-slot/${slot.id}`,
          {
            headers: { "device-fingerprint": "12345678" },
            withCredentials: true,
          }
        );
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "ลบรอบกิจกรรมสำเร็จ",
          showConfirmButton: false,
          timer: 2000,
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "1600";
          },
        });
        refreshSlots();
        onClose();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "ไม่สามารถลบรอบได้";
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: msg,
          didOpen: () => {
            document.querySelector(".swal2-container").style.zIndex = "1600";
          },
        });
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "white",
          p: 4,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 420,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <h2 className="text-lg font-semibold">{slot.title}</h2>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
          <TimePicker
            label="เวลาเริ่ม"
            value={formData.startTime}
            onChange={(newValue) => handleTimeChange("startTime", newValue)}
            ampm={false}
            format="HH:mm"
          />
          <TimePicker
            label="เวลาสิ้นสุด"
            value={formData.endTime}
            onChange={(newValue) => handleTimeChange("endTime", newValue)}
            ampm={false}
            format="HH:mm"
          />
        </LocalizationProvider>

        <TextField
          label="ราคา"
          name="cost"
          type="number"
          value={formData.cost}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="จำนวนคนสูงสุด"
          name="participantLimit"
          type="number"
          value={formData.participantLimit}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="รายละเอียด"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="error" onClick={handleDelete}>
            ลบ
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            บันทึก
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default SlotDetailModal;
