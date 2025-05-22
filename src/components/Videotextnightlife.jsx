import React, { useRef, useState, useEffect } from "react";
import video from "../video/mainVDO.mp4";
import styles from "../public/css/Videotextnightlife.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { letterSpacing, width } from "@mui/system";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (location.pathname === "/mingle-options") {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [location]);

  const videoRef = useRef(null);

  const handleBookClick = () => {
    navigate("/activityDetails/6787dd2b5e47d804bdc6b012");
  };

  const handleBookMingleClick = () => {
    navigate("/mingle-options");
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
        height: "max(700px,90vh)",
        overflow: "hidden",
        backgroundColor: "black",
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
          width: "100%",
          height: "100%",
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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
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
              top: "15px",
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
              width: "min(1600px, 100%)",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              flexShrink: 1,
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "clamp(1.2rem, 2vw, 2rem)",
                margin: 0,
              }}
            >
              Choose your kind of Mingle
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: "40px",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {[1, 2].map((_, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    color: "white",
                    flex: "0 1 auto",
                    maxWidth: "45%",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1.6",
                      maxHeight: "40vh",
                      margin: "0 auto",
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
                      marginTop: "8px",
                      fontSize: "clamp(0.8rem, 1vw, 1rem)",
                    }}
                  >
                    {i === 0
                      ? "Meet. Mingle. Connect."
                      : "A wild night awaits."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ข้อความซ้อนวิดีโอ */}
      <div
        style={{
          height: "100%",
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -25%)",
          fontWeight: "normal",
          textAlign: "center",
          width: "80%",
        }}
      >
        <div>
          <h1>
            <img src="/img/home_header1.png" style={{ width: "55%" }}></img>
            <br />
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
            }}
          >
            {/* Mingle Box */}
            <div
              style={{
                flex: 1,
                minHeight: "100%",
                maxWidth: "40%",
                paddingRight: "20px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "10px",
                  minHeight: "100%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(25px)",
                  WebkitBackdropFilter: "blur(25px)",
                  borderRadius: "25px",
                }}
              >
                <div
                  className={styles.p}
                  style={{
                    textShadow:
                      "0px 0px 3.5px rgb(39, 0, 35), 0px 0px 8px rgb(255, 0, 106), 0px 0px 25px rgb(255, 1, 81), 0px 0px 50px rgb(255, 5, 88)",
                  }}
                >
                  <b>
                    <img src="/img/logo_mingle.png" style={{ width: "50%" }} />
                  </b>
                  <br />
                  Get New Friends,
                  <br />
                  Enjoy Good Vibes & Music!
                </div>
                <button
                  style={{ ...inlineStyles.button1 }}
                  onClick={handleBookMingleClick}
                >
                  <b>
                    <big>BOOK NOW</big>
                  </b>
                </button>
              </div>
            </div>

            {/* Bar Crawl Box */}
            <div
              style={{
                flex: 1,
                minHeight: "100%",
                maxWidth: "40%",
                paddingLeft: "20px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "10px",
                  minHeight: "100%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(25px)",
                  WebkitBackdropFilter: "blur(25px)",
                  borderRadius: "25px",
                }}
              >
                <div
                  className={styles.p}
                  style={{
                    textShadow:
                      "0px 0px 3.5px rgb(39, 0, 35), 0px 0px 8px rgb(208, 0, 255), 0px 0px 25px rgb(255, 1, 230), 0px 0px 50px rgb(148, 16, 249)",
                  }}
                >
                  <b>
                    <img
                      src="/img/logo_bar_crawl.png"
                      style={{ width: "50%" }}
                    />
                  </b>
                  <br />
                  Bar hopping, drinks flowing,
                  <br />
                  and the night never ends!
                </div>
                <button
                  style={{ ...inlineStyles.button2 }}
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
