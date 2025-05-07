import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [userDeals, setUserDeals] = useState([]); // 🎯 เพิ่ม user deals

  // Fetch order by user ID
  // const fetchOrderByUserID = async (userID) => {
  //   try {
  //     const response = await axios.get(`${BASE_URL}/order/${userID}`, {
  //       withCredentials: true,
  //     });
  //     setOrders(response.data);
  //   } catch (error) {
  //     console.error("Error fetching Orders:", error);
  //   }
  // };

  // 🎯 ดึง deals ที่ user นี้เคยซื้อ
  const fetchUserDeals = async (userID) => {
    try {
      const response = await axios.get(`${BASE_URL}/user-deal/${userID}`, {
        headers: {
          "device-fingerprint": "12345678",
        },
        withCredentials: true,
      });
      //alert(JSON.stringify(response.data, null, 2));
      setUserDeals(response.data);
    } catch (error) {
      console.error("Error fetching user deals:", error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log(user);
      fetchUserDeals(user.userId);
      //fetchOrderByUserID(user.userId);
    }
  }, [user]);

  // Get schedule information based on scheduleId
  const getScheduleDetails = (scheduleId, schedules) => {
    return schedules.find((schedule) => schedule._id === scheduleId);
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}น.`;
  };

  return (
    <div className="flex flex-col gap-4 justify-center items-center px-4 sm:px-8 md:px-16 lg:px-32">
      {/* 🎯 แสดงดีลที่เคยซื้อ */}
      <div className="w-full bg-white rounded-lg p-4">
        <span className="text-xl font-CerFont ml-4">ดีลที่เคยซื้อไว้</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {userDeals.map((userDeal) => (
            <div
              key={userDeal._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {/* รูปภาพดีล */}
              {userDeal.dealId?.images?.[0] && (
                <img
                  src={userDeal.dealId.images[0]}
                  alt="Deal Preview"
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}

              <div className="font-bold mb-2">
                {userDeal.dealId?.title?.th || "ดีลไม่มีชื่อ"}
              </div>
              <div className="text-sm text-gray-600">
                ซื้อเมื่อ:{" "}
                {new Date(userDeal.claimedAt).toLocaleDateString("th-TH")}
              </div>
              <div className="text-sm text-gray-600">
                สถานะ: {userDeal.isUsed ? "ใช้แล้ว" : "ยังไม่ใช้"}
              </div>
              <div className="text-sm text-gray-600">
                ราคาที่จ่าย: {userDeal.pricePaid} บาท
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-white rounded-lg p-4">
        <span className="text-xl font-CerFont ml-4">กิจกรรมที่จองไว้</span>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">ชื่อกิจกรรม</th>
                <th className="px-4 py-2 text-left">วันที่จอง</th>
                <th className="px-4 py-2 text-left">ราคา</th>
                <th className="px-4 py-2 text-left">ระยะเวลากิจกรรม</th>
                <th className="px-4 py-2 text-left">สถานที่</th>
                <th className="px-4 py-2 text-left">สถานะการชำระเงิน</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const schedule = getScheduleDetails(
                  order.scheduleId,
                  order.activityId.schedule
                );

                return (
                  <tr key={order._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {index + 1}. {order.activityId.name}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(order.bookingDate).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-2">
                      {schedule ? schedule.cost : "ข้อมูลไม่พบ"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {schedule
                        ? `${formatTime(schedule.startTime)} - ${formatTime(
                            schedule.endTime
                          )}`
                        : "ข้อมูลไม่พบ"}
                    </td>
                    <td className="px-4 py-2">
                      {order.activityId.location.name}
                    </td>
                    <td className="px-4 py-2">
                      {order.status === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
