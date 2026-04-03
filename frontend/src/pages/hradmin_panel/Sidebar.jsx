// admin/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  UserPlus,
  Users,
  Settings,
  CalendarDays,
  MapPin,
  Clock,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { employeeStyles } from '../../styles';
const Sidebar = ({ mobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { path: "/hradmin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/hradmin/profile", label: "Profile Settings", icon: User },
    { path: "/hradmin/onboarding", label: "Employee Onboarding", icon: UserPlus },
    { path: "/hradmin/employee-list", label: "Employee List", icon: Users },
    { path: "/hradmin/attendance-settings", label: "Attendance Settings", icon: Settings },
    { path: "/hradmin/holiday-management", label: "Holiday Management", icon: CalendarDays },
    { path: "/hradmin/location-restriction", label: "Location Restriction", icon: MapPin },
    { path: "/hradmin/attendance-monitoring", label: "Attendance Monitoring", icon: Clock },
    { path: "/hradmin/requests-management", label: "Requests Management", icon: FileText },
    { path: "/hradmin/employee-history", label: "Employee History", icon: History },
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