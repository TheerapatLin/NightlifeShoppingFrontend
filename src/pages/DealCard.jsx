import { useState } from "react";

export default function DealCard({
  frontImg,
  title,
  subtitle,
  description,
  onClaim,
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full h-full perspective">
      <div
        className={`relative w-full aspect-[1.6] transition-transform duration-700 preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT */}
        <div
          className="absolute w-full h-full backface-hidden z-10"
          onClick={() => setFlipped(true)}
        >
          <div className="flex flex-col h-full justify-start cursor-pointer">
            <img
              src={frontImg}
              alt={title}
              className="w-full h-auto object-contain glow-img rounded-2xl"
            />
            <p className="text-xs italic text-white opacity-50 mt-2 text-center">
              {subtitle}
            </p>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white text-black rounded-2xl p-0 flex flex-col z-20 overflow-hidden">
          {/* ปุ่มปิด (overlay) */}
          <button
            className="absolute top-3 right-3 text-lg font-bold text-gray-500 hover:text-gray-800 z-30"
            onClick={() => setFlipped(false)}
          >
            ✕
          </button>

          {/* เนื้อหา scroll ได้ */}
          <div className="flex-1 overflow-auto px-4 pt-4 pb-20 relative">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>

            {Array.isArray(description) && description.length > 0 ? (
              description.map((line, index) => (
                <p
                  key={index}
                  className="text-sm mb-1 text-gray-800"
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              ))
            ) : (
              <p className="text-sm italic text-red-600">
                ⚠️ No description provided
              </p>
            )}

            {/* Scroll indicator */}
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>

          {/* ปุ่ม Claim (sticky) */}
          <div className="absolute bottom-0 left-0 w-full px-4 pb-4 bg-white z-20">
            <button
              className="w-full bg-black text-white rounded-full py-2 px-4 text-sm"
              onClick={onClaim}
            >
              Claim Deal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
