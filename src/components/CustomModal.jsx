import { useEffect } from "react";

export default function CustomModal({
  message,
  type = "success", // 'success' | 'error'
  showOkButton = false,
  showCloseButton = true,
  onClose,
  autoClose = true,            // 👈 เพิ่ม flag
  autoCloseDuration = 3000,   // 👈 ปรับเวลาได้
}) {
  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(onClose, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [onClose, autoClose, autoCloseDuration]);

  const iconMap = {
    success: "✅",
    error: "❌",
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-sm relative text-center">
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl font-bold"
          >
            ×
          </button>
        )}

        <div className="text-6xl mb-3">{iconMap[type] || "ℹ️"}</div>

        <p className="text-black text-lg font-semibold mb-4 break-words">
          {message || "ข้อความแจ้งเตือนไม่ได้ระบุ"}
        </p>

        {showOkButton && (
          <button
            onClick={onClose}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}
