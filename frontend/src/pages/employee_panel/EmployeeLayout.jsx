import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { employeeStyles } from "../../styles";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={employeeStyles.panel}>
      
      {/* ✅ TOPBAR HERE */}
      <TopBar 
        user={{ name: "Swathi" }} 
        onLogout={() => console.log("logout")}
        onMenuClick={() => setMobileOpen(true)}
      />

      <div className={employeeStyles.mainContainer}>
        
        {/* ✅ SIDEBAR */}
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* ✅ CONTENT */}
        <div className={employeeStyles.contentArea(isCollapsed)}>
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default EmployeeLayout;