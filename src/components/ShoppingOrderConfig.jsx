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
            setError('Failed to fetch orders:',err);
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
                                <tr key={order._id || idx} className="hover:bg-gray-50">
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
        </div>
    );
}

export default ShoppingOrderConfig;