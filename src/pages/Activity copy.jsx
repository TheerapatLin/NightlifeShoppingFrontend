import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdFavoriteBorder } from "react-icons/md";

const Activity = () => {
  const [data, setData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

  useEffect(() => {
    // axios
    //   .get("/data/activity.json")
    //   .then((response) => {
    // setData(response.data);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching the activity data:", error);
    //   });

    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/activity/participant/66d1df0d3137bf2006e440c8`,
        {
          withCredentials: true,
        }
      );

      const uniqueActivities = response.data.reduce((acc, activity) => {
        if (activity.parentId) {
          // ถ้า parentId ไม่ซ้ำ จะเพิ่มเข้าตัวสะสม (acc)
          if (!acc.some((item) => item.parentId === activity.parentId)) {
            acc.push(activity);
          }
        } else {
          // ถ้าไม่มี parentId จะเพิ่มเข้าตัวสะสม (acc)
          acc.push(activity);
        }
        return acc;
      }, []);

      setData(uniqueActivities);
    } catch (error) {
      console.error("Error fetching the activity data:", error);
    }
  };

  const handleClick = (id) => {
    navigate(`/activityDetails/${id}`);
  };

  return (
    <div className="mt-[100px] p-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
        {data.map((item, index) => (
          <div
            key={index}
            className="max-w-64 w-full max-h-[440px] h-full rounded-xl flex flex-col overflow-hidden cursor-pointer bg-white"
            onClick={() => handleClick(item.id)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {item.video ? (
              <VideoHover
                videoSrc={item.video}
                isHovered={hoveredIndex === index}
              />
            ) : (
              <ImageCarousel
                images={item.image}
                isHovered={hoveredIndex === index}
              />
            )}

            <div className="flex flex-col justify-start p-2 h-[130px] bg-white">
              <div className="text-lg font-semibold font-CerFont">
                {item.name}
              </div>
              <div className="font-CerFont font-normal text-neutral-700">
                เริ่มต้น ฿{item.cost}/คน
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoHover = ({ videoSrc, isHovered }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <div className="overflow-hidden relative ">
      <video
        ref={videoRef}
        className="w-full h-[310px] object-cover"
        muted
        loop
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <MdFavoriteBorder className="absolute top-2 right-2 text-white text-2xl" />
    </div>
  );
};

const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fadeProgress, setFadeProgress] = useState(0);
  const intervalRef = useRef(null);
  const zoomIntervalRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(zoomIntervalRef.current);
      clearInterval(fadeIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isHovered) {
      startZooming();
      startImageChange();
    } else {
      stopZooming();
      stopImageChange();
    }
  }, [isHovered]);

  const startZooming = () => {
    if (!zoomIntervalRef.current) {
      zoomIntervalRef.current = setInterval(() => {
        setZoomLevel((prevZoom) => {
          const newZoom = prevZoom + 0.003;
          return newZoom > 1.5 ? 1.5 : newZoom;
        });
      }, 50);
    }
  };

  const stopZooming = () => {
    clearInterval(zoomIntervalRef.current);
    zoomIntervalRef.current = null;
    setZoomLevel(1);
  };

  const startImageChange = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setFadeProgress(0);
        fadeIntervalRef.current = setInterval(() => {
          setFadeProgress((prev) => {
            if (prev >= 1) {
              clearInterval(fadeIntervalRef.current);
              setCurrentImageIndex(nextImageIndex);
              setNextImageIndex((nextImageIndex + 1) % images.length);
              return 0;
            }
            return prev + 0.05;
          });
        }, 50);
      }, 3000);
    }
  };

  const stopImageChange = () => {
    clearInterval(intervalRef.current);
    clearInterval(fadeIntervalRef.current);
    intervalRef.current = null;
    fadeIntervalRef.current = null;
    setCurrentImageIndex(0);
    setNextImageIndex(1);
    setFadeProgress(0);
  };

  return (
    <div
      className="overflow-hidden relative w-full h-[310px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={images[currentImageIndex]?.fileName} 
        alt={`carousel-${currentImageIndex}`}
        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-3000"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
          opacity: 1 - fadeProgress,
        }}
      />
      <img
        src={images[nextImageIndex]?.fileName} 
        alt={`carousel-${nextImageIndex}`}
        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-3000"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
          opacity: fadeProgress,
        }}
      />

      <MdFavoriteBorder className="absolute top-2 right-2 text-white text-2xl" />
    </div>
  );
};

export default Activity;
