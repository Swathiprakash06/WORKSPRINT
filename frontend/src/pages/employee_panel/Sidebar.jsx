import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  History,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { employeeStyles } from "../../styles";

const Sidebar = ({ mobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }) => {

  const menuItems = [
    { path: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employee/profile", label: "Profile Settings", icon: User },
    { path: "/employee/requests", label: "Apply Request", icon: FileText },
    { path: "/employee/history", label: "My History", icon: History },
  ];

  return (
    <>
      {/* Overlay (Mobile) */}
      {mobileOpen && (
        <div
          className={employeeStyles.sidebar.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={employeeStyles.sidebar.base(isCollapsed, mobileOpen)}>

        {/* Mobile Close */}
        <button
          className={employeeStyles.sidebar.mobileClose}
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>

        {/* Collapse Button (Desktop) */}
        <button
          className={employeeStyles.sidebar.collapseBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Menu */}
        <div className={employeeStyles.sidebar.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${employeeStyles.sidebar.item(isActive)} ${
                  isCollapsed ? employeeStyles.sidebar.itemCollapsed : ""
                }`
              }
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className={employeeStyles.sidebar.icon} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;