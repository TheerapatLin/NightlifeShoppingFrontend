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
    const [formData, setFormData] = useState({ address: "", city: "", province: "", description: "" });
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // style reuse
    const btnStyle = base => ({
        padding: "10px 20px",
        border: "none",
        borderRadius: 8,
        fontWeight: "bold",
        ...base
    });
    const inputStyle = {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: 6,
        fontSize: 14
    };
    const labelStyle = {
        display: "block",
        marginBottom: 4,
        fontWeight: 600
    };

    const handleConfirmNotSave = async () => {
        setShowConfirmPopup(false)
        setShowForm(false)
        onAddressSave?.(formData);
    }

    useEffect(() => {
        if (isOpen && user?.userId) fetchExistingAddress();
        // eslint-disable-next-line
    }, [isOpen, user?.userId]);

    const fetchExistingAddress = async () => {
        setIsLoading(true);
        try {
            const fp = await getDeviceFingerprint();
            const res = await axios.get(`${BASE_URL}/accounts/address/${user.userId}`,
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true
                }
            );
            const firstAddress = res.data.Address[0]?.address ?? null;
            setExistingAddress(firstAddress && (firstAddress.address || firstAddress.city || firstAddress.province) ? firstAddress : null);
        } catch (e) {
            setExistingAddress(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddress = (address) => {
        onAddressConfirm?.(address);
        onClose();
    };

    const handleFormSubmit = e => {
        e.preventDefault();
        setShowConfirmPopup(true);
    };

    const handleConfirmSave = async () => {
        setIsLoading(true);
        setShowConfirmPopup(false);
        try {
            const fp = await getDeviceFingerprint();
            await axios.patch(
                `${BASE_URL}/accounts/address/${user.userId}`,
                {
                    newAddress: [formData]
                },
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true
                }
            );
            onClose();
            setShowForm(false);
            onAddressSave?.(formData);
        } catch (e) {
            alert("เกิดข้อผิดพลาดในการบันทึกที่อยู่");
        } finally {
            setIsLoading(false);
        }
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
                zIndex: 1100
            }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    width: "min(500px, 92vw)",
                    maxHeight: "80vh",
                    padding: 20,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    overflow: "auto"
                }}                >
                {isLoading ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 20
                        }}>
                        กำลังโหลด...
                    </div>
                ) : existingAddress && !showForm ? (
                    <div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 16,
                                textAlign: "center"
                            }}>
                            ระบุที่อยู่จัดส่ง
                        </div>
                        <div
                            style={{
                                marginBottom: 16
                            }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    marginBottom: 8
                                }}>
                                พบข้อมูลที่อยู่ปัจจุบัน:
                            </div>
                            <div
                                style={{
                                    padding: 12,
                                    background: "#f8f9fa",
                                    borderRadius: 8,
                                    border: "1px solid #e9ecef",
                                    marginBottom: 8
                                }}>
                                <div>
                                    <strong>
                                        ที่อยู่:
                                    </strong>
                                    {existingAddress.address}
                                </div>
                                <div>
                                    <strong>
                                        เมือง:
                                    </strong>
                                    {existingAddress.city}
                                </div>
                                <div>
                                    <strong>
                                        จังหวัด:
                                    </strong>
                                    {existingAddress.province}
                                </div>
                                {existingAddress.description && <div>
                                    <strong>
                                        รายละเอียด:
                                    </strong>
                                    {existingAddress.description}
                                </div>}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "center"
                            }}>
                            <button
                                onClick={() => handleAddress(existingAddress)}
                                style={btnStyle({
                                    background: "#28a745",
                                    color: "#fff",
                                    cursor: "pointer"
                                })}>
                                ใช่ ใช้ที่อยู่นี้
                            </button>
                            <button onClick={() => setShowForm(true)}
                                style={btnStyle({
                                    background: "#6c757d",
                                    color: "#fff",
                                    cursor: "pointer"
                                })}>
                                ไม่ ใช้ที่อยู่อื่น
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 16,
                                textAlign: "center"
                            }}>
                            {existingAddress ? "ใช้ที่อยู่อื่น" : "กรอกข้อมูลที่อยู่"}
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            {[{
                                label: "ที่อยู่ *",
                                name: "address",
                                type: "text",
                                placeholder: "กรอกที่อยู่",
                                required: true
                            },
                            {
                                label: "เมือง *",
                                name: "city",
                                type: "text",
                                placeholder: "กรอกชื่อเมือง",
                                required: true
                            },
                            {
                                label: "จังหวัด *",
                                name: "province",
                                type: "text",
                                placeholder: "กรอกชื่อจังหวัด",
                                required: true
                            }].map(f => (
                                <div key={f.name} style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>
                                        {f.label}
                                    </label>
                                    <input
                                        type={f.type}
                                        name={f.name}
                                        value={formData[f.name]}
                                        onChange={e => setFormData(prev => ({
                                            ...prev, [f.name]: e.target.value
                                        }))
                                        }
                                        required={f.required}
                                        style={inputStyle}
                                        placeholder={f.placeholder} />
                                </div>
                            ))}
                            <div style={{ marginBottom: 20 }}>
                                <label style={labelStyle}>
                                    รายละเอียดเพิ่มเติม
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({
                                        ...prev, description: e.target.value
                                    }))
                                    }
                                    style={{
                                        ...inputStyle,
                                        minHeight: 60,
                                        resize: "vertical"
                                    }}
                                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    justifyContent: "center"
                                }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={btnStyle({
                                        background: "#6c757d",
                                        color: "#fff",
                                        cursor: "pointer"
                                    })}>
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={btnStyle({
                                        background: isLoading ? "#ccc" : "#28a745",
                                        color: "#fff",
                                        cursor: isLoading ? "not-allowed" : "pointer"
                                    })}>
                                    {isLoading ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            {showConfirmPopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1200
                    }}
                    onClick={() => setShowConfirmPopup(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(400px, 90vw)",
                            padding: 24,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                        }}>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 16,
                                textAlign: "center"
                            }}>
                            ต้องการบันทึกที่อยู่นี้ในข้อมูลส่วนตัวของคุณมั้ย
                        </div>
                        <div
                            style={{
                                marginBottom: 20,
                                textAlign: "center",
                                color: "#666"
                            }}>
                            ข้อมูลที่อยู่จะถูกบันทึกและสามารถใช้ในการสั่งซื้อครั้งต่อไปได้
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "center"
                            }}>
                            <button onClick={() => {

                                handleConfirmNotSave()
                                onClose()
                            }}
                                style={btnStyle({
                                    background: "#6c757d",
                                    color: "#fff",
                                    cursor: "pointer"
                                })}>
                                ไม่
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                disabled={isLoading}
                                style={btnStyle({
                                    background: isLoading ? "#ccc" : "#28a745",
                                    color: "#fff",
                                    cursor: isLoading ? "not-allowed" : "pointer"
                                })}>
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
