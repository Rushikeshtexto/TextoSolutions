// src/components/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar"; // your sidebar component

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Page content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
