import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";

const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;

function CategoryConfig() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalCreate, setModalCreate] = useState(null);
    const [modalEdit, setModalEdit] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
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
        setLoading(true)
        const userId = user.userId


        try {
            const fp = await getDeviceFingerprint();
            const response = await axios.post(
                `${BASE_URL}/shopping/category`,
                {
                    creatorId: userId,
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    status: formData.status
                },
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                }
            );
            console.log("Category created successfully:", response.data);
            setModalCreate(false);
            fetchCategories();
        }
        catch (error) {
            console.error("Error creating category:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการสร้าง category",error.response?.data || error);
        } finally {
            setLoading(false)
        }
    }

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
        const userId = user.userId;

        try {
            const fp = await getDeviceFingerprint();
            const response = await axios.patch(
                `${BASE_URL}/shopping/category/${editingCategory._id}`,
                {
                    creatorId: userId,
                    name: editFormData.name,
                    slug: editFormData.slug,
                    description: editFormData.description,
                    status: editFormData.status
                },
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                }
            );
            console.log("Category updated successfully:", response.data);
            setModalEdit(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error("Error updating category:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการอัพเดต category", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบ category "${categoryName}"?`)) {
            return;
        }

        setLoading(true);
        try {
            const fp = await getDeviceFingerprint();
            const response = await axios.delete(
                `${BASE_URL}/shopping/category/${categoryId}`,
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                }
            );
            console.log("Category deleted successfully:", response.data);
            alert("ลบ category สำเร็จ");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error.response?.data || error);
            alert("เกิดข้อผิดพลาดในการลบ category", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading categories...</span>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "en-name") {
            setFormData(prev => ({
                ...prev,
                name: {
                    ...prev.name,
                    en: value
                }
            }));
        }
        else if (name === "th-name") {
            setFormData(prev => ({
                ...prev,
                name: {
                    ...prev.name,
                    th: value
                }
            }));
        }
        else if (name === "en-description") {
            setFormData(prev => ({
                ...prev,
                description: {
                    ...prev.description,
                    en: value
                }
            }));
        }
        else if (name === "th-description") {
            setFormData(prev => ({
                ...prev,
                description: {
                    ...prev.description,
                    th: value
                }
            }));
        }
        else if (name === "slug") {
            setFormData(prev => ({
                ...prev,
                slug: value
            }));
        }
        else if (name === "status") {
            setFormData(prev => ({
                ...prev,
                status: value
            }));
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "edit-en-name") {
            setEditFormData(prev => ({
                ...prev,
                name: {
                    ...prev.name,
                    en: value
                }
            }));
        }
        else if (name === "edit-th-name") {
            setEditFormData(prev => ({
                ...prev,
                name: {
                    ...prev.name,
                    th: value
                }
            }));
        }
        else if (name === "edit-en-description") {
            setEditFormData(prev => ({
                ...prev,
                description: {
                    ...prev.description,
                    en: value
                }
            }));
        }
        else if (name === "edit-th-description") {
            setEditFormData(prev => ({
                ...prev,
                description: {
                    ...prev.description,
                    th: value
                }
            }));
        }
        else if (name === "edit-slug") {
            setEditFormData(prev => ({
                ...prev,
                slug: value
            }));
        }
        else if (name === "edit-status") {
            setEditFormData(prev => ({
                ...prev,
                status: value
            }));
        }
        else if (name === "edit-imageUrls") {
            const urls = value.split('\n').filter(url => url.trim() !== '');
            setEditFormData(prev => ({
                ...prev,
                imageUrls: urls
            }));
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="text-red-500 mb-4">{error}</div>
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
            <div className="p-4">
                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => {
                            setModalCreate(true)
                        }}
                        style={{
                            padding: "12px 20px",
                            fontSize: "18px",
                            background: "#635bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            boxShadow: "0 2px 8px rgba(99,91,255,0.15)",
                        }}
                    >
                        Create New Category
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No categories found
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 max-w-xl mx-auto">
                        {categories.map((category, index) => (
                            <div
                                key={category.id || index}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {category.name?.en || "No name"}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {category.description?.en || "No description"}
                                        </p>
                                        
                                        <div className="flex flex-col sm:flex-row gap-4 mt-3">
                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-16">Slug:</span>
                                                <span className="text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                                    {category.slug || "N/A"}
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <span className="text-sm font-medium text-gray-500 w-16">Status:</span>
                                                <span
                                                    className={`text-sm px-2 py-1 rounded ${category.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : category.status === "inactive"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {category.status || "Unknown"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 flex gap-2">
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
                                                    strokeWidth={2} 
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
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
                                </div>
                            </div>
                        ))}
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
                        zIndex: 1100,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(420px, 92vw)",
                            padding: 20,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                            Cerate New Category
                        </div>
                        <form onSubmit={handleSubmitCreate}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    Thai name
                                </label>
                                <input
                                    type="text"
                                    name="th-name"
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="name"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    English name
                                </label>
                                <input
                                    type="text"
                                    name="en-name"
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="name"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="slug (unique)"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    Thai Description
                                </label>
                                <textarea
                                    name="th-description"
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
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    English Description
                                </label>
                                <textarea
                                    name="en-description"
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
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    status
                                </label>
                                <input
                                    type="text"
                                    name="status"
                                    onChange={handleInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="active - inactive"
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalCreate(false)
                                    }}
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: "10px 20px",
                                        background: loading ? "#ccc" : "#28a745",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
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
                        zIndex: 1100,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            width: "min(420px, 92vw)",
                            padding: 20,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                            Edit Category
                        </div>
                        <form onSubmit={handleSubmitUpdate}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    Thai name
                                </label>
                                <input
                                    type="text"
                                    name="edit-th-name"
                                    value={editFormData.name.th}
                                    onChange={handleEditInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="name"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    English name
                                </label>
                                <input
                                    type="text"
                                    name="edit-en-name"
                                    value={editFormData.name.en}
                                    onChange={handleEditInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="name"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    slug
                                </label>
                                <input
                                    type="text"
                                    name="edit-slug"
                                    value={editFormData.slug}
                                    onChange={handleEditInputChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="slug (unique)"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    Thai Description
                                </label>
                                <textarea
                                    name="edit-th-description"
                                    value={editFormData.description.th}
                                    onChange={handleEditInputChange}
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
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    English Description
                                </label>
                                <textarea
                                    name="edit-en-description"
                                    value={editFormData.description.en}
                                    onChange={handleEditInputChange}
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
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                                    status
                                </label>
                                <input
                                    type="text"
                                    name="edit-status"
                                    value={editFormData.status}
                                    onChange={handleEditInputChange}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        fontSize: 14,
                                    }}
                                    placeholder="active - inactive"
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModalEdit(false);
                                        setEditingCategory(null);
                                    }}
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: "10px 20px",
                                        background: loading ? "#ccc" : "#28a745",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: loading ? "not-allowed" : "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {loading ? "กำลังบันทึก..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>

    );
}

export default CategoryConfig;
