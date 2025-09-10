// ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getDeviceFingerprint } from "../lib/fingerprint";

function ProductDetail() {
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/shopping/product/${productId}`);
        setProduct(res.data);
        setError("");
      } catch (err) {
        setError("ไม่พบสินค้า หรือเกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

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
      throw err;
    }
  };

  const handleAddToBasket = async () => {
    if (!isLoggedIn || !user?.userId) {
      setAddError("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า");
      return;
    }
    if (!selectedVariant || !product?._id) return;
    const qty = Number(quantityToAdd) || 1;
    if (qty <= 0) {
      setAddError("จำนวนต้องมากกว่า 0");
      return;
    }
    setAdding(true);
    setAddError("");
    setAddSuccess("");
    try {
      const uid = user.userId;
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
      setAddSuccess("เพิ่มสินค้าลงตะกร้าแล้ว");
      // รีเฟรชหน้าเพื่ออัปเดตจำนวนสินค้าในปุ่ม Basket
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "เกิดข้อผิดพลาด";
      setAddError(String(msg));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>กำลังโหลดข้อมูลสินค้า...</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 12 }}>{error}</div>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 16px" }}>
          กลับ
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
            <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>No image</div>
          )}
        </div>
        <div>
          <h2 style={{ margin: "8px 0" }}>{product.title?.th || product.title?.en || "Untitled"}</h2>
          <div style={{ color: "#444", margin: "12px 0" }}>
            {product.description?.th || product.description?.en || ""}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, margin: "12px 0" }}>
            {new Intl.NumberFormat("th-TH", { style: "currency", currency: product.currency || "THB", maximumFractionDigits: 0 }).format(product.originalPrice || 0)}
          </div>
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Variants</div>
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
                    <div style={{ fontWeight: 600 }}>{v.sku}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      {v.attributes?.size ? `Size: ${v.attributes.size}` : ""}
                      {v.attributes?.color ? `\u00A0\u00A0Color: ${v.attributes.color}` : ""}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14 }}>
                      Qty: {v.quantity} | Sold: {v.soldQuantity}
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
              <div style={{ fontWeight: 700 }}>Variant: {selectedVariant.sku}</div>
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
                  <div style={{ width: "100%", height: 360, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>No images</div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ marginBottom: 8, color: "#555" }}>
                  {selectedVariant.attributes?.size ? `Size: ${selectedVariant.attributes.size}` : ""}
                  {selectedVariant.attributes?.color ? `\u00A0\u00A0Color: ${selectedVariant.attributes.color}` : ""}
                  {selectedVariant.attributes?.material ? `\u00A0\u00A0Material: ${selectedVariant.attributes.material}` : ""}
                </div>
                {selectedVariant.price != null && (
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                    {new Intl.NumberFormat("th-TH", { style: "currency", currency: product.currency || "THB", maximumFractionDigits: 0 }).format(selectedVariant.price)}
                  </div>
                )}
                <div style={{ color: "#666" }}>Qty: {selectedVariant.quantity} | Sold: {selectedVariant.soldQuantity}</div>

                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <label htmlFor="qtyInput" style={{ fontSize: 14, color: "#444" }}>จำนวน:</label>
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
                    {adding ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
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
                    ปิด
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


