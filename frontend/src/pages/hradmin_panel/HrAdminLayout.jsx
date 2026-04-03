// admin/AdminLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { employeeStyles } from '../../styles';
const HrAdminLayout = ({ children, onLogout, adminName }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={employeeStyles.panel}>
      <TopBar 
        adminName={adminName} 
        onLogout={onLogout} 
        onMenuClick={() => setMobileOpen(true)} 
      />
      <div className={employeeStyles.mainContainer}>
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className={employeeStyles.contentArea(isCollapsed)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default HrAdminLayout;