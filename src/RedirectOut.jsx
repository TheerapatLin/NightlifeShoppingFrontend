// src/pages/RedirectOut.jsx
import { useEffect } from "react";

function RedirectOut() {
  useEffect(() => {
    window.location.href = "https://www.royalgrandpalace.th/th/home"; // <-- URL ปลายทาง
  }, []);

  return <p>กำลังนำทางไปยังเว็บไซต์อื่น...</p>;
}

export default RedirectOut;
