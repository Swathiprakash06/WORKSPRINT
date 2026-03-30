// pages/super_admin_panel/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Building2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { employeeStyles } from '../../styles';

const Sidebar = ({ mobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { path: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/super-admin/enquiry-management", label: "Enquiry Management", icon: Mail },
    { path: "/super-admin/organization-list", label: "Organization List", icon: Building2 },
    { path: "/super-admin/create-hr-admin", label: "Create HR Admin", icon: UserPlus },
  ];

  return (
    <>
      {mobileOpen && (
        <div className={employeeStyles.sidebar.overlay} onClick={() => setMobileOpen(false)} />
      )}
      <div className={employeeStyles.sidebar.base(isCollapsed, mobileOpen)}>
        <button className={employeeStyles.sidebar.mobileClose} onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
        <button className={employeeStyles.sidebar.collapseBtn} onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div className={employeeStyles.sidebar.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${employeeStyles.sidebar.item(isActive)} ${
                  isCollapsed ? employeeStyles.sidebar.itemCollapsed : ''
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