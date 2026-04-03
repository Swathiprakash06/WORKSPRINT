// admin/TopBar.jsx
import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { employeeStyles } from '../../styles';
const TopBar = ({ adminName, onLogout, onMenuClick }) => {
  return (
    <div className={employeeStyles.topbar.container}>
      <button className={employeeStyles.mobileMenu.button} onClick={onMenuClick}>
        <Menu size={22} />
      </button>
      <div className={employeeStyles.topbar.logo}>
        WORKSPRINT DASHBOARD
      </div>
      <div className={employeeStyles.topbar.rightSection}>
        <div className={employeeStyles.topbar.userInfo}>
          <User size={16} />
          <span>Welcome {adminName}</span>
        </div>
        <button onClick={onLogout} className={employeeStyles.topbar.logoutBtn}>
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;