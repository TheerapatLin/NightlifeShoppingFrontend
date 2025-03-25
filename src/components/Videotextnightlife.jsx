import React, { useRef } from "react";
import video from "../video/mainVDO.mp4";
import styles from "../public/css/Videotextnightlife.module.css";
import { useNavigate } from "react-router-dom";
import { fontFamily, maxWidth } from "@mui/system";

const inlineStyles = {
  h1: {
    fontSize: "2em",
    textAlign: "center",
    margin: "20px 0",
  },
  hr: {
    width: "90%",
    margin: "20px auto",
  },
  p: {
    minWidth: "100%",
    backgroundColor: "rgb(255, 0, 0)",
    fontFamily: "CerFont",
    fontSize: "21.2em",
    textAlign: "center",
    margin: "10px 0",
  },
  button1: {
    backgroundColor: "rgb(195, 12, 91)",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "15px",
    cursor: "pointer",
    fontSize: "14px",
    display: "block",
    margin: "20px auto",
  },
  button2: {
    backgroundColor: "rgb(137, 34, 178)",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "15px",
    cursor: "pointer",
    fontSize: "14px",
    display: "block",
    margin: "20px auto",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
};

function Videotextnightlife() {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate("/activityDetails/6787dd2b5e47d804bdc6b012"); // เปลี่ยนเส้นทางไปยังหน้าที่คุณต้องการ
  };

  const handleBookMingleClick = () => {
    navigate("/activityDetails/67c595419a49e9a1544f0b36"); // เปลี่ยนเส้นทางไปยังหน้าที่คุณต้องการ
  };

  return (
    <div
      style={{
        position: "relative", // ใช้ position relative กับ container เพื่อให้ซ้อนทับกัน
        width: "100%",
        height: "max(700px,90vh)",
        //marginTop: "100px", // เว้นระยะจากด้านบน 180px
        overflow: "hidden", // ป้องกันการล้นของเนื้อหา
        backgroundColor: "black",
      }}
    >
      {/* วิดีโอ */}
      <video
        ref={videoRef}
        src={video}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover", // ปรับวิดีโอให้ยืดเต็มโดยรักษาสัดส่วน
        }}
      />

      {/* ข้อความที่ซ้อนอยู่ด้านบน */}
      <div
        style={{
          height: "100%",
          position: "absolute",
          top: "45%", // กึ่งกลางแนวตั้ง
          left: "50%", // กึ่งกลางแนวนอน
          transform: "translate(-50%, -25%)", // เลื่อนให้ข้อความอยู่ตรงกลาง
          fontWeight: "normal",
          textAlign: "center",
          // textShadow:
          //   "0px 0px 3.5px rgb(39, 0, 35), 0px 0px 8px rgb(255, 18, 231),  0px 0px 25px rgb(95, 15, 207), 0px 0px 50px rgb(27, 44, 220)",
          width: "80%",
        }}
      >
        <div>
          <h1 className={styles.h1}>
            Make It A Night To Remember
            <br />
            In Bangkok!
          </h1>
          {/* <hr className={styles.hr} /> */}
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <div
              style={{
                flex: 1,
                maxWidth: "60%",
                padding: "50px",
                margin: "0px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: "95%",
                  minWidth: "50%",
                  padding: "30px 30px 10px 30px",
                  margin: "0px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // สีใส
                  backdropFilter: "blur(5px)", // ทำให้เบลอ
                  WebkitBackdropFilter: "blur(10px)", // สำหรับ Safari
                  borderRadius: "25px",
                }}
              >
                <div
                  className={styles.p}
                  style={{
                    minWidth: "100%",
                    margin: "0 auto",
                    textShadow:
                      "0px 0px 3.5px rgb(39, 0, 35), 0px 0px 8px rgb(255, 0, 106),  0px 0px 25px rgb(255, 1, 81), 0px 0px 50px rgb(255, 5, 88)",
                  }}
                >
                  <b>
                    <img src="/img/logo_mingle.png" style={{ width: "80%" }} />
                  </b>
                  <br />
                  From strangers to friends—meet, mingle, and make connections
                  at the bar!
                </div>
                <button
                  style={inlineStyles.button1}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      styles.buttonHover.backgroundColor)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      styles.button.backgroundColor)
                  }
                  onClick={handleBookMingleClick}
                >
                  <b>
                    <big>BOOK NOW</big>
                  </b>
                </button>
              </div>
            </div>
            {/* <div
              style={{ borderRight: "3px solid white", height: "100px" }}
            ></div> */}
            <div
              style={{
                flex: 1,
                maxWidth: "60%",
                padding: "50px",
                margin: "0px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: "100%",
                  minWidth: "50%",
                  padding: "30px 30px 10px 30px",
                  margin: "0px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // สีใส
                  backdropFilter: "blur(5px)", // ทำให้เบลอ
                  WebkitBackdropFilter: "blur(10px)", // สำหรับ Safari
                  borderRadius: "25px",
                }}
              >
                <div
                  className={styles.p}
                  style={{
                    minWidth: "100%",
                    margin: "0 auto",
                    textShadow:
                      "0px 0px 3.5px rgb(39, 0, 35), 0px 0px 8px rgb(208, 0, 255),  0px 0px 25px rgb(255, 1, 230), 0px 0px 50px rgb(148, 16, 249)",
                  }}
                >
                  <b>
                    <img
                      src="/img/logo_bar_crawl.png"
                      style={{ width: "80%" }}
                    />
                  </b>
                  <br />
                  Bar hopping, drinks flowing, and the night never ends!
                </div>
                <button
                  style={inlineStyles.button2}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      styles.buttonHover.backgroundColor)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      styles.button.backgroundColor)
                  }
                  onClick={handleBookClick}
                >
                  <b>
                    <big>BOOK NOW</big>
                  </b>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Videotextnightlife;
