
import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { employeeStyles } from '../../styles';

const TopBar = ({ user, onLogout, onMenuClick }) => {
  return (
    <div className={employeeStyles.topbar.container}>

      {/* Hamburger */}
      <button
        className={employeeStyles.mobileMenu.button}
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>

      {/* Logo */}
      <div className={employeeStyles.topbar.logo}>
        WORKSPRINT DASHBOARD
      </div>

      {/* Right */}
      <div className={employeeStyles.topbar.rightSection}>
        <div className={employeeStyles.topbar.userInfo}>
            <User size={16} />
                <span>Welcome {user.name}</span>
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