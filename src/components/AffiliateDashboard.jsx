// 1️⃣ AffiliateDashboard.jsx (Parent Tabs Container)

import React, { useState } from "react";
import AffiliateEarningsDashboard from "./AffiliateEarningsDashboard";
import AffiliateLinksManager from "./AffiliateLinksManager";
import AffiliateBankInfo from "./AffiliateBankInfo";

export default function AffiliateDashboard() {
  const [activeTab, setActiveTab] = useState("earnings");

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6">
      <div className="flex justify-center mb-4 gap-2">
        <button
          onClick={() => setActiveTab("earnings")}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow transition ${
            activeTab === "earnings"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Earnings
        </button>
        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow transition ${
            activeTab === "links"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Links
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow transition ${
            activeTab === "bank"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Bank Info
        </button>
      </div>

      {activeTab === "earnings" ? (
        <AffiliateEarningsDashboard />
      ) : activeTab === "links" ? (
        <AffiliateLinksManager />
      ) : (
        <AffiliateBankInfo />
      )}
    </div>
  );
}
