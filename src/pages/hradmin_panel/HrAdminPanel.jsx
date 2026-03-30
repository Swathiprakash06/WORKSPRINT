// admin/AdminPanel.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HrAdminLayout from './HrAdminLayout';
import Dashboard from './Dashboard';
import EmployeeOnboarding from './EmployeeOnboarding';
import EmployeeList from './EmployeeList';
import AttendanceSettings from './AttendanceSettings';
import HolidayManagement from './HolidayManagement';
import LocationRestriction from './LocationRestriction';
import AttendanceMonitoring from './AttendanceMonitoring';
import RequestsManagement from './RequestsManagement';
import EmployeeHistory from './EmployeeHistory';

const HrAdminPanel = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', email: 'john@worksprint.com', phone: '9876543210', role: 'Developer', department: 'Engineering', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@worksprint.com', phone: '9876543211', role: 'Designer', department: 'Design', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@worksprint.com', phone: '9876543212', role: 'Manager', department: 'HR', status: 'inactive' },
  ]);

  const [attendanceSettings, setAttendanceSettings] = useState({
    officeStart: '09:00',
    officeEnd: '18:00',
    graceTime: 15,
    workHours: 8,
  });

  const [holidays, setHolidays] = useState([
    { id: 1, name: 'Republic Day', date: '2026-01-26' },
    { id: 2, name: 'Holi', date: '2026-03-17' },
    { id: 3, name: 'Christmas', date: '2026-12-25' },
  ]);

  const [attendanceData, setAttendanceData] = useState([
    { id: 1, employeeId: 1, employeeName: 'John Doe', date: '2026-03-30', checkIn: '09:05', checkOut: '17:30', status: 'late' },
    { id: 2, employeeId: 2, employeeName: 'Jane Smith', date: '2026-03-30', checkIn: '08:55', checkOut: '18:00', status: 'present' },
    { id: 3, employeeId: 3, employeeName: 'Mike Johnson', date: '2026-03-30', checkIn: '-', checkOut: '-', status: 'absent' },
  ]);

  const [requests, setRequests] = useState([
    { id: 1, employeeId: 1, employeeName: 'John Doe', type: 'Leave', reason: 'Family function', date: '2026-03-25', status: 'pending' },
    { id: 2, employeeId: 2, employeeName: 'Jane Smith', type: 'Late Regularization', reason: 'Traffic jam', date: '2026-03-28', status: 'pending' },
    { id: 3, employeeId: 3, employeeName: 'Mike Johnson', type: 'Leave', reason: 'Medical appointment', date: '2026-03-29', status: 'approved' },
  ]);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <HrAdminLayout onLogout={handleLogout} adminName="HR Admin">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard employees={employees} attendanceData={attendanceData} />} />
        <Route path="onboarding" element={<EmployeeOnboarding setEmployees={setEmployees} employees={employees} />} />
        <Route path="employee-list" element={<EmployeeList employees={employees} setEmployees={setEmployees} />} />
        <Route path="attendance-settings" element={<AttendanceSettings settings={attendanceSettings} setSettings={setAttendanceSettings} />} />
        <Route path="holiday-management" element={<HolidayManagement holidays={holidays} setHolidays={setHolidays} />} />
        <Route path="location-restriction" element={<LocationRestriction />} />
        <Route path="attendance-monitoring" element={<AttendanceMonitoring attendanceData={attendanceData} />} />
        <Route path="requests-management" element={<RequestsManagement requests={requests} setRequests={setRequests} />} />
        <Route path="employee-history" element={<EmployeeHistory employees={employees} attendanceData={attendanceData} requests={requests} />} />
      </Routes>
    </HrAdminLayout>
  );
};

export default HrAdminPanel;