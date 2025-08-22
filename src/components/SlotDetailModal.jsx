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
import { getDeviceFingerprint } from "../lib/fingerprint";

function SlotDetailModal({ open, onClose, slot, refreshSlots }) {
  const [formData, setFormData] = useState({
    cost: slot.extendedProps.expenses || 0,
    participantLimit: slot.extendedProps.participantLimit || 1,
    notes: slot.extendedProps.description || "",
    startTime: dayjs(slot.start),
    endTime: dayjs(slot.end),
    // ✅ เพิ่มราคา subscription
    premiumPrice: slot.extendedProps.subscriptionPricing?.premium || 0,
    platinumPrice: slot.extendedProps.subscriptionPricing?.platinum || 0,
    enableSubscriptionPricing: slot.extendedProps.subscriptionPricing?.enabled || false,
  });

  useEffect(() => {
    setFormData({
      cost: slot.extendedProps.expenses || 0,
      participantLimit: slot.extendedProps.participantLimit || 1,
      notes: slot.extendedProps.description || "",
      startTime: dayjs(slot.start),
      endTime: dayjs(slot.end),
      // ✅ เพิ่มราคา subscription
      premiumPrice: slot.extendedProps.subscriptionPricing?.premium || 0,
      platinumPrice: slot.extendedProps.subscriptionPricing?.platinum || 0,
      enableSubscriptionPricing: slot.extendedProps.subscriptionPricing?.enabled || false,
    });
  }, [slot]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // สำหรับ checkbox
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
    // สำหรับช่องราคาและจำนวนคน ให้รับเฉพาะตัวเลข
    else if (name === 'cost' || name === 'participantLimit' || name === 'premiumPrice' || name === 'platinumPrice') {
      // ลบทุกอย่างที่ไม่ใช่ตัวเลข
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTimeChange = (name, newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    try {
      const fp = await getDeviceFingerprint();
      await axios.patch(
        `${import.meta.env.VITE_BASE_API_URL_LOCAL}/activity-slot/${slot.id}`,
        {
          cost: parseInt(formData.cost),
          participantLimit: parseInt(formData.participantLimit),
          notes: formData.notes,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          // ✅ เพิ่ม subscription pricing
          subscriptionPricing: {
            regular: parseInt(formData.cost) || 0,
            premium: parseInt(formData.premiumPrice) || 0,
            platinum: parseInt(formData.platinumPrice) || 0,
            enabled: formData.enableSubscriptionPricing,
          },
        },
        {
          headers: { "device-fingerprint": fp },
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
        const fp = await getDeviceFingerprint();
        await axios.delete(
          `${import.meta.env.VITE_BASE_API_URL_LOCAL}/activity-slot/${slot.id}`,
          {
            headers: { "device-fingerprint": fp },
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
          label="ราคา - Regular"
          name="cost"
          type="text"
          value={formData.cost}
          onChange={handleChange}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            style: { MozAppearance: 'textfield' },
            onWheel: (e) => e.preventDefault()
          }}
          sx={{
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              display: 'none',
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
          fullWidth
        />

        {/* ✅ Subscription Pricing Section */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <input
              type="checkbox"
              id="enableSubscriptionPricing"
              name="enableSubscriptionPricing"
              checked={formData.enableSubscriptionPricing}
              onChange={handleChange}
              style={{ marginRight: 8 }}
            />
            <label htmlFor="enableSubscriptionPricing" style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
              🎯 เปิดใช้ราคาพิเศษสำหรับสมาชิก
            </label>
          </Box>
          
          {formData.enableSubscriptionPricing && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="💎 Premium Price"
                name="premiumPrice"
                type="text"
                value={formData.premiumPrice}
                onChange={handleChange}
                size="small"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: { MozAppearance: 'textfield' },
                  onWheel: (e) => e.preventDefault()
                }}
                sx={{
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    display: 'none',
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
              
              <TextField
                label="👑 Platinum Price"
                name="platinumPrice"
                type="text"
                value={formData.platinumPrice}
                onChange={handleChange}
                size="small"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  style: { MozAppearance: 'textfield' },
                  onWheel: (e) => e.preventDefault()
                }}
                sx={{
                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    display: 'none',
                  },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
            </Box>
          )}
          
          <Box sx={{ mt: 1, fontSize: 12, color: 'grey.600' }}>
            💡 ราคาพิเศษจะแสดงให้สมาชิก Premium และ Platinum
          </Box>
        </Box>

        <TextField
          label="จำนวนคนสูงสุด"
          name="participantLimit"
          type="text"
          value={formData.participantLimit}
          onChange={handleChange}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            style: { MozAppearance: 'textfield' }
          }}
          sx={{
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
              display: 'none',
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
          }}
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
