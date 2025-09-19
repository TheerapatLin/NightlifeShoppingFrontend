import React, { useState } from "react";
import dayjs from "dayjs";
import OrderDetailModal from "./OrderDetailModal";
import { useTranslation } from "react-i18next";

function UserOrders({ orders }) {
  const [open, setOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { i18n } = useTranslation();

  const handleRowClick = (orderId) => {
    setSelectedOrderId(orderId);
    setOpen(true);
  };

  return (
    <div className="w-full p-4">
      <div className="text-xl  text-white text-center flex justify-center">
        {(i18n.language === "th" ? 'คำสั่งซื้อ' : 'Shopping Orders')}
      </div>

      <div className="overflow-x-auto mt-4">
        {!orders || orders.length === 0 ? (
          <div className="text-white text-center text-sm italic opacity-20">
            {(i18n.language === "th" ? 'ไม่พบคำสั่งซื้อ' : 'No orders found')}
          </div>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="px-4 py-2 text-left">
                  {(i18n.language === "th" ? 'วันที่จ่าย' : 'Paid At')}
                </th>
                <th className="px-4 py-2 text-left">
                  {(i18n.language === "th" ? 'ราคารวม' : 'Total Price')}
                </th>
                <th className="px-4 py-2 text-left">
                  {(i18n.language === "th" ? 'ประเภทการจ่ายเงิน' : 'Payment Type')}
                </th>
                <th className="px-4 py-2 text-left">
                  {(i18n.language === "th" ? 'สถานะการจ่ายเงิน' : 'Payment Status')}
                </th>
                <th className="px-4 py-2 text-left">
                  {(i18n.language === "th" ? 'แก้ไขล่าสุด' : 'Update At')}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="cursor-pointer text-white shadow-[inset_0px_-1px_0px_rgba(255,255,255,0.3)] hover:bg-white/10 transition-all duration-200"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    {order?.createdAt || order?.createAt
                      ? dayjs(order.createdAt || order.createAt).format(
                        "YYYY-MM-DD HH:mm"
                      )
                      : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {typeof order?.originalPrice === "number"
                      ? order.originalPrice.toFixed(2)
                      : order?.originalPrice ?? "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {order?.paymentMetadata?.brand ?? "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {order?.status ?? "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {order?.updatedAt || order?.updateAt
                      ? dayjs(order.updatedAt || order.updateAt).format(
                        "YYYY-MM-DD HH:mm"
                      )
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OrderDetailModal
        open={open}
        orderId={selectedOrderId}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export default UserOrders;


