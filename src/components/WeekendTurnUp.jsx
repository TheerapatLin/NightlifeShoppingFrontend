import React, { useState } from 'react';
import '../public/css/WeekendTurnUp.css';
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const images = [
  "/img/nightlife.run_activities/001.jpg",
  "/img/nightlife.run_activities/002.jpg",
  "/img/nightlife.run_activities/003.jpg",
  "/img/nightlife.run_activities/004.jpg",
  "/img/nightlife.run_activities/005.jpg",
  "/img/nightlife.run_activities/006.jpg",
];

const translations = {
  th: {
    heading: "กิจกรรมของ Nightlife.run",
    description: "Bar crawl on weekends คืออะไร?",
    details: `กิจกรรม Pub or bar crawl เป็นชื่อเรียกจากที่ต่างประเทศ กล่าวคือ เมื่อเราเดินทางไปเที่ยวที่ประเทศใดๆ แล้วอยากเจอเพื่อนใหม่ มันจะมีกลุ่มที่ให้คนมารวมตัวกัน 
    ทุกคนเป็นคนแปลกหน้าที่สามารถสมัครเข้าไปจอยและเจอกันได้ โดยไม่รู้จักกันมาก่อน แล้วก็ไปเที่ยวตามบาร์ และ Nightclub โดยมีโฮสคอยช่วยดูช่วยจัดการให้ทาง 
    Nightlife.run ตั้งใจจะจัดกิจกรรมนี้ให้กับกลุ่มคนไทยได้มาลองทำให้คนเดียวก็เที่ยวได้ คนที่มาจอยกลุ่มเราส่วนใหญ่แทบจะไม่รู้จักกันมาก่อนมีทั้งคนไทยคนต่างชาติ 
    จะ Introvert , extrovert ก็มาจอยๆกันได้ ไม่มีปัญหา`,
    invitation: `หากสนใจสามารถกดสมัครมาได้  หรือ DM ติดต่อสอบถามข้อมูลมาทาง IG ของเราก็ได้เช่นกัน`
  },
  en: {
    heading: "Nightlife.run Activities",
    description: "The night to remember in Bangkok experience!?",
    details: `Our bar crawl brings together a great mix of locals and travelers for an unforgettable night out! We may start as strangers, 
    but we always end up as friends. We handpick two incredible bars and two exclusive nightclubs—some of which have limited access—ensuring
     a premium experience. To keep things fun and intimate, we accept only a limited number of participants. Coming alone? No worries! 
     We love welcoming new friends.`,
    invitation: `Great music and stunning venues mean nothing without the right people—join us and make the night truly come alive!`
  }
};

const WeekendTurnUp = () => {
  const { t, i18n } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [language, setLanguage] = useState('en');

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="weekend-turn-up">
      
      {/* ส่วนหัวข้อ */}
      <h1 className="main-heading">{translations[i18n.language ?? "en"]?.heading}</h1>

      {/* เนื้อหาหลัก */}
      <div className="content">
        <div className="text-section">
          <p className="bold">{translations[i18n.language ?? "en"]?.description}</p>
          <p className="highlight">{translations[i18n.language ?? "en"]?.details}</p>
          <p className="invitation">{translations[i18n.language ?? "en"]?.invitation}</p>
        </div>

        {/* ส่วนแสดงรูปภาพ */}
        <div className="image-section">
          <div className="image-slider">
            <img src={images[currentImageIndex]} alt="Weekend Turn Up Event" />
            <div className="indicators">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={index === currentImageIndex ? 'active' : ''}
                  onClick={() => handleDotClick(index)}
                ></span>
              ))}
            </div>
          </div>
          <button className="prev" onClick={handlePrevClick}>&#9664;</button>
          <button className="next" onClick={handleNextClick}>&#9654;</button>
        </div>
      </div>
    </div>
  );
};

export default WeekendTurnUp;
