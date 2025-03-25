import React, { useEffect } from "react";

function ElfsightWidget() {
  useEffect(() => {
    // โหลดสคริปต์ Elfsight
    const script = document.createElement("script");
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // ทำความสะอาดถ้าจำเป็น
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      {/* วิดเจ็ตจะถูกโหลดใน div นี้ */}
      <div
        className="elfsight-app-f4e456eb-efc7-43f0-a785-21a982e32931"
        data-elfsight-app-lazy
      ></div>
    </div>
  );
}

export default ElfsightWidget;