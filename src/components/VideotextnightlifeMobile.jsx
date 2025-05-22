import React, { useRef, useState, useEffect } from "react";
import video from "../video/mainVDO.mp4";
import styles from "../public/css/Videotextnightlife.module.css";
import { useNavigate, useLocation } from "react-router-dom";

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

function VideotextnightlifeMobile() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (location.pathname === "/mingle-options-mobile") {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [location]);

  const handleBookClick = () => {
    navigate("/activityDetails/6787dd2b5e47d804bdc6b012");
  };

  const handleBookMingleClick = () => {
    navigate("/mingle-options-mobile");
  };

  const handleCloseOverlay = () => {
    navigate("/");
  };

  const goToFirstLink = () => {
    navigate("/activityDetails/682f7ef1d878c85d7e172ce7");
  };

  const goToSecondLink = () => {
    navigate("/activityDetails/67c595419a49e9a1544f0b36");
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
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
          objectFit: "cover",
        }}
      />

      {showOverlay && (
        <div
          onClick={handleCloseOverlay}
          className={styles.overlayFadeIn}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 999,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              color: "white",
              fontSize: "30px",
              fontWeight: "bold",
              cursor: "pointer",
              zIndex: 1000,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleCloseOverlay();
            }}
          >
            ×
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "90%",
              maxHeight: "90vh",
              width: "min(600px, 100%)",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              flexShrink: 1,
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
                margin: 0,
              }}
            >
              Choose your kind of Mingle
            </h2>

            {[1, 2].map((_, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  color: "white",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1.6",
                    maxHeight: "40vh",
                    marginBottom: "10px",
                  }}
                >
                  <img
                    src={`/img/mingle_00${i + 1}.jpg`}
                    alt={`Option ${i + 1}`}
                    onClick={() =>
                      i === 0 ? goToFirstLink() : goToSecondLink()
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "20px",
                      cursor: "pointer",
                      filter: "blur(0.5px)",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "scale(1.03)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                </div>
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: "clamp(0.8rem, 1.8vw, 1rem)",
                  }}
                >
                  {i === 0 ? "Meet. Mingle. Connect." : "A wild night awaits."}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ข้อความที่ซ้อนอยู่ด้านบน */}

      <div
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
          position: "absolute",
          top: "70px",
          // bottom: "50%",
          // left: "50%",
          // transform: "translate(-50%, -25%)",
          fontWeight: "normal",
          textAlign: "center",
          width: "80%",
        }}
      >
        <div>
          <img src="/img/home_header2_2.png" style={{ width: "90%" }} />
        </div>
        <div>
          <div
            style={{
              alignItems: "center",
              height: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                maxWidth: "45%",
                padding: "0px",
                marginRight: "1.68%",
              }}
            >
              <div
                style={{
                  maxWidth: "100%",
                  minWidth: "100%",
                  padding: "30px 30px 10px 30px",
                  margin: "0px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderRadius: "15px",
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
                    <img src="/img/logo_mingle.png" style={{ width: "100%" }} />
                  </b>
                  <br />
                  Get New Friends,
                  <br />
                  Enjoy Good Vibes & Music!
                </div>
                <button
                  style={inlineStyles.button1}
                  onClick={handleBookMingleClick}
                >
                  <b>
                    <big>BOOK NOW</big>
                  </b>
                </button>
              </div>
            </div>
            
            <div
              style={{
                maxWidth: "45%",
                padding: "0px",
                marginLeft: "1.68%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: "100%",
                  minWidth: "50%",
                  padding: "30px 30px 10px 30px",
                  margin: "0px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderRadius: "15px",
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
                      style={{ width: "100%" }}
                    />
                  </b>
                  <br />
                  Bar hopping, drinks flowing, and the night never ends!
                </div>
                <button style={inlineStyles.button2} onClick={handleBookClick}>
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

export default VideotextnightlifeMobile;
