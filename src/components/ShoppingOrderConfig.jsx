import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function ShoppingOrderConfig() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch {
            return '-';
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const loadOrders = async () => {
        if (!user?.userId) {
            setLoading(false);
            setOrders([]);
            setError('User not found');
            return;
        }
        try {
            setLoading(true);
            const fp = await getDeviceFingerprint();
            const res = await axios.get(`${BASE_URL}/shopping/creator-creatororder/${user.userId}`, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            });
            const data = res?.data;
            setOrders(Array.isArray(data?.order) ? data.order : []);
            setError(null);
        } catch (err) {
            setOrders([]);
            setError('Failed to fetch orders:', err);
            console.log(`Failed to fetch orders: ${err}`)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-red-600">
                    <h1>{error}</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {orders.length === 0 ? (
                <div className="text-center py-8 text-500">
                    <h1>No orders found</h1>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">created At</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">buyer Id</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">product Id</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">paid At</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">admin Note</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, idx) => (
                                <tr
                                    key={order._id || idx}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                    onClick={() => handleOrderClick(order)}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order.createdAt)}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{order.buyerId || '-'}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">{order.productId || '-'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order.paidAt)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'cancelled' || order.status === 'failed'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {Array.isArray(order.adminNote) && order.adminNote.length > 0
                                            ? (order.adminNote[0]?.message || '-')
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal */}
            {isModalOpen && selectedOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">รายละเอียดคำสั่งซื้อ</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Order Basic Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">ข้อมูลคำสั่งซื้อ</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>

                                        <p
                                            className="text-black"
                                        >
                                            <span
                                                className="font-medium"
                                            >
                                                สถานะ:
                                            </span>
                                            <span
                                                className={`ml-2 px-2 py-1 text-xl font-semibold rounded-full ${selectedOrder.status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : selectedOrder.status === 'cancelled' || selectedOrder.status === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                {selectedOrder.status || 'unknown'}
                                            </span>
                                        </p>

                                        <p className="text-black"><span className="font-medium">สร้างเมื่อ:</span> {formatDate(selectedOrder.createdAt)}</p>
                                        <p className="text-black"><span className="font-medium">ชำระเมื่อ:</span> {formatDate(selectedOrder.paidAt)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">

                                    <h3 className="font-semibold text-black mb-2">ข้อมูลผู้ซื้อ</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">Buyer ID:</span> {selectedOrder.buyerId || '-'}</p>
                                        <p className="text-black"><span className="font-medium">Creator ID:</span> {selectedOrder.creatorId || '-'}</p>
                                        <p className="text-black"><span className="font-medium">Product ID:</span> {selectedOrder.productId || '-'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">สรุปยอดเงิน</h3>
                                    <div className="space-y-1 text-sm">
                                        {selectedOrder.variant && selectedOrder.variant.length > 0 && (
                                            <p className="text-black font-semibold text-lg">
                                                รวมทั้งหมด: {formatCurrency(selectedOrder.variant.reduce((sum, item) => sum + (item.totalPrice || 0), 0))}
                                            </p>
                                        )}
                                        <p className="text-black"><span className="font-medium">จำนวนสินค้า:</span> {selectedOrder.variant?.length || 0} รายการ</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            {selectedOrder.ShippingAddress && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">ที่อยู่จัดส่ง</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">ชื่อที่อยู่:</span> {selectedOrder.ShippingAddress.addressName || '-'}</p>

                                        <p
                                            className="text-black"
                                        >
                                            <span
                                                className="font-medium"
                                            >
                                                สถานะ:
                                            </span>
                                            {selectedOrder.ShippingAddress.addressStatus || '-'}
                                        </p>

                                        {selectedOrder.ShippingAddress.address && (
                                            <div className="mt-2">
                                                <p className="text-black"><span className="font-medium">ที่อยู่:</span> {selectedOrder.ShippingAddress.address.address || '-'}</p>
                                                <p className="text-black"><span className="font-medium">เมือง:</span> {selectedOrder.ShippingAddress.address.city || '-'}</p>
                                                <p className="text-black"><span className="font-medium">จังหวัด:</span> {selectedOrder.ShippingAddress.address.province || '-'}</p>
                                                <p className="text-black"><span className="font-medium">ประเทศ:</span> {selectedOrder.ShippingAddress.address.country || '-'}</p>
                                                {selectedOrder.ShippingAddress.address.description && (
                                                    <p className="text-black"><span className="font-medium">รายละเอียดเพิ่มเติม:</span> {selectedOrder.ShippingAddress.address.description}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            {selectedOrder.paymentMetadata && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">รายละเอียดการชำระเงิน</h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-black"><span className="font-medium">วิธีการชำระ:</span> {selectedOrder.paymentMetadata.method || '-'}</p>
                                        <p className="text-black"><span className="font-medium">บัตรเครดิต:</span> {selectedOrder.paymentMetadata.brand || '-'} ****{selectedOrder.paymentMetadata.last4 || ''}</p>
                                        {selectedOrder.paymentMetadata.receiptUrl && (
                                            <p className="text-black">
                                                <span className="font-medium">ใบเสร็จ:</span>
                                                <a
                                                    href={selectedOrder.paymentMetadata.receiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    ดูใบเสร็จ
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Variant Products */}
                            {selectedOrder.variant && selectedOrder.variant.length > 0 && (
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                    <h3 className="font-semibold text-black mb-2">สินค้าที่สั่งซื้อ</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">SKU</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">จำนวน</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">ราคาต่อชิ้น</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase">ราคารวม</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedOrder.variant.map((item, idx) => (
                                                    <tr key={item._id || idx}>
                                                        <td className="px-3 py-2 text-sm text-black">{item.sku || '-'}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{item.quantity || 0}</td>
                                                        <td className="px-3 py-2 text-sm text-black">{formatCurrency(item.originalPrice || 0)}</td>
                                                        <td className="px-3 py-2 text-sm text-black font-medium">{formatCurrency(item.totalPrice || 0)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div className="bg-red-50 p-3 rounded-lg">
                                <h3 className="font-semibold text-black mb-2">หมายเหตุจากแอดมิน</h3>
                                <div className="space-y-1 text-sm">
                                    {selectedOrder.adminNote && selectedOrder.adminNote.length > 0 ? (
                                        selectedOrder.adminNote.map((note, idx) => (
                                            <p key={idx} className="text-black">{note.message || '-'}</p>
                                        ))
                                    ) : (
                                        <p className="text-black">-</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShoppingOrderConfig;