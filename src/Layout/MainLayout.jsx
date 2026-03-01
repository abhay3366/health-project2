import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "../component/Sidebar";

const MainLayout = () => {
    const [activeNav, setActiveNav] = useState("dashboard");
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />


      {/* Right Side Content */}
      <div
        style={{
          marginLeft: "250px",
          padding: "20px",
          width: "100%",
          background: "#f1f5f9",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

const linkStyle = ({ isActive }) => ({
  color: isActive ? "#38bdf8" : "white",
  textDecoration: "none",
  fontWeight: "bold",
});

export default MainLayout;