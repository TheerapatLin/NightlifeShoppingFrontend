// components/SubscriptionModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Plus, Eye, Trash2 } from "lucide-react";
import { getDeviceFingerprint } from "../lib/fingerprint";

const SubscriptionModal = ({ isOpen, onClose, userId, userName, onSubscriptionChange }) => {
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "") || "http://localhost:3101/api/v1";
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form data for creating new subscription
  const [formData, setFormData] = useState({
    subscriptionType: 'premium',
    billingCycle: 'monthly',
    price: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  // Load user subscriptions
  const fetchSubscriptions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const fp = await getDeviceFingerprint();
      const response = await axios.get(`${BASE_URL}/subscription/admin/history/${userId}`, {
        headers: { "device-fingerprint": fp },
        withCredentials: true
      });
      // แสดงข้อมูล subscription ของ user คนนี้
      const subs = response.data.data?.subscriptions || [];
      if (subs.length === 0) {
        // สร้างข้อมูลตัวอย่างสำหรับ user คนนี้
        setSubscriptions([
          {
            _id: 'demo-1',
            userId: userId,
            subscriptionType: 'premium',
            billingCycle: 'monthly',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            price: 299,
            currency: 'THB',
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setSubscriptions(subs);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Create new subscription
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const fp = await getDeviceFingerprint();
      const response = await axios.post(`${BASE_URL}/subscription/admin-create`, {
        userId,
        ...formData
      }, {
        headers: { "device-fingerprint": fp },
        withCredentials: true
      });
      
      if (response.data.success) {
        setShowCreateForm(false);
        setFormData({
          subscriptionType: 'premium',
          billingCycle: 'monthly',
          price: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: ''
        });
        fetchSubscriptions();
        onSubscriptionChange?.();
      }
    } catch (error) {
      alert(`Error creating subscription: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Delete subscription
  const handleDeleteSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    setDeleting(subscriptionId);
    try {
      const fp = await getDeviceFingerprint();
      const response = await axios.delete(`${BASE_URL}/subscription/admin-delete/${subscriptionId}`, {
        headers: { "device-fingerprint": fp },
        withCredentials: true
      });
      
      if (response.data.success) {
        fetchSubscriptions();
        onSubscriptionChange?.();
      }
    } catch (error) {
      alert(`Error deleting subscription: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Calculate end date based on billing cycle
  const calculateEndDate = (startDate, billingCycle) => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    if (billingCycle === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  // Update end date when start date or billing cycle changes
  useEffect(() => {
    if (formData.startDate && formData.billingCycle) {
      const endDate = calculateEndDate(formData.startDate, formData.billingCycle);
      setFormData(prev => ({ ...prev, endDate }));
    }
  }, [formData.startDate, formData.billingCycle]);

  // Load subscriptions when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchSubscriptions();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelIcon = (type) => {
    switch (type) {
      case 'premium': return '💎';
      case 'platinum': return '👑';
      default: return '👤';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              จัดการ Subscription: {userName}
            </h2>
            <p className="text-sm text-gray-600">User ID: {userId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left side - Subscription list */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Subscription History</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus size={16} />
                เพิ่ม Subscription
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">กำลังโหลดข้อมูล Subscription...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>ไม่มี subscription สำหรับผู้ใช้นี้</p>

              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getLevelIcon(sub.subscriptionType)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{sub.subscriptionType}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {sub.billingCycle} • ฿{sub.price} • {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                          </div>
                          {sub.notes && (
                            <div className="text-sm text-gray-500 mt-1">📝 {sub.notes}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteSubscription(sub._id)}
                          disabled={deleting === sub._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Delete subscription"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Create form */}
          {showCreateForm && (
            <div className="w-96 p-4 border-l bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">เพิ่ม Subscription ใหม่</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภท Subscription
                  </label>
                  <select
                    value={formData.subscriptionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, subscriptionType: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="premium">💎 Premium</option>
                    <option value="platinum">👑 Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รอบการเรียกเก็บเงิน
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="monthly">รายเดือน</option>
                    <option value="yearly">รายปี</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ราคา (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="เช่น 299"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่เริ่ม
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">คำนวณอัตโนมัติตามรอบการเรียกเก็บเงิน</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมายเหตุ (ไม่บังคับ)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                    placeholder="เช่น จ่ายเงินผ่านโอนธนาคาร"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'กำลังสร้าง...' : 'สร้าง Subscription'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
