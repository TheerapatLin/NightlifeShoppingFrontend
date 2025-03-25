import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  // Fetch order by user ID
  const fetchOrderByUserID = async (userID) => {
    try {
      const response = await axios.get(`${BASE_URL}/order/${userID}`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching Orders:", error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log(user);
      fetchOrderByUserID(user.userId);
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
      {/* <div className="flex flex-col sm:flex-row gap-4 w-full text-center rounded-lg">
        <div className="w-full sm:w-[40%] flex flex-col justify-center items-center gap-4 p-4 rounded-lg bg-white">
          <img
            src="https://placehold.co/600x400"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border border-gray-300"
            alt="Profile"
          />
          <div>
            <span className="text-lg font-CerFont">อัมรินทร์ ดอกยี่สูน</span>
          </div>
        </div>
        <div className="w-full sm:w-[60%] p-4 rounded-lg bg-white flex flex-col">
          <div className="text-xl font-CerFont mb-4">แก้ไขข้อมูลผู้ใช้</div>
        </div>
      </div> */}

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
