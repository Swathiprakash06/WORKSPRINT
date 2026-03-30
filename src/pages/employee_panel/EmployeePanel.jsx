import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import ApplyRequest from './ApplyRequest';
import MyHistory from './MyHistory';
import { AuthProvider } from './EmployeeAuthContext';
import { employeeStyles } from '../../styles';

const EmployeePanel = () => {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [attendanceLogs, setAttendanceLogs] = useState([
    { date: '2026-03-25', status: 'present', checkIn: '09:00', checkOut: '17:00' },
    { date: '2026-03-26', status: 'present', checkIn: '09:15', checkOut: '17:30' },
  ]);

  const [requests, setRequests] = useState([
  {
    id: 1,
    date: "2026-03-20",
    type: "Leave",
    reason: "Family function",
    status: "approved",
  },
  {
    id: 2,
    date: "2026-03-22",
    type: "Late Regularization",
    reason: "Traffic",
    status: "pending",
  },
]);
  const user = {
    name: 'John Doe',
    email: 'john.doe@worksprint.com'
  };

  const logout = () => {
    window.location.href = '/login';
  };

  return (
    <AuthProvider>
      <div className={employeeStyles.panel}>

        {/* TopBar */}
        <TopBar 
          user={user} 
          onLogout={logout}
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className={employeeStyles.mainContainer}>

          {/* Sidebar */}
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Content */}
          <div className={employeeStyles.contentArea(isCollapsed)}>

            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="requests" element={<ApplyRequest />} />
              <Route path="history" element={<MyHistory attendanceLogs={attendanceLogs} requests={requests} />  }/>
            </Routes>

          </div>

        </div>
      </div>
    </AuthProvider>
  );
};

export default EmployeePanel;