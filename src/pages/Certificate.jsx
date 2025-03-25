import React, { useState, useRef, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import cerImg from "/img/certificate.jpg";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function Certificate() {
  const certificateRef = useRef(null);

  const formatThaiDate = (dateString) => {
    const defaultDateString = "2024-08-28";
    const date = new Date(dateString || defaultDateString);
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;
    const isNovember = month === "พฤศจิกายน";

    return {
      dateText: `${day} ${month} ${year}`,
      fontSize: isNovember ? "0.6vw" : "0.6vw",
    };
  };

  const [dataForm, setDataForm] = useState({
    name: "",
    activityName: "",
    details: "",
    hours: "",
    date: "",
  });

  const [activityOptions, setActivityOptions] = useState([]);
  const [detailOptions, setDetailOptions] = useState([]);

  const EXPIRATION_TIME = 60 * 60 * 1000; // 1 ชั่วโมงในมิลลิวินาที

  const getStoredData = () => {
    const storedItem = localStorage.getItem("formData");
    if (!storedItem) return null;

    const { value, timestamp } = JSON.parse(storedItem);
    const now = new Date().getTime();

    if (now - timestamp > EXPIRATION_TIME) {
      localStorage.removeItem("formData");
      return null;
    }

    return value;
  };

  const setStoredData = (data) => {
    const item = {
      value: data,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem("formData", JSON.stringify(item));
  };

  useEffect(() => {
    const storedData = getStoredData() || [];

    const activities = storedData.map((item) => item.activityName);
    setActivityOptions(activities);

    const details = storedData.map((item) => item.details);
    setDetailOptions(details);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingData = getStoredData() || [];
    const dataToStore = {
      activityName: dataForm.activityName,
      details: dataForm.details,
    };

    // ตรวจสอบว่ามีข้อมูลซ้ำกันในทั้ง activityName และ details หรือไม่
    const isDuplicate = existingData.some(
      (item) =>
        item.activityName === dataToStore.activityName ||
        item.details === dataToStore.details
    );

    if (!isDuplicate) {
      const newData = [...existingData, dataToStore];
      setStoredData(newData);

      // อัปเดต options
      setActivityOptions((prevOptions) => [
        ...new Set([...prevOptions, dataToStore.activityName]),
      ]);
      setDetailOptions((prevOptions) => [
        ...new Set([...prevOptions, dataToStore.details]),
      ]);
    } else {
      console.log("ข้อมูลซ้ำกัน");
    }

    console.log(dataForm);
  };

  const handleDownloadPDF = () => {
    if (
      dataForm.name &&
      dataForm.activityName &&
      dataForm.details &&
      dataForm.hours &&
      dataForm.date
    ) {
      html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0); // คุณภาพ 1.0 (สูงสุด)
        const pdf = new jsPDF("landscape"); // แนวนอน
        const imgWidth = 297; // ขนาดความกว้าง A4 (mm)
        const pageHeight = 210; // ขนาดความสูง A4 (mm)
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // ปรับสัดส่วนตามขนาด canvas

        let heightLeft = imgHeight;
        let position = 0;

        // กำหนดตำแหน่งภาพและขนาดในเอกสาร PDF
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        pdf.save("certificate.pdf");
      });
    }
  };

  const handleClear = () => {
    localStorage.removeItem("formData");
    window.location.reload();
  };

  return (
    <>
      <div className="flex flex-col items-center mt-28 gap-3">
        <div className="flex flex-col items-center md:flex-row gap-10">
          <div className="flex flex-col p-5 bg-white w-[70vh] rounded-xl">
            <span className="text-center text-lg font-medium mb-5">
              ข้อมูลผู้ร่วมกิจกรรม
            </span>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <TextField
                label="ชื่อ-นามสกุล"
                name="name"
                type=""
                value={dataForm.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
              />

              <Autocomplete
                freeSolo
                options={activityOptions}
                value={dataForm.activityName}
                onChange={(event, newValue) => {
                  setDataForm((prevData) => ({
                    ...prevData,
                    activityName: newValue || "",
                  }));
                }}
                onInputChange={(event, newInputValue) => {
                  setDataForm((prevData) => ({
                    ...prevData,
                    activityName: newInputValue,
                  }));
                }}
                ListboxProps={{
                  className: "dropdown-listbox",
                  style: {
                    maxHeight: "125px",
                    overflow: "auto",
                  },
                }}
                renderOption={(props, option, { index }) => (
                  <li
                    {...props}
                    className={`dropdown-item ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="ชื่อกิจกรรม"
                    type=""
                    variant="outlined"
                    fullWidth
                    required
                  />
                )}
              />

              <Autocomplete
                freeSolo
                options={detailOptions}
                value={dataForm.details}
                onChange={(event, newValue) => {
                  setDataForm((prevData) => ({
                    ...prevData,
                    details: newValue || "",
                  }));
                }}
                onInputChange={(event, newInputValue) => {
                  setDataForm((prevData) => ({
                    ...prevData,
                    details: newInputValue,
                  }));
                }}
                ListboxProps={{
                  className: "dropdown-listbox",
                  style: {
                    maxHeight: "125px",
                    overflow: "auto",
                  },
                }}
                renderOption={(props, option, { index }) => (
                  <li
                    {...props}
                    className={`dropdown-item ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    {option}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="รายละเอียดกิจกรรม"
                    name="details"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    required
                  />
                )}
              />

              <div className="flex flex-row gap-3">
                <TextField
                  label="จำนวนชั่วโมง"
                  name="hours"
                  type="number"
                  value={dataForm.hours}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                />
                <TextField
                  label="วันที่"
                  name="date"
                  type="date"
                  value={dataForm.date}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </div>

              <div className="flex flex-row  gap-3 mt-4">
                <button
                  className="py-2 px-4 bg-green-500 text-white rounded-md"
                  onClick={handleDownloadPDF}
                >
                  ดาวน์โหลด PDF
                </button>
                <button
                  type="button"
                  className="py-2 px-4 bg-red-500 text-white rounded-md"
                  onClick={handleClear}
                >
                  ล้างค่า
                </button>
              </div>
            </form>
          </div>

          <div className="p-5 w-[50vw] rounded-xl">
            <div ref={certificateRef} className="relative w-full">
              <img src={cerImg} alt="Certificate" className="w-full" />
              <div className="absolute top-[38%] left-[14%] text-[2.5vw] text-certificate_name font-normal font-CerFont">
                {dataForm.name ? dataForm.name : "อิศรา ลันสุชีพ"}
              </div>

              <div className="absolute top-[51%] left-[14%]">
                <div className=" text-[0.92vw] font-medium font-CerFont">
                  เพื่อรับรองว่าได้เข้าร่วมกิจกรรมจิตอาสา
                </div>
                <div className="w-[35vw] font-medium font-CerFont">
                  {dataForm.activityName ? (
                    <span
                      className={
                        dataForm.activityName.length < 53
                          ? "text-[1.5vw] font-CerFont"
                          : "text-[1.2vw] font-CerFont"
                      }
                    >
                      {dataForm.activityName}
                    </span>
                  ) : (
                    <span className="text-[1.5vw] font-CerFont">
                      เป็นอาสาสมัครให้อาหารสัตว์เลี้ยงที่ถูกเจ้าของทิ้ง
                    </span>
                  )}
                </div>
                <div className="w-[36vw] text-[0.8vw] font-light text-black font-CerFont">
                  {dataForm.details
                    ? dataForm.details
                    : "เมื่อวันที่ 24 สิงหาคม พ.ศ.2567 ณ สวนสัตว์เพื่อนเดรัจฉาน โดยมีส่วนร่วมในการจัดเตรียมอาหารให้กับสัตว์เลี้ยงที่ถูกเจ้าของทอดทิ้ง และเรียนรู้ทำความเข้าใจสัตว์ชนิดต่างๆ"}
                </div>
              </div>

              <div className="absolute bottom-[19.6%] left-[59.5%] text-[0.9vw] font-bold font-CerFont">
                {dataForm.hours ? dataForm.hours : "2"}
              </div>
              <div
                className="absolute w-[6.3vw] bottom-[12.3%] left-[14.3%] font-normal font-CerFont text-center"
                style={{ fontSize: formatThaiDate(dataForm.date).fontSize }}
              >
                {formatThaiDate(dataForm.date).dateText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Certificate;
