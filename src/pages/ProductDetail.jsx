// ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";
import { useTranslation } from "react-i18next";

const getFPConfig = async () => {
  const fp = await getDeviceFingerprint();
  return { headers: { 'device-fingerprint': fp }, withCredentials: true };
};

function ProductDetail() {
  const { t, i18n } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL;
  const { user, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/shopping/product/${productId}`);
      setProduct(res.data);
      setError("");
    } catch (err) {
      setError("Internal Error.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    // ตรวจสอบว่า user login แล้วหรือยัง
    if (!isLoggedIn || !user?.userId) {
      setIsInWishlist(false);
      return;
    }

    try {
      const config = await getFPConfig();
      const res = await axios.get(`${BASE_URL}/shopping/wishlist/${user?.userId}`,
        config
      );
      const wishlistItems = res.data.wishlist.items;
      setWishlist(wishlistItems);
      
      // ใช้ข้อมูลที่ได้จาก API แทนการใช้ state เก่า
      for (const item of wishlistItems) {
        if (item.productId === productId || item.productId._id === productId) {
          setIsInWishlist(true);
          return; // หยุดทันทีเมื่อพบ
        }
      }
      // ถ้าไม่พบในรายการ wishlist ให้ set เป็น false
      setIsInWishlist(false);
    }
    catch (error) {
      console.error("Error fetching wishlist:", error);
      setIsInWishlist(false);
    }
  }

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  // useEffect แยกสำหรับ wishlist เพื่อให้ทำงานเมื่อ user เปลี่ยน
  useEffect(() => {
    fetchWishlist();
  }, [user, isLoggedIn, productId]);

  const handleAddToWishlist = async () => {
    if (!isLoggedIn || !user?.userId) {
      alert(i18n.language === "th" ? "กรุณาเข้าสู่ระบบก่อน" : "Please login first");
      return;
    }
    
    try {
      const config = await getFPConfig();
      await axios.patch(`${BASE_URL}/shopping/wishlist/add-item`,
        {
          userId: user?.userId,
          productId: product._id
        },
        config
      );
      // อัปเดต state หลังจากเพิ่มสำเร็จ
      setIsInWishlist(true);
      // รีเฟรช wishlist เพื่อให้ข้อมูลเป็นปัจจุบัน
      fetchWishlist();
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  }

  const handleRemoveFromWishlist = async () => {
    if (!isLoggedIn || !user?.userId) {
      alert(i18n.language === "th" ? "กรุณาเข้าสู่ระบบก่อน" : "Please login first");
      return;
    }
    
    try {
      const config = await getFPConfig();
      await axios.patch(`${BASE_URL}/shopping/wishlist/remove-item`,
        {
          userId: user?.userId,
          productId: product._id
        },
        config
      );
      // อัปเดต state หลังจากลบสำเร็จ
      setIsInWishlist(false);
      // รีเฟรช wishlist เพื่อให้ข้อมูลเป็นปัจจุบัน
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  }

  const ensureBasketAndGetId = async (uid) => {
    try {
      const fp = await getDeviceFingerprint();
      const res = await axios.get(`${BASE_URL}/shopping/basket/${uid}`,
        { headers: { "device-fingerprint": fp }, withCredentials: true }
      );
      return res.data?._id;
    } catch (err) {
      if (err?.response?.status === 404) {
        const fp = await getDeviceFingerprint();
        await axios.post(`${BASE_URL}/shopping/basket`, { userId: uid },
          { headers: { "device-fingerprint": fp }, withCredentials: true }
        );
        // fetch newly created
        const res2 = await axios.get(`${BASE_URL}/shopping/basket/${uid}`,
          { headers: { "device-fingerprint": fp }, withCredentials: true }
        );
        return res2.data?._id;
      }
      console.log(`Error ensureBasketAndGetId: ${err}.`)
    }
  };


  const handleAddToBasket = async () => {
    if (!isLoggedIn || !user?.userId) {
      setAddError("Please Login.");
      return;
    }

    if (!selectedVariant || !product?._id) return;
    const qty = Number(quantityToAdd) || 1;
    if (qty <= 0) {
      setAddError("Unable to add product with 1 quantity.");
      return;
    }
    setAdding(true);
    setAddError("");
    setAddSuccess("");
    const uid = user.userId

    try {
      const basketId = await ensureBasketAndGetId(uid);
      const fp = await getDeviceFingerprint();
      await axios.patch(
        `${BASE_URL}/shopping/basket/addproduct-basket/${basketId}`,
        {
          userId: uid,
          items: [
            {
              productId: product._id,
              variant: { sku: selectedVariant.sku },
              quantity: qty,
            },
          ],
        },
        { headers: { "device-fingerprint": fp }, withCredentials: true }
      );
      setAddSuccess("Add to basket complete");
      // รีเฟรชหน้าเพื่ออัปเดตจำนวนสินค้าในปุ่ม Basket
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Internal Error.";
      setAddError(String(msg));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        {(i18n.language === "th" ? 'กำลังโหลดข้อมูลสินค้า...' : 'Loading Products...')}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 12 }}>{error}</div>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 16px" }}>
          {(i18n.language === "th" ? 'กลับ' : 'back')}
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const cover = product.image && product.image.length > 0 ? product.image[0].fileName : null;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#f7f7f7", borderRadius: 8, overflow: "hidden" }}>
          {cover ? (
            <img src={cover} alt={product.title?.en || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
              {(i18n.language === "th" ? 'ไม่มีรูปภาพ' : 'No image')}
            </div>
          )}
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0" }}>

            <h2 style={{ margin: 0, flex: 1 }}>
              {(i18n.language === "th" ? product.title?.th || product.title.en || 'ไม่พบชื่อสินค้า' : product.title?.en || product.title.th || 'Unknow Product Name.')}
            </h2>

            {/* Wishlist Heart Button */}
            {isInWishlist ?
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "12px"
                }}
                onClick={handleRemoveFromWishlist}
                title={i18n.language === "th" ? "ลบออกจากรายการโปรด" : "remove from wishlist"}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#dc2626"   // ทำให้หัวใจทึบสีแดง
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 
      7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              :
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "12px"
                }}
                onClick={handleAddToWishlist}
                title={i18n.language === "th" ? "เพิ่มในรายการโปรด" : "Add to wishlist"}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            }



          </div>

          <div style={{ color: "#444", margin: "12px 0" }}>
            {(i18n.language === "th" ? product.description?.th || product.description?.en || "ไม่มีคำอธิบาย" : product.description?.en || product.description?.th || "No Description.")}          </div>
          <div style={{ fontSize: 20, fontWeight: 600, margin: "12px 0" }}>
            {new Intl.NumberFormat("th-TH", { style: "currency", currency: product.currency || "THB", maximumFractionDigits: 0 }).format(product.originalPrice || 0)}
          </div>
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {(i18n.language === "th" ? 'ตัวแปรของสินค้า' : 'Variants')}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                {product.variants.map((v) => (
                  <div
                    key={v.sku}
                    onClick={() => {
                      setSelectedVariant(v);
                      setCurrentImageIndex(0);
                      setIsVariantModalOpen(true);
                    }}
                    style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, cursor: "pointer", background: "#fff" }}
                  >
                    {Array.isArray(v.images) && v.images.length > 0 ? (
                      <div style={{ marginBottom: 8, background: "#f7f7f7", borderRadius: 6, overflow: "hidden" }}>
                        <img
                          src={v.images[0]?.fileName}
                          alt={`${v.sku}-cover`}
                          style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                    ) : null}
                    <div style={{ fontWeight: 600 }}>{v.sku}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      {v.attributes?.size ? (i18n.language === "th" ? `ขนาด: ${v.attributes.size}` : `Size: ${v.attributes.size}`) : ""}
                      {v.attributes?.color ? (i18n.language === "th" ? `\u00A0\u00A0สี: ${v.attributes.color}` : `\u00A0\u00A0Color: ${v.attributes.color}`) : ""}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14 }}>
                      {(i18n.language === "th" ? (
                        <>
                          จำนวนสินค้าคงเหลิอ: {v.quantity} <br />
                          จำนวนสินค้าที่ขายไปแล้ว: {v.soldQuantity}
                        </>
                      ) : ` Qty: ${v.quantity} | Sold: ${v.soldQuantity}`)}
                    </div>
                    {v.price != null && (
                      <div style={{ marginTop: 6, fontWeight: 600 }}>
                        {new Intl.NumberFormat("th-TH", { style: "currency", currency: product.currency || "THB", maximumFractionDigits: 0 }).format(v.price)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isVariantModalOpen && selectedVariant && (
        <div
          onClick={() => setIsVariantModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 900,
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 700 }}>
                {(i18n.language === "th" ? `ตัวแปรสินค้า: ${selectedVariant.sku}` : `Variant: ${selectedVariant.sku}`)}
              </div>
              <button onClick={() => setIsVariantModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 0 }}>
              <div style={{ background: "#f8f8f8", position: "relative", minHeight: 360 }}>
                {Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0 ? (
                  <>
                    <img
                      src={selectedVariant.images[currentImageIndex]?.fileName}
                      alt={selectedVariant.sku}
                      style={{ width: "100%", height: 360, objectFit: "cover" }}
                    />
                    {selectedVariant.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((idx) => (idx - 1 + selectedVariant.images.length) % selectedVariant.images.length)}
                          style={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((idx) => (idx + 1) % selectedVariant.images.length)}
                          style={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
                        >
                          ›
                        </button>
                      </>
                    )}
                    <div style={{ display: "flex", gap: 8, padding: 12, overflowX: "auto", background: "#f8f8f8", borderTop: "1px solid #eee" }}>
                      {selectedVariant.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.fileName}
                          alt={`${selectedVariant.sku}-${idx}`}
                          onClick={() => setCurrentImageIndex(idx)}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: idx === currentImageIndex ? "2px solid #333" : "1px solid #ddd",
                            cursor: "pointer",
                            background: "#fff"
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 360,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa"
                    }}>
                    {(i18n.language === "th" ? 'ไม่มีรูปภาพ' : 'No image')}
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 8, color: "#555" }}>
                  {selectedVariant.attributes?.size ? (i18n.language === "th" ? `ขนาด: ${selectedVariant.attributes.size}` : `Size: ${selectedVariant.attributes.size}`) : ""}
                  {selectedVariant.attributes?.color ? (i18n.language === "th" ? `\u00A0\u00A0สี: ${selectedVariant.attributes.color}` : `\u00A0\u00A0Color: ${selectedVariant.attributes.color}`) : ""}
                  {selectedVariant.attributes?.material ? (i18n.language === "th" ? `\u00A0\u00A0วัสดุ: ${selectedVariant.attributes.material}` : `\u00A0\u00A0Cotton: ${selectedVariant.attributes.material}`) : ""}
                </div>
                {selectedVariant.price != null && (
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                    {new Intl.NumberFormat("th-TH", { style: "currency", currency: product.currency || "THB", maximumFractionDigits: 0 }).format(selectedVariant.price)}
                  </div>
                )}
                <div style={{ color: "#666" }}>
                  {(i18n.language === "th" ? (
                    <>
                      จำนวนสินค้าคงเหลิอ: {selectedVariant.quantity} <br />
                      จำนวนสินค้าที่ขายไปแล้ว: {selectedVariant.soldQuantity}
                    </>
                  ) : ` Qty: ${selectedVariant.quantity} | Sold: ${selectedVariant.soldQuantity}`)}
                </div>

                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <label htmlFor="qtyInput" style={{ fontSize: 14, color: "#444" }}>
                    {(i18n.language === "th" ? 'จำนวน' : 'Select quantity')}
                  </label>
                  <input
                    id="qtyInput"
                    type="number"
                    min={1}
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    style={{ width: 80, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8 }}
                  />
                  <button
                    onClick={handleAddToBasket}
                    disabled={adding}
                    style={{ padding: "10px 16px", background: adding ? "#6b7280" : "#16a34a", color: "#fff", borderRadius: 8, border: "none", cursor: adding ? "not-allowed" : "pointer" }}
                  >
                    {adding ? (i18n.language === "th" ? 'กำลังเพิ่ม...' : 'Adding') : (i18n.language === "th" ? 'เพิ่มลงตะกร้า' : 'Add to Basket')}
                  </button>
                </div>

                {addError && (
                  <div style={{ marginTop: 8, color: "#b91c1c", fontSize: 14 }}>{addError}</div>
                )}
                {addSuccess && (
                  <div style={{ marginTop: 8, color: "#065f46", fontSize: 14 }}>{addSuccess}</div>
                )}

                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setIsVariantModalOpen(false)}
                    style={{ padding: "10px 16px", background: "#111", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
                  >
                    {(i18n.language === "th" ? 'ยกเลิก' : 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;


