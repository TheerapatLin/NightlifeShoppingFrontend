import React from "react";
import DiscountCodeManager from "../components/DiscountCodeManager";

function UserSuperAdmin() {
  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-white mb-6">Discount Code Management</h2>
      <DiscountCodeManager />
    </div>
  );
}

export default UserSuperAdmin;
