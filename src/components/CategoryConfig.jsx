import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

// style reuse
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
const btnStyle = base => ({
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold", ...base
});
const successPopupStyle = {
    position: "fixed",
    bottom: 20, left: 20,
    background: "#28a745",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1200,
    fontSize: 16,
    fontWeight: 600,
    animation: "slideUp 0.3s ease-out"
};

function CategoryConfig() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalCreate, setModalCreate] = useState(null);
    const [modalEdit, setModalEdit] = useState(null);
    const [modalDelete, setModalDelete] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: {
            en: "",
            th: ""
        },
        slug: "",
        description: {
            en: "",
            th: ""
        },
        status: ""
    });
    const [editFormData, setEditFormData] = useState({
        name: {
            en: "",
            th: ""
        },
        slug: "",
        description: {
            en: "",
            th: ""
        },
        status: "",
        imageUrls: []
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fp = await getDeviceFingerprint();
            await axios.post(`${BASE_URL}/shopping/category`,
                {
                    creatorId: user.userId,
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    status: formData.status
                }, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            }
            );
            setModalCreate(false);
            setSuccessPopup({ show: true, message: "Create Complete" });
            fetchCategories();
            setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
        } catch (error) {
            console.error("Error creating category:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการสร้าง category", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${BASE_URL}/shopping/category`);

            // ✅ sort categories by name.en
            const sorted = (response.data.data || response.data).sort((a, b) =>
                (a.name?.en || "").localeCompare(b.name?.en || "")
            );

            setCategories(sorted);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryDetails = async (categoryId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/shopping/category/${categoryId}`);
            const categoryData = response.data.data || response.data;

            setEditFormData({
                name: {
                    en: categoryData.name?.en || "",
                    th: categoryData.name?.th || ""
                },
                slug: categoryData.slug || "",
                description: {
                    en: categoryData.description?.en || "",
                    th: categoryData.description?.th || ""
                },
                status: categoryData.status || "",
            });

            setEditingCategory(categoryData);
            setModalEdit(true);
        } catch (err) {
            console.error("Error fetching category details:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูล category");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fp = await getDeviceFingerprint();
            await axios.patch(`${BASE_URL}/shopping/category/${editingCategory._id}`,
                {
                    creatorId: user.userId,
                    name: editFormData.name,
                    slug: editFormData.slug,
                    description: editFormData.description,
                    status: editFormData.status
                }, {
                headers: { "device-fingerprint": fp },
                withCredentials: true
            }
            );
            setModalEdit(false);
            setEditingCategory(null);
            setSuccessPopup({ show: true, message: "Update Complete" });
            fetchCategories();
            setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
        } catch (error) {
            console.error("Error updating category:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการอัพเดต category", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = (categoryId, categoryName) => {
        setDeletingCategory({ id: categoryId, name: categoryName });
        setModalDelete(true);
    };

    const confirmDeleteCategory = async () => {
        if (!deletingCategory) return;
        setLoading(true);
        setModalDelete(false);
        try {
            const fp = await getDeviceFingerprint();
            await axios.delete(`${BASE_URL}/shopping/category/${deletingCategory.id}`,
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true
                }
            );
            setSuccessPopup({ show: true, message: "Remove Complete" });
            fetchCategories();
            setTimeout(() => setSuccessPopup({ show: false, message: "" }), 3000);
        } catch (error) {
            console.error("Error deleting category:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการลบ category", error.response?.data || error);
        } finally {
            setLoading(false);
            setDeletingCategory(null);
        }
    };

    // รวม handleInputChange และ handleEditInputChange
    const handleFormChange = (e, isEdit = false) => {
        const { name, value } = e.target;
        const prefix = isEdit ? "edit-" : "";
        const setForm = isEdit ? setEditFormData : setFormData;
        const form = isEdit ? editFormData : formData;
        if (name === `${prefix}en-name` || name === `${prefix}th-name`) {
            setForm(prev => ({
                ...prev,
                name:
                {
                    ...prev.name,
                    [name.replace(`${prefix}`, '').replace('-name', '')]: value
                }
            }));
        } else if (name === `${prefix}en-description` || name === `${prefix}th-description`) {
            setForm(prev => ({
                ...prev,
                description: {
                    ...prev.description,
                    [name.replace(`${prefix}`, '').replace('-description', '')]: value
                }
            }));
        } else if (name === `${prefix}slug` || name === `${prefix}status`) {
            setForm(prev => ({
                ...prev,
                [name.replace(`${prefix}`, '')]: value
            }));
        }
    };

    if (loading) {
        return (
            <div
                className="flex justify-center items-center p-8"
            >
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                >
                </div>
                <span
                    className="ml-2 text-gray-600"
                >
                    Loading categories...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex flex-col items-center justify-center p-8"
            >
                <div
                    className="text-red-500 mb-4"
                >
                    {error}
                </div>
                <button
                    onClick={fetchCategories}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @keyframes slideUp {
                        from {
                            transform: translateY(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <div
                className="p-4"
            >
                <div
                    className="flex justify-end mb-6"
                >
                    <button
                        onClick={() => setModalCreate(true)}
                        style={{
                            ...btnStyle({
                                background: "#635bff",
                                color: "#fff",
                                fontSize: 18,
                                boxShadow: "0 2px 8px rgba(99,91,255,0.15)"
                            })
                        }}
                    >
                        Create New Category
                    </button>
                </div>
                {categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No categories found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name (EN)
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name (TH)
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description (EN)
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((category, index) => (
                                    <tr key={category._id || index} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {category.name?.en || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {category.name?.th || '-'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {category.description?.en || '-'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                {category.slug || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : category.status === 'inactive'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {category.status || 'unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => fetchCategoryDetails(category._id)}
                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                    title="Edit Category"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category._id, category.name?.en || category.name?.th || "Unknown")}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    title="Delete Category"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {modalCreate && (
                <div
                    onClick={() => setModalCreate(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1100
                    }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(420px, 92vw)",
                            padding: 20,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            textAlign: "center"
                        }}>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 8
                            }}
                        >
                            Create New Category
                        </div>
                        <form onSubmit={handleSubmitCreate}>
                            {[{
                                label: "Thai name",
                                name: "th-name",
                                type: "text",
                                placeholder: "name"
                            }, {
                                label: "English name",
                                name: "en-name",
                                type: "text",
                                placeholder: "name"
                            }].map(f => (
                                <div
                                    key={f.name}
                                    style={{
                                        marginBottom: 16
                                    }}>
                                    <label
                                        style={labelStyle}>
                                        {f.label}
                                    </label>
                                    <input
                                        type={f.type}
                                        name={f.name}
                                        onChange={e => handleFormChange(e, false)}
                                        style={inputStyle}
                                        placeholder={f.placeholder}
                                    />
                                </div>
                            ))}
                            <div
                                style={{
                                    marginBottom: 16
                                }}>
                                <label
                                    style={labelStyle}>
                                    slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    onChange={e => handleFormChange(e, false)}
                                    required
                                    style={inputStyle}
                                    placeholder="slug (unique)"
                                />
                            </div>
                            {[{
                                label: "Thai Description",
                                name: "th-description"
                            }, {
                                label: "English Description",
                                name: "en-description"
                            }].map(f => (
                                <div
                                    key={f.name}
                                    style={{
                                        marginBottom: 16
                                    }}>
                                    <label
                                        style={labelStyle}>
                                        {f.label}
                                    </label>
                                    <textarea
                                        name={f.name}
                                        onChange={e => handleFormChange(e, false)}
                                        style={{
                                            ...inputStyle,
                                            minHeight: 60,
                                            resize: "vertical"
                                        }}
                                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                                    />
                                </div>
                            ))}
                            <div
                                style={{
                                    marginBottom: 16
                                }}>
                                <label
                                    style={labelStyle}
                                >
                                    status
                                </label>
                                <input
                                    type="text"
                                    name="status"
                                    onChange={e => handleFormChange(e, false)}
                                    style={inputStyle}
                                    placeholder="active - inactive"
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    justifyContent: "center"
                                }}>
                                <button
                                    type="button"
                                    onClick={() => setModalCreate(false)}
                                    style={btnStyle({
                                        background: "#6c757d",
                                        color: "#fff",
                                        cursor: "pointer"
                                    })}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={btnStyle({
                                        background: loading ? "#ccc" : "#28a745",
                                        color: "#fff",
                                        cursor: loading ? "not-allowed" : "pointer"
                                    })}>
                                    {loading ? "กำลังบันทึก..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {modalEdit && (
                <div
                    onClick={() => setModalEdit(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1100
                    }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(420px, 92vw)",
                            padding: 20,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            textAlign: "center"
                        }}>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 8
                            }}>
                            Edit Category
                        </div>
                        <form onSubmit={handleSubmitUpdate}>
                            {[{
                                label: "Thai name",
                                name: "edit-th-name",
                                value: editFormData.name.th,
                                type: "text", placeholder: "name"
                            }, {
                                label: "English name",
                                name: "edit-en-name",
                                value: editFormData.name.en,
                                type: "text",
                                placeholder: "name"
                            }].map(f => (
                                <div
                                    key={f.name}
                                    style={{
                                        marginBottom: 16
                                    }}>
                                    <label
                                        style={labelStyle}>
                                        {f.label}
                                    </label>
                                    <input
                                        type={f.type}
                                        name={f.name}
                                        value={f.value}
                                        onChange={e => handleFormChange(e, true)}
                                        style={inputStyle}
                                        placeholder={f.placeholder}
                                    />
                                </div>
                            ))}
                            <div
                                style={{
                                    marginBottom: 16
                                }}>
                                <label
                                    style={labelStyle}
                                >
                                    slug
                                </label>
                                <input
                                    type="text"
                                    name="edit-slug"
                                    value={editFormData.slug}
                                    onChange={e => handleFormChange(e, true)}
                                    required
                                    style={inputStyle}
                                    placeholder="slug (unique)"
                                />
                            </div>
                            {[{
                                label: "Thai Description",
                                name: "edit-th-description",
                                value: editFormData.description.th
                            }, {
                                label: "English Description",
                                name: "edit-en-description",
                                value: editFormData.description.en
                            }].map(f => (
                                <div
                                    key={f.name}
                                    style={{
                                        marginBottom: 16
                                    }}>
                                    <label
                                        style={labelStyle}
                                    >
                                        {f.label}
                                    </label>
                                    <textarea
                                        name={f.name}
                                        value={f.value}
                                        onChange={e => handleFormChange(e, true)}
                                        style={{
                                            ...inputStyle,
                                            minHeight: 60,
                                            resize: "vertical"
                                        }}
                                        placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                                    />
                                </div>
                            ))}
                            <div
                                style={{
                                    marginBottom: 16
                                }}>
                                <label
                                    style={labelStyle}
                                >
                                    status
                                </label>
                                <input
                                    type="text"
                                    name="edit-status"
                                    value={editFormData.status}
                                    onChange={e => handleFormChange(e, true)}
                                    style={inputStyle}
                                    placeholder="active - inactive"
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    justifyContent: "center"
                                }}>
                                <button
                                    type="button"
                                    onClick={() => { setModalEdit(false); setEditingCategory(null); }}
                                    style={btnStyle({
                                        background: "#6c757d",
                                        color: "#fff",
                                        cursor: "pointer"
                                    })}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={btnStyle({
                                        background: loading ? "#ccc" : "#28a745",
                                        color: "#fff",
                                        cursor: loading ? "not-allowed" : "pointer"
                                    })}>
                                    {loading ? "กำลังบันทึก..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {modalDelete && (
                <div
                    onClick={() => setModalDelete(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1100
                    }}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(400px, 90vw)",
                            padding: 24,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            textAlign: "center"
                        }}>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 16
                            }}>
                            ยืนยันการลบ
                        </div>
                        <div
                            style={{
                                marginBottom: 20,
                                color: "#666"
                            }}>
                            คุณแน่ใจหรือไม่ที่จะลบ category "{deletingCategory?.name}"?
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "center"
                            }}>
                            <button
                                onClick={() => setModalDelete(false)}
                                style={btnStyle({
                                    background: "#6c757d",
                                    color: "#fff",
                                    cursor: "pointer"
                                })}>
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmDeleteCategory}
                                disabled={loading}
                                style={btnStyle({
                                    background: loading ? "#ccc" : "#dc2626",
                                    color: "#fff",
                                    cursor: loading ? "not-allowed" : "pointer"
                                })}>
                                {loading ? "กำลังลบ..." : "ลบ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {successPopup.show && (
                <div
                    style={successPopupStyle}
                >
                    {successPopup.message}
                </div>
            )}
        </>
    );
}

export default CategoryConfig;
