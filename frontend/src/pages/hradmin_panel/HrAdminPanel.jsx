// admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut, apiDelete, logoutApi } from '../../services/api';
import { toLocalDateKey } from '../../utils/dateUtils';
import HrAdminLayout from './HrAdminLayout';
import Dashboard from './Dashboard';
import EmployeeOnboarding from './EmployeeOnboarding';
import ProfileSettings from '../../components/ProfileSettings';
import LogoutConfirmation from '../../components/LogoutConfirmation';
import EmployeeList from './EmployeeList';
import AttendanceSettings from './AttendanceSettings';
import HolidayManagement from './HolidayManagement';
import LocationRestriction from './LocationRestriction';
import AttendanceMonitoring from './AttendanceMonitoring';
import RequestsManagement from './RequestsManagement';
import EmployeeHistory from './EmployeeHistory';

const HrAdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [attendanceSettings, setAttendanceSettings] = useState({ officeStart: '09:00', officeEnd: '18:00', graceTime: 15, workHours: 8, locationLat: '', locationLng: '', locationRadius: 100 });
  const [holidays, setHolidays] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      if (!token || role !== 'hrAdmin') throw new Error('Unauthorized');

      const [employeesRes, settingsRes, holidaysRes, attendanceRes, leaveReqRes, lateReqRes] = await Promise.all([
        apiGet('/api/v1/hr-admin/employees'),
        apiGet('/api/v1/hr-admin/settings'),
        apiGet('/api/v1/hr-admin/holidays'),
        apiGet('/api/v1/hr-admin/attendance'),
        apiGet('/api/v1/hr-admin/leave-requests'),
        apiGet('/api/v1/hr-admin/late-requests'),
      ]);

      if (employeesRes && employeesRes.ok) {
        const empData = await employeesRes.json();
        setEmployees(Array.isArray(empData) ? empData : empData.items || []);
      }
      if (settingsRes && settingsRes.ok) {
        const settingsResponse = await settingsRes.json();
        setAttendanceSettings(settingsResponse || { officeStart: '09:00', officeEnd: '18:00', graceTime: 15, workHours: 8, locationLat: '', locationLng: '', locationRadius: 100 });
      }
      if (holidaysRes && holidaysRes.ok) setHolidays(await holidaysRes.json());
      if (attendanceRes && attendanceRes.ok) {
        const attendanceRows = await attendanceRes.json();
        const normalizedAttendance = attendanceRows.map((row) => ({
          ...row,
          date: toLocalDateKey(row.date),
          employeeName: row.employeeName || row.employee?.name || row.employee?.email || 'Unknown Employee',
          checkInTime: row.checkInTime || row.checkIn || null,
          checkOutTime: row.checkOutTime || row.checkOut || null,
        }));
        setAttendanceData(normalizedAttendance);
      }
      if (leaveReqRes && leaveReqRes.ok) {
        const leaveData = await leaveReqRes.json();
        const transformedLeaveData = leaveData.map(req => ({
          ...req,
          employeeName: req.employee?.name || req.employee?.email || 'Unknown Employee'
        }));
        setRequests(transformedLeaveData);
      }
      if (lateReqRes && lateReqRes.ok) {
        const lateData = await lateReqRes.json();
        const transformedLateData = lateData.map(req => ({
          ...req,
          employeeName: req.employee?.name || req.employee?.email || 'Unknown Employee'
        }));
        setRequests((prev) => [...prev, ...transformedLateData]);
      }

    } catch (error) {
      console.error('HR Admin loadData error:', error);
      if (error.message === 'Unauthorized') {
        sessionStorage.clear();
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token || role !== 'hrAdmin') {
      toast.error('Unauthorized access');
      sessionStorage.clear();
      navigate('/login');
      return;
    }

    loadData();
    const timer = setInterval(loadData, 15000); // Refresh every 15 seconds for better real-time sync
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleSaveSettings = async (newSettings) => {
    try {
      const merged = { ...attendanceSettings, ...newSettings };
      const res = await apiPut('/api/v1/hr-admin/settings', merged);
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to update');
      }
      setAttendanceSettings(await res.json());
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Settings update failed:', error);
      if (error.status === 401 || error.message === 'Unauthorized') {
        toast.error('Session expired, please log in again.');
        sessionStorage.clear();
        navigate('/login');
        return;
      }
      toast.error(error.message || 'Could not update settings');
    }
  };

  const handleAddHoliday = async (holiday) => {
    try {
      const res = await apiPost('/api/v1/hr-admin/holidays', holiday);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to add holiday');
      const created = await res.json();
      setHolidays((prev) => [...prev, created]);
      toast.success('Holiday added');
    } catch (error) {
      console.error('Add holiday failed:', error);
      toast.error(error.message || 'Could not add holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      const res = await apiDelete(`/api/v1/hr-admin/holidays/${id}`);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete holiday');
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      toast.success('Holiday deleted');
    } catch (error) {
      console.error('Delete holiday failed:', error);
      toast.error(error.message || 'Could not delete holiday');
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      const res = await apiPut(`/api/v1/hr-admin/leave-requests/${id}/approve`);
      if (!res.ok) throw new Error((await res.json()).message); 
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success('Request approved');
    } catch (error) {
      console.error('Approve request failed:', error);
      toast.error(error.message || 'Could not approve request');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const res = await apiPut(`/api/v1/hr-admin/leave-requests/${id}/reject`);
      if (!res.ok) throw new Error((await res.json()).message); 
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success('Request rejected');
    } catch (error) {
      console.error('Reject request failed:', error);
      toast.error(error.message || 'Could not reject request');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.warn('Logout API failed:', error);
    }

    sessionStorage.clear();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('rememberMe');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <LogoutConfirmation 
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <HrAdminLayout onLogout={() => setShowLogoutConfirm(true)} adminName="HR Admin">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard employees={employees} attendanceData={attendanceData} />} />
        <Route path="onboarding" element={<EmployeeOnboarding setEmployees={setEmployees} employees={employees} />} />
        <Route path="employee-list" element={<EmployeeList employees={employees} setEmployees={setEmployees} />} />
        <Route path="attendance-settings" element={<AttendanceSettings settings={attendanceSettings} setSettings={handleSaveSettings} />} />
        <Route path="holiday-management" element={<HolidayManagement holidays={holidays} setHolidays={setHolidays} addHoliday={handleAddHoliday} deleteHoliday={handleDeleteHoliday} />} />
        <Route path="location-restriction" element={<LocationRestriction settings={attendanceSettings} setSettings={handleSaveSettings} />} />
        <Route path="attendance-monitoring" element={<AttendanceMonitoring attendanceData={attendanceData} />} />
        <Route path="requests-management" element={<RequestsManagement requests={requests} setRequests={setRequests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />} />
        <Route path="employee-history" element={<EmployeeHistory employees={employees} attendanceData={attendanceData} requests={requests} />} />
        <Route path="profile" element={<ProfileSettings role="hrAdmin" />} />
      </Routes>
    </HrAdminLayout>
    </>
  );
};

export default HrAdminPanel;