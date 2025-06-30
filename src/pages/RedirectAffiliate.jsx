// RedirectAffiliate.jsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RedirectAffiliate() {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shortcode) return;

    const affiliateCode = shortcode.slice(0, -2); // เช่น '2i3mAZkd'
    const activityCode = shortcode.slice(-2); // เช่น '01'

    // ✅ map activityCode เป็น activityId
    const activityIdMap = {
      "00": "6831f00d7c0efc221fa46694",
      "01": "6787dd2b5e47d804bdc6b012",
      "02": "67c595419a49e9a1544f0b36",
      "03": "682f7ef1d878c85d7e172ce7",
      "04": "68565aaeef699b0880757060"
      // ... ใส่เพิ่มตามต้องการ
    };

    const activityId = activityIdMap[activityCode];

    if (activityId) {
      navigate(`/activityDetails/${activityId}?ref=${affiliateCode}`, { replace: true });
    } else {
      navigate("/", { replace: true }); // กลับ home ถ้าไม่พบ activityId
    }
  }, [shortcode, navigate]);

  return (
    <div className="text-center text-lg mt-10">
      Redirecting...
    </div>
  );
}

export default RedirectAffiliate;
