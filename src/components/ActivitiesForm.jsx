// components/AcitivityForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/th";
import { IoIosCloseCircle } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone"; // นำเข้า timezone plugin ที่ถูกต้อง
import utc from "dayjs/plugin/utc"; // นำเข้า utc plugin เพื่อใช้ร่วมกับ timezone

dayjs.extend(utc);
dayjs.extend(timezone);

function ActivitiesForm({
  selectedDate,
  selectedEvent,
  onClose,
  refreshSlots,
}) {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  //ข้อมูล user ที่ล็อคอิน
  const { user } = useAuth();
  // เก็บค่าจากformแบบ object
  const [dataForm, setDataForm] = useState({
    id: "",
    parentId: "",
    date: "",
    activityName: "",
    startTime: dayjs(),
    endTime: dayjs().add(2, "minute"),
    description: "",
    expenses: "",
    participantLimit: "",
    repeat: "none",
    repeatCount: 1,
  });
  const [allActivities, setAllActivities] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/activity`, {
          withCredentials: true,
        });
        //alert(JSON.stringify(res.data, null, 2));
        setAllActivities(res.data); // หรือ res.data ตาม structure API ของคุณ
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);

  // ใช้ตรวจสอบว่ามีการส่ง selectedDate, selectedEvent มาหรือมั้ย
  // ถ้ามีค่า selectedEvent แสดงว่าเราเลือกจะแก้ไขกิจกรรม ถ้ามีค่า selectDate แปลว่าเราจะสร้างกิจกรรม
  useEffect(() => {
    if (selectedEvent) {
      setDataForm({
        id: selectedEvent.id || "",
        parentId: selectedEvent.parentId || "",
        date: dayjs(selectedEvent.start).format("DD MMMM YYYY"),
        activityName: selectedEvent.title || "",
        startTime: selectedEvent.start,
        endTime: selectedEvent.end,
        description: selectedEvent.extendedProps.description || "",
        expenses: selectedEvent.extendedProps.expenses || "",
        participantLimit: selectedEvent.extendedProps.participantLimit || "",
        repeat: selectedEvent.extendedProps.repeat || "none",
        repeatCount: selectedEvent.extendedProps.repeatCount || 1,
      });
      setSelectedImages(
        selectedEvent.extendedProps.images.map((image) => ({
          ...image,
          status: "none",
        })) || []
      );
    } else if (selectedDate) {
      const formattedDate = dayjs(selectedDate).format("DD MMMM YYYY");
      setDataForm((prevData) => ({
        ...prevData,
        date: formattedDate,
        id: "",
        parentId: "",
      }));
    }
  }, [selectedDate, selectedEvent]);

  //เก็บค่าเปลี่ยนแปลงของใน input แล้วเก็บค่า
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTimeChange = (name, newValue) => {
    setDataForm((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
    console.log(name, ":", newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dataForm.date) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาระบุวันที่",
        showConfirmButton: true,
      });
      return;
    } else if (!dataForm.startTime || !dataForm.endTime) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเลือกเวลาเริ่มต้นและสิ้นสุด",
      });
      return;
    }

    try {
      const selectedActivity = allActivities.find(
        (act) =>
          act.nameTh === dataForm.activityName ||
          act.nameEn === dataForm.activityName
      );

      if (!selectedActivity) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาเลือกกิจกรรม",
          showConfirmButton: true,
        });
        return;
      }

      const selectedDateTime = dayjs(selectedDate);
      const startDateTime = selectedDateTime
        .hour(dataForm.startTime.hour())
        .minute(dataForm.startTime.minute())
        .second(0);

      const endDateTime = selectedDateTime
        .hour(dataForm.endTime.hour())
        .minute(dataForm.endTime.minute())
        .second(0);

      const slotPayload = {
        businessId: "1",
        activityId: selectedActivity._id,
        creator: {
          id: user.id,
          name: user.name || "",
          profileImage: user.profileImage || "",
        },
        date: selectedDateTime.toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: selectedActivity.location, // หรือ location จากฟอร์มเพิ่มเติมได้
        cost: parseInt(dataForm.expenses) || 0,
        participantLimit: parseInt(dataForm.participantLimit) || 10,
        requireRequestToJoin: true,
        notes: dataForm.description,
      };

      await axios.post(`${BASE_URL}/activity-slot`, slotPayload, {
        headers: {
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });

      if (refreshSlots) {
        refreshSlots(); // ✅ เรียกเพื่ออัปเดตปฏิทินทันที
      }

      Swal.fire({
        icon: "success",
        title: "สร้างรอบกิจกรรมสำเร็จ",
        showConfirmButton: false,
        timer: 1500,
      });
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถสร้างรอบกิจกรรมได้",
      });
    }
  };

  const handleUpdateAllEvents = () => {
    if (selectedEvent && selectedEvent.parentId) {
      console.log(
        "dataform:",
        dataForm.startTime.format(),
        dataForm.endTime.format()
      );
      const startTimeUTC = dayjs(dataForm.startTime).utc().format();
      const endTimeUTC = dayjs(dataForm.endTime).utc().format();
      console.log("utc:", startTimeUTC, endTimeUTC);
      // สร้าง FormData สำหรับส่งข้อมูลการอัปเดต
      const formData = new FormData();
      formData.append("name", dataForm.activityName);
      formData.append("startTime", startTimeUTC);
      formData.append("endTime", endTimeUTC);
      formData.append("description", dataForm.description);
      formData.append("cost", dataForm.expenses);
      formData.append("participantLimit", dataForm.participantLimit);
      selectedImages.forEach((image, index) => {
        formData.append(`images`, image.file);
      });

      axios
        .patch(`${BASE_URL}/activity/parent/${dataForm.parentId}`, formData, {
          withCredentials: true,
        })
        .then((response) => {
          // เมื่ออัปเดตกิจกรรมสำเร็จ
          Swal.fire({
            icon: "success",
            title: "อัปเดตทุกข้อมูลสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            window.location.reload();
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถอัปเดตข้อมูลได้",
          });
        });

      // เรียกใช้ฟังก์ชัน handleClose() เพื่อปิดฟอร์ม
      handleClose();
    }
  };

  //ลบกิจกรรมเดียว
  const handleDeleteSingleOccurrence = () => {
    if (selectedEvent) {
      Swal.fire({
        title: "ยืนยันการลบกิจกรรม",
        text: "คุณต้องการลบกิจกรรมเฉพาะวันนี้ใช่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "ใช่, ลบเฉพาะวันนี้",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(`${BASE_URL}/activity/${dataForm.id}`, {
              withCredentials: true,
            })
            .then((response) => {
              Swal.fire(
                "ลบสำเร็จ",
                "กิจกรรมถูกลบเฉพาะวันที่เลือกเรียบร้อยแล้ว",
                "success"
              ).then(() => {
                window.location.reload();
              });
              handleClose();
            })
            .catch((error) => {
              Swal.fire(
                "เกิดข้อผิดพลาด",
                "ไม่สามารถลบกิจกรรมได้: " + error.message,
                "error"
              );
            });
        }
      });
    }
  };

  // ลบกิจกรรมทั้งหมด
  const handleDeleteAllOccurrences = () => {
    if (selectedEvent && selectedEvent.parentId) {
      Swal.fire({
        title: "ยืนยันการลบกิจกรรม",
        text: "คุณต้องการลบกิจกรรมทั้งหมดใช่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "ใช่, ลบทั้งหมด",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(`${BASE_URL}/activity/parent/${selectedEvent.parentId}`, {
              withCredentials: true,
            })
            .then((response) => {
              Swal.fire(
                "ลบสำเร็จ",
                "กิจกรรมถูกลบทั้งหมดเรียบร้อยแล้ว",
                "success"
              ).then(() => {
                window.location.reload();
              });
              handleClose();
            })
            .catch((error) => {
              Swal.fire(
                "เกิดข้อผิดพลาด",
                "ไม่สามารถลบกิจกรรมได้: " + error.message,
                "error"
              );
            });
        }
      });
    }
  };

  //ทำซ้ำกิจกรรมวันนั้น
  const handleRepeatToDay = () => {
    // ตรวจสอบว่าได้เปลี่ยนแปลงเวลาหรือไม่
    if (
      !dataForm.startTime ||
      !dataForm.endTime ||
      dataForm.startTime === selectedEvent.start ||
      dataForm.endTime === selectedEvent.end
    ) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเปลี่ยนเวลา",
        text: "คุณต้องเปลี่ยนเวลาเริ่มต้นและเวลาสิ้นสุดก่อน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const selectedDateTime = dayjs(selectedDate); // วันที่เลือกจากปฏิทิน

    // สร้างวันที่และเวลาเริ่มต้น
    const startDateTime = selectedDateTime
      .hour(dataForm.startTime.hour())
      .minute(dataForm.startTime.minute())
      .second(0);

    // สร้างวันที่และเวลาสิ้นสุด
    const endDateTime = selectedDateTime
      .hour(dataForm.endTime.hour())
      .minute(dataForm.endTime.minute())
      .second(0);

    // เช็คว่าเวลาที่เลือกซ้ำกับกิจกรรมเดิมหรือไม่
    const existingStartTime = dayjs(selectedEvent.start);
    const existingEndTime = dayjs(selectedEvent.end);

    // ตรวจสอบการซ้อนทับของเวลา
    const isOverlapping =
      startDateTime.isBetween(existingStartTime, existingEndTime, null, "[]") ||
      endDateTime.isBetween(existingStartTime, existingEndTime, null, "[]") ||
      (startDateTime.isBefore(existingStartTime) &&
        endDateTime.isAfter(existingEndTime));

    if (isOverlapping) {
      Swal.fire({
        icon: "warning",
        title: "เวลาซ้ำซ้อน",
        text: "กรุณาเลือกเวลาใหม่ที่ไม่ซ้ำซ้อนกับกิจกรรมเดิม",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // แปลงเป็น UTC
    const startTimeUTC = startDateTime.utc().format();
    const endTimeUTC = endDateTime.utc().format();

    // สร้าง FormData สำหรับส่งข้อมูล
    const formData = new FormData();
    formData.append("parentId", dataForm.parentId);
    formData.append("name", dataForm.activityName);
    formData.append("startTime", startTimeUTC);
    formData.append("endTime", endTimeUTC);
    formData.append("description", dataForm.description);
    formData.append("cost", dataForm.expenses);
    formData.append("participantLimit", dataForm.participantLimit);
    selectedImages.forEach((image, index) => {
      formData.append(`images`, image.file);
    });

    axios
      .post(`${BASE_URL}/activity/create-web/`, formData, {
        headers: {
          businessId: "1",
        },
        withCredentials: true,
      })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "ทำซ้ำกิจกรรมสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถสร้างกิจกรรมได้",
        });
      });
  };

  const handleClose = () => {
    setDataForm({
      date: "",
      activityName: "",
      startTime: dayjs(),
      endTime: dayjs().add(2, "minute"),
      description: "",
      expenses: "",
      participantLimit: "",
      repeat: "none",
      repeatCount: 1,
    });
    setSelectedImages([]);
    onClose();
  };

  return (
    <div className="flex flex-col py-2 h-[75vh] overflow-auto pb-4 space-y-2">
      <div className="flex items-center justify-center relative">
        <span
          className={
            dataForm.date
              ? "text-center text-[36px] font-bold text-black"
              : "text-center text-[24px] font-normal text-red-500"
          }
        >
          {dataForm.date ? dataForm.date : "กรุณาเลือกวันก่อน"}
        </span>

        <IoIosCloseCircle
          size={30}
          className="absolute right-[3%] cursor-pointer"
          onClick={handleClose}
        />
      </div>

      <div className="overflow-auto">
        {selectedEvent ? (
          <div className="flex justify-center">
            <button
              className="block text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center "
              type="button"
              onClick={handleModalToggle}
            >
              ดูผู้เข้าร่วมกิจกรรม
            </button>

            {isModalOpen && (
              <div
                id="default-modal"
                tabIndex="-1"
                aria-hidden="true"
                className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50"
              >
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        จำนวนผู้เข้าร่วมกิจกรรม
                      </h3>
                      <button
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={handleModalToggle}
                      >
                        <svg
                          className="w-3 h-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 14"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                          />
                        </svg>
                        <span className="sr-only">Close modal</span>
                      </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                        1. นาย ABC
                        <br />
                        2. นาย BCA
                        <br />
                        3. นาย DCA
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
        <form
          onSubmit={handleSubmit}
          className="max-w-sm mx-auto flex flex-col space-y-4 mt-2"
        >
          <FormControl fullWidth>
            <InputLabel id="activity-select-label">เลือกกิจกรรม</InputLabel>
            <Select
              labelId="activity-select-label"
              label="เลือกกิจกรรม"
              name="activityName"
              value={dataForm.activityName}
              onChange={handleChange}
              renderValue={(selected) => {
                const selectedActivity = allActivities.find(
                  (act) => act.nameTh === selected || act.nameEn === selected
                );
                return selectedActivity
                  ? selectedActivity.nameTh || selectedActivity.nameEn
                  : selected;
              }}
            >
              {(allActivities || []).map((activity) => (
                <MenuItem
                  key={activity._id}
                  value={activity.nameTh || activity.nameEn}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={activity.image?.[0]?.fileName || "/img/default.jpg"}
                      alt={activity.nameTh || activity.nameEn}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <span>{activity.nameTh || activity.nameEn}</span>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex space-x-2">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <TimePicker
                label="เวลาเริ่ม"
                value={dayjs(dataForm.startTime)}
                onChange={(newValue) => handleTimeChange("startTime", newValue)}
                format="HH:mm"
                ampm={false}
              />
              <TimePicker
                label="เวลาสิ้นสุด"
                value={dayjs(dataForm.endTime)}
                onChange={(newValue) => handleTimeChange("endTime", newValue)}
                format="HH:mm"
                ampm={false}
              />
            </LocalizationProvider>
          </div>

          <TextField
            label="รายละเอียดรอบกิจกรรม"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            name="description"
            value={dataForm.description}
            onChange={handleChange}
          />

          <TextField
            label="ค่าใช้จ่าย(บาท)"
            variant="outlined"
            type="number"
            fullWidth
            name="expenses"
            value={dataForm.expenses}
            onChange={(e) => {
              const value = e.target.value;
              if (Number(value) >= 0 || value === "") {
                handleChange(e);
              }
            }}
            InputProps={{
              inputProps: { min: 0 },
              onWheel: (e) => e.target.blur(),
              sx: {
                // ซ่อน spinner บน Chrome/Safari/Edge
                "input::-webkit-outer-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                // ซ่อน spinner บน Firefox
                "input[type=number]": { MozAppearance: "textfield" },
              },
            }}
          />

          <TextField
            label="จำนวนคนที่เข้าร่วม"
            name="participantLimit"
            type="number"
            fullWidth
            value={dataForm.participantLimit || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (Number(value) >= 0 || value === "") {
                handleChange(e);
              }
            }}
            InputProps={{
              inputProps: { min: 0 },
              onWheel: (e) => e.target.blur(),
              sx: {
                // ซ่อนปุ่ม spinner บน Chrome/Safari/Edge
                "input::-webkit-outer-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                // ซ่อนปุ่ม spinner บน Firefox
                "input[type=number]": { MozAppearance: "textfield" },
              },
            }}
          />

          {/* <FormControl fullWidth variant="outlined">
            <InputLabel id="repeat-label">สร้างกิจกรรมซ้ำ</InputLabel>
            <Select
              labelId="repeat-label"
              label="สร้างกิจกรรมซ้ำ"
              name="repeat"
              value={dataForm.repeat || "none"}
              onChange={handleChange}
            >
              <MenuItem value="none">ไม่ซ้ำ</MenuItem>
              <MenuItem value="daily">รายวัน</MenuItem>
              <MenuItem value="weekly">รายสัปดาห์</MenuItem>
            </Select>
          </FormControl> */}

          {dataForm.repeat === "daily" && (
            <div className="flex items-center space-x-2 ml-5">
              <span className="font-sans font-normal">ซ้ำ</span>
              <TextField
                type="number"
                variant="outlined"
                size="small"
                name="repeatCount"
                value={dataForm.repeatCount}
                onChange={handleChange} // เก็บค่าจำนวนวันที่ซ้ำ
                inputProps={{
                  min: 1, // ตั้งค่า min เป็น 1
                }}
                InputProps={{
                  sx: { width: "100px" },
                }}
              />
              <span className="font-sans font-normal">วัน</span>
            </div>
          )}

          {dataForm.repeat === "weekly" && (
            <div className="flex items-center space-x-2 ml-5">
              <span className="font-sans font-normal">ซ้ำ</span>
              <TextField
                type="number"
                variant="outlined"
                size="small"
                name="repeatCount"
                value={dataForm.repeatCount}
                onChange={handleChange}
                inputProps={{
                  min: 1, // ตั้งค่า min เป็น 1
                }}
                InputProps={{
                  sx: { width: "100px" },
                }}
              />
              <span className="font-sans font-normal">สัปดาห์</span>
            </div>
          )}

          {selectedEvent ? (
            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                className="py-2 px-4 bg-green-600 text-lg text-white rounded-md"
              >
                บันทึกการเปลี่ยนแปลงเฉพาะวันนี้
              </button>
              {selectedEvent.parentId && (
                <button
                  type="button"
                  onClick={handleUpdateAllEvents}
                  className="py-2 px-4 bg-green-600 text-lg text-white rounded-md"
                >
                  บันทึกการเปลี่ยนแปลงทั้งหมด
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteSingleOccurrence}
                className="py-2 px-4 bg-yellow-600 text-lg text-white rounded-md"
              >
                ลบกิจกรรมเฉพาะวันนี้
              </button>
              {selectedEvent.parentId && (
                <>
                  <button
                    type="button"
                    onClick={handleDeleteAllOccurrences}
                    className="py-2 px-4 bg-red-600 text-lg text-white rounded-md"
                  >
                    ลบกิจกรรมทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={handleRepeatToDay}
                    className="py-2 px-4 bg-gray-800 text-lg text-white rounded-md"
                  >
                    ทำซ้ำกิจกรรมวันนี้
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              type="submit"
              className="py-2 px-4 bg-green-600 text-lg text-white rounded-md"
            >
              สร้างกิจกรรม
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ActivitiesForm;
