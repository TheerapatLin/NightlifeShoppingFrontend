import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

const AddressPopup = ({ isOpen, onClose, onAddressConfirm, onAddressSave }) => {
    const { i18n } = useTranslation();
    const { user } = useAuth();
    const [existingAddress, setExistingAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        province: "",
        description: ""
    });
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // Fetch existing address when popup opens
    useEffect(() => {
        if (isOpen && user?.userId) {
            fetchExistingAddress();
        }
    }, [isOpen, user?.userId]);

    const fetchExistingAddress = async () => {
        setIsLoading(true);
        try {
            const fp = await getDeviceFingerprint();
            const response = await axios.get(`${BASE_URL}/accounts/address/${user.userId}`, {
                headers: { "device-fingerprint": fp },
                withCredentials: true,
            });

            // ดึงข้อมูลที่อยู่จาก index แรกเท่านั้น
            const firstAddress = response.data.Address[0].address ?? null;

            // ตรวจสอบว่าข้อมูลที่อยู่มีข้อมูลที่จำเป็น
            if (firstAddress && (firstAddress.address || firstAddress.city || firstAddress.province)) {
                setExistingAddress(firstAddress);
            } else {
                setExistingAddress(null);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            setExistingAddress(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmExistingAddress = () => {
        if (existingAddress) {
            onAddressConfirm(existingAddress);
            onClose();
        }
    };

    const handleCreateNewAddress = () => {
        setShowForm(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setShowConfirmPopup(true);
    };

    const handleConfirmSave = async () => {
        setIsLoading(true);
        setShowConfirmPopup(false);

        try {
            const fp = await getDeviceFingerprint();
            const response = await axios.patch(
                `${BASE_URL}/accounts/address/${user.userId}`,
                {
                    newAddress: [formData]
                },
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                }
            );

            console.log("Address saved successfully:", response.data);
            onClose();
            setShowForm(false);
            onAddressSave(formData);
        } catch (error) {
            console.error("Error saving address:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกที่อยู่");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSave = () => {
        setShowConfirmPopup(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1100,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    width: "min(500px, 92vw)",
                    maxHeight: "80vh",
                    padding: 20,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    overflow: "auto",
                }}
            >
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <div>กำลังโหลด...</div>
                    </div>
                ) : existingAddress && !showForm ? (
                    // Condition 1: User has existing address
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
                            ระบุที่อยู่จัดส่ง
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>พบข้อมูลที่อยู่ปัจจุบัน:</div>
                            <div style={{
                                padding: 12,
                                background: "#f8f9fa",
                                borderRadius: 8,
                                border: "1px solid #e9ecef",
                                marginBottom: 8
                            }}>
                                <div><strong>ที่อยู่:</strong> {existingAddress.address}</div>
                                <div><strong>เมือง:</strong> {existingAddress.city}</div>
                                <div><strong>จังหวัด:</strong> {existingAddress.province}</div>
                                {existingAddress.description && (
                                    <div><strong>รายละเอียด:</strong> {existingAddress.description}</div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                            <button
                                onClick={handleConfirmExistingAddress}
                                style={{
                                    padding: "10px 20px",
                                    background: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                ใช่ ใช้ที่อยู่นี้
                            </button>
                            <button
                                onClick={handleCreateNewAddress}
                                style={{
                                    padding: "10px 20px",
                                    background: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                ไม่ ใช้ที่อยู่อื่น
                            </button>
                        </div>
                    </div>
                ) : (
                    // Condition 2: User has no address or wants to create new one
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
                            {existingAddress ? "ใช้ที่อยู่อื่น" : "กรอกข้อมูลที่อยู่"}
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    ที่อยู่ *
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="กรอกที่อยู่"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    เมือง *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="กรอกชื่อเมือง"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    จังหวัด *
                                </label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="กรอกชื่อจังหวัด"
                                />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    รายละเอียดเพิ่มเติม
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                        minHeight: 60,
                                        resize: "vertical",
                                    }}
                                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#6c757d",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{
                                        padding: "10px 20px",
                                        background: isLoading ? "#ccc" : "#28a745",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {isLoading ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Confirmation Popup */}
            {showConfirmPopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1200,
                    }}
                    onClick={handleCancelSave}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(400px, 90vw)",
                            padding: 24,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                    >
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
                            ต้องการบันทึกที่อยู่นี้ในข้อมูลส่วนตัวของคุณมั้ย
                        </div>
                        <div style={{ marginBottom: 20, textAlign: "center", color: "#666" }}>
                            ข้อมูลที่อยู่จะถูกบันทึกและสามารถใช้ในการสั่งซื้อครั้งต่อไปได้
                        </div>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                            <button
                                onClick={handleCancelSave}
                                style={{
                                    padding: "10px 20px",
                                    background: "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                ไม่
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                disabled={isLoading}
                                style={{
                                    padding: "10px 20px",
                                    background: isLoading ? "#ccc" : "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {isLoading ? "กำลังบันทึก..." : "ใช่"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressPopup;
