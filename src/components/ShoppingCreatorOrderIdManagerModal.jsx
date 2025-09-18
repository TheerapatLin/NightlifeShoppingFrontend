import { useEffect, useState } from "react";
import axios from "axios";
import { getDeviceFingerprint } from "../lib/fingerprint";

const extractNoteMessages = (notes) => Array.isArray(notes)
    ? notes.map(n => (typeof n === 'string' ? n : (n?.message || ''))).filter(Boolean)
    : [];

const getFPConfig = async () => {
    const fp = await getDeviceFingerprint();
    return { headers: { 'device-fingerprint': fp }, withCredentials: true };
};

const buildAdminNotePayload = (notes) => (Array.isArray(notes) ? notes : [])
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .map(message => ({ message }));

const STATUS_OPTIONS = [
    "paid",
    "pending",
    "failed",
    "refunded",
    "cancelled",
    "processing",
    "successful"
];

const STATUS_PRODUCT_OPTIONS = [
    "preparing",
    "packed",
    "pending",
    "picked",
    "transit",
    "hub",
    "delivering",
    "delivered",
    "failed",
    "cancelled",
    "returning"
];

const ShoppingCreatorOrderIdManagerModal = ({ isOpen, onClose, creatorOrderId }) => {
    const BASE_URL = import.meta.env.VITE_BASE_API_URL_LOCAL?.replace(/\/$/, "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);

    // update adminNote & status
    const [editOrderAdminNotes, setEditOrderAdminNotes] = useState([]);
    const [newOrderAdminNote, setNewOrderAdminNote] = useState('');
    const [isEditOrderNoteOpen, setIsEditOrderNoteOpen] = useState(false);
    const [savingOrderNote, setSavingOrderNote] = useState(false);
    const [editStatus, setEditStatus] = useState('pending');

    const [isEditProductOrderOpen, setIsEditProductOrderOpen] = useState(false)
    const [product, setProduct] = useState(null)

    const fetchDetail = async () => {
        if (!isOpen || !creatorOrderId) return;
        setLoading(true);
        setError(null);
        try {
            const fp = await getDeviceFingerprint();
            const res = await axios.get(
                `${BASE_URL}/shopping/one-creatororder/${creatorOrderId}`,
                {
                    headers: { "device-fingerprint": fp },
                    withCredentials: true,
                }
            );
            setOrder(res?.data?.order || null);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Failed to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [isOpen, creatorOrderId]);

    if (!isOpen) return null;

    const openEditOrderNotes = (order) => {
        setEditOrderAdminNotes(extractNoteMessages(order?.adminNote));
        setNewOrderAdminNote('');
        setIsEditOrderNoteOpen(true);
        setEditStatus(order?.status || 'pending');
    };

    const closeEditOrderNotes = () => {
        setIsEditOrderNoteOpen(false);
        setEditOrderAdminNotes([]);
        setNewOrderAdminNote('');
        setEditStatus('pending');
    };

    const handleRemoveOrderNote = (indexToRemove) => {
        setEditOrderAdminNotes(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleAddOrderNote = () => {
        const trimmed = newOrderAdminNote.trim();
        if (!trimmed) return;
        setEditOrderAdminNotes(prev => [...prev, trimmed]);
        setNewOrderAdminNote('');
    };

    const handleSaveOrderNotes = async () => {
        if (!order?._id) return;
        try {
            setSavingOrderNote(true);
            const config = await getFPConfig();
            const adminNoteArray = buildAdminNotePayload(editOrderAdminNotes);

            await axios.patch(
                `${BASE_URL}/shopping/update-creatororder/${order._id}`,
                {
                    adminNote: adminNoteArray,
                    status: editStatus
                },
                config
            );

            const refreshed = await fetchDetail();
            if (Array.isArray(refreshed) && order?._id) {
                const updated = refreshed.find(o => o._id === order._id);
                if (updated) setOrder(updated);
            }
            closeEditOrderNotes();
        } catch (err) {
            console.error('Failed to update order admin notes:', err.response?.data || err);
        } finally {
            setSavingOrderNote(false);
        }
    };

    const openEditProductOrder = (product) => {
        setEditOrderAdminNotes(extractNoteMessages(product?.adminNote));
        setNewOrderAdminNote('');
        setIsEditProductOrderOpen(true);
        setEditStatus(product?.status || 'pending');
        setProduct(product)
    };

    const closeEditProductOrder = () => {
        setIsEditProductOrderOpen(false);
        setEditOrderAdminNotes([]);
        setNewOrderAdminNote('');
        setEditStatus('pending');
        setProduct(null)
    };

    const handleSaveProductOrder = async () => {
        try {
            setSavingOrderNote(true);
            const config = await getFPConfig();
            const adminNoteArray = buildAdminNotePayload(editOrderAdminNotes);
            await axios.patch(
                `${BASE_URL}/shopping/update-product-creatororder/${creatorOrderId}`,
                {
                    adminNote: adminNoteArray,
                    status: editStatus,
                    productId: product.productId,
                    sku: product.sku
                },
                config
            );

            const refreshed = await fetchDetail();
            if (Array.isArray(refreshed) && order?._id) {
                const updated = refreshed.find(o => o._id === order._id);
                if (updated) setOrder(updated);
            }

            closeEditProductOrder()
            setProduct(null)
        }
        catch (error) {
            console.error('Failed to update order admin notes:', error.response?.data || error);
        } finally {
            setSavingOrderNote(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white w-[95%] max-w-3xl rounded-lg shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Creator Order Detail</h3>
                    <button onClick={onClose} className="text-gray-600 hover:text-black">✕</button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {loading && <div className="text-sm text-gray-600">Loading...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {!loading && !error && order && (
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500">Order ID</div>
                                <div className="text-sm text-black break-all">{order._id}</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">Buyer</div>
                                    <div className="text-sm text-black">{order?.buyer?.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Creator</div>
                                    <div className="text-sm text-black">{order?.creator?.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Status</div>
                                    <div className="text-sm text-black">{order.status || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Payment Mode</div>
                                    <div className="text-sm text-black">{order.paymentMode || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Payment Gateway</div>
                                    <div className="text-sm text-black">{order.paymentGateway || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Payment Intent ID</div>
                                    <div className="text-sm text-black break-all">{order.paymentIntentId || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Paid At</div>
                                    <div className="text-sm text-black">{order.paidAt || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Created At</div>
                                    <div className="text-sm text-black">{order.createdAt || order.createAt || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Updated At</div>
                                    <div className="text-sm text-black">{order.updatedAt || order.updateAt || '-'}</div>
                                </div>
                            </div>

                            {order.paymentMetadata && (
                                <div>
                                    <div className="text-sm font-semibold mb-1">Payment</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-500">Brand</div>
                                            <div className="text-sm text-black">{order.paymentMetadata.brand || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Last 4</div>
                                            <div className="text-sm text-black">{order.paymentMetadata.last4 ? `•••• ${order.paymentMetadata.last4}` : '-'}</div>
                                        </div>
                                        {order.paymentMetadata.receiptUrl && (
                                            <div className="text-black">
                                                <div className="text-xs text-gray-500">ใบเสร็จ</div>
                                                <a
                                                    href={order.paymentMetadata.receiptUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline"
                                                >
                                                    ดูใบเสร็จ
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {order.ShippingAddress && (
                                <div>
                                    <div className="text-sm font-semibold mb-1">Address</div>
                                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500">Address Name</div>
                                            <div className="font-medium text-sm text-black">{order.ShippingAddress.addressName || '-'}</div>
                                        </div>
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500">Status</div>
                                            <div className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {order.ShippingAddress.addressStatus || '-'}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-500">Address Details</div>
                                            <div className="text-sm">
                                                {order.ShippingAddress.address?.address && (
                                                    <div className="font-medium text-sm text-black">{order.ShippingAddress.address.address}</div>
                                                )}
                                                <div className="flex gap-2 font-medium text-sm text-black">
                                                    {order.ShippingAddress.address?.city && (
                                                        <span>{order.ShippingAddress.address.city}</span>
                                                    )}
                                                    {order.ShippingAddress.address?.province && (
                                                        <span>{order.ShippingAddress.address.province}</span>
                                                    )}
                                                    {order.ShippingAddress.address?.country && (
                                                        <span>{order.ShippingAddress.address.country}</span>
                                                    )}
                                                </div>
                                                {order.ShippingAddress.address?.description && (
                                                    <div className="text-xs text-black mt-1">
                                                        {order.ShippingAddress.address.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {Array.isArray(order.variant) && order.variant.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-1 text-black">Items</div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full table-auto text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-black">Product ID</th>
                                                    <th className="px-3 py-2 text-left text-black">SKU</th>
                                                    <th className="px-3 py-2 text-left text-black">Qty</th>
                                                    <th className="px-3 py-2 text-left text-black">Original Price</th>
                                                    <th className="px-3 py-2 text-left text-black">Total Price</th>
                                                    <th className="px-3 py-2 text-left text-black">Status</th>
                                                    <th className="px-3 py-2 text-left text-black">Admin Note</th>
                                                    <th className="px-3 py-2 text-left text-black">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.variant.map((it, idx) => (
                                                    <tr key={idx} className="border-b">
                                                        <td className="px-3 py-2 text-black">{it.productId || '-'}</td>
                                                        <td className="px-3 py-2 text-black">{it.sku || '-'}</td>
                                                        <td className="px-3 py-2 text-black">{it.quantity ?? '-'}</td>
                                                        <td className="px-3 py-2 text-black">{it.originalPrice ?? '-'}</td>
                                                        <td className="px-3 py-2 text-black">{it.totalPrice ?? '-'}</td>
                                                        <td className="px-3 py-2 text-black">{it.status ?? '-'}</td>
                                                        <td className="px-3 py-2 text-black">{
                                                            Array.isArray(it?.adminNote) && it.adminNote.length > 0
                                                                ? (typeof it.adminNote[0] === 'string' ? it.adminNote[0] : (it.adminNote[0]?.message || '-'))
                                                                : '-'
                                                        }</td>
                                                        <td className="px-3 py-2 text-black">
                                                            <button
                                                                type="button"
                                                                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                                                onClick={() => openEditProductOrder(it)}
                                                            >
                                                                แก้ไข
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="text-sm font-semibold mb-1 text-black">Admin Notes</div>
                                <div className="text-sm text-black">
                                    {Array.isArray(order.adminNote) && order.adminNote.length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-1">
                                            {order.adminNote.map((n, i) => (
                                                <li key={i}>{typeof n === 'string' ? n : (n?.message || '-')}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                    onClick={() => openEditOrderNotes(order)}
                                >แก้ไข</button>
                            </div>

                            <div>
                                <div className="text-sm font-semibold mb-1">Raw</div>
                                <pre className="text-xs bg-gray-100 rounded p-3 overflow-x-auto text-black">
                                    {JSON.stringify(order, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Order Admin Notes Modal */}
            {isEditOrderNoteOpen && order && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={closeEditOrderNotes}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">แก้ไขหมายเหตุคำสั่งซื้อ</h3>
                            <button onClick={closeEditOrderNotes} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุจากแอดมิน</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {Array.isArray(editOrderAdminNotes) && editOrderAdminNotes.length > 0 ? (
                                        editOrderAdminNotes.map((note, idx) => (
                                            <span key={`${note}-${idx}`} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border">
                                                <span className="mr-2">{note}</span>
                                                <button
                                                    type="button"
                                                    className=" hover:text-red-600"
                                                    onClick={() => handleRemoveOrderNote(idx)}
                                                    aria-label="remove note"
                                                >
                                                    x
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">ยังไม่มีหมายเหตุ</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded px-3 py-2"
                                        value={newOrderAdminNote}
                                        onChange={(e) => setNewOrderAdminNote(e.target.value)}
                                        placeholder="พิมพ์หมายเหตุใหม่..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOrderNote(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                        onClick={handleAddOrderNote}
                                    >เพิ่ม Note</button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={closeEditOrderNotes}
                                disabled={savingOrderNote}
                            >ยกเลิก</button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded text-white ${savingOrderNote ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleSaveOrderNotes}
                                disabled={savingOrderNote}
                            >{savingOrderNote ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                        </div>
                    </div>
                </div>
            )}
            {isEditProductOrderOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={closeEditProductOrder}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">แก้ไขรายละเอียดคำสั่งซื้อของสินค้า</h3>
                            <button onClick={closeEditProductOrder} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                    >
                                        {STATUS_PRODUCT_OPTIONS.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุจากแอดมิน</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {Array.isArray(editOrderAdminNotes) && editOrderAdminNotes.length > 0 ? (
                                        editOrderAdminNotes.map((note, idx) => (
                                            <span key={`${note}-${idx}`} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border">
                                                <span className="mr-2">{note}</span>
                                                <button
                                                    type="button"
                                                    className=" hover:text-red-600"
                                                    onClick={() => handleRemoveOrderNote(idx)}
                                                    aria-label="remove note"
                                                >
                                                    x
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500">ยังไม่มีหมายเหตุ</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded px-3 py-2"
                                        value={newOrderAdminNote}
                                        onChange={(e) => setNewOrderAdminNote(e.target.value)}
                                        placeholder="พิมพ์หมายเหตุใหม่..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOrderNote(); } }}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                        onClick={handleAddOrderNote}
                                    >เพิ่ม Note</button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={closeEditProductOrder}
                                disabled={savingOrderNote}
                            >ยกเลิก</button>
                            <button
                                type="button"
                                className={`px-4 py-2 rounded text-white ${savingOrderNote ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleSaveProductOrder}
                                disabled={savingOrderNote}
                            >{savingOrderNote ? 'กำลังบันทึก...' : 'บันทึก'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingCreatorOrderIdManagerModal;


