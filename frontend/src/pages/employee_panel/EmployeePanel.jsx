import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import ApplyRequest from './ApplyRequest';
import MyHistory from './MyHistory';
import ProfileSettings from '../../components/ProfileSettings';
import LogoutConfirmation from '../../components/LogoutConfirmation';
import { AuthProvider } from './EmployeeAuthContext';
import { employeeStyles } from '../../styles';
import toast from 'react-hot-toast';
import { apiGet, apiPost, logoutApi } from '../../services/api';
import { toLocalDateKey } from '../../utils/dateUtils';

const EmployeePanel = ({
  userData = null,
}) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [user, setUser] = useState(userData);
  const [settings, setSettings] = useState({ officeStart: '09:00', officeEnd: '18:00', graceTime: 15, workHours: 8, lateAfter: '09:15' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      if (!token || role !== 'employee') throw new Error('Unauthorized');

      const [userRes, attendanceRes, leaveReqRes, lateReqRes] = await Promise.all([
        apiGet('/api/v1/employee/profile'),
        apiGet('/api/v1/employee/attendance/history'),
        apiGet('/api/v1/employee/leave-requests'),
        apiGet('/api/v1/employee/late-requests'),
      ]);

      let userDataRes = null;
      if (userRes && userRes.ok) {
        userDataRes = await userRes.json();
        setUser(userDataRes);
      }

      if (attendanceRes && attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendanceLogs(
          data.map((item) => ({
            ...item,
            date: toLocalDateKey(item.date),
            checkInTime: item.checkInTime || item.checkIn || null,
            checkOutTime: item.checkOutTime || item.checkOut || null,
          }))
        );
      }
      if (leaveReqRes && leaveReqRes.ok) {
        const data = await leaveReqRes.json();
        const requestsData = data.map((req) => ({ ...req, employeeName: userDataRes?.name || userDataRes?.email || '' }));
        setRequests(requestsData);
      }
      if (lateReqRes && lateReqRes.ok) {
        const data = await lateReqRes.json();
        setRequests((prev) => [...prev, ...data.map((req) => ({ ...req, type: 'Late Regularization', employeeName: userDataRes?.name || userDataRes?.email || '' }))]);
      }

      const hrSettings = await apiGet('/api/v1/employee/settings');
      if (hrSettings && hrSettings.ok) {
        const hrSettingsData = await hrSettings.json();
        setSettings({ ...settings, ...hrSettingsData });
      }

      const holidaysRes = await apiGet('/api/v1/employee/holidays');
      if (holidaysRes && holidaysRes.ok) {
        const holidayData = await holidaysRes.json();
        // Normalize holiday dates to YYYY-MM-DD format for comparison
        const normalizeDate = (d) => {
          const dateObj = new Date(d);
          const Y = dateObj.getFullYear();
          const M = String(dateObj.getMonth() + 1).padStart(2, '0');
          const D = String(dateObj.getDate()).padStart(2, '0');
          return `${Y}-${M}-${D}`;
        };
        const normalizedHolidays = holidayData.map(h => ({
          ...h,
          date: normalizeDate(h.date)
        }));
        setHolidays(normalizedHolidays);
      }
    } catch (error) {
      console.error('Employee data loading error:', error);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token || role !== 'employee') {
      toast.error('Unauthorized access');
      sessionStorage.clear();
      navigate('/login');
      return;
    }

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Data is now managed by state and backend only

  const addRequest = async (newRequest) => {
    try {
      if (newRequest.type === 'Late Regularization') {
        const payload = {
          date: newRequest.date,
          reason: newRequest.reason,
        };
        const res = await apiPost('/api/v1/employee/late-requests', payload);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Unable to submit request');
        }
        const created = await res.json();
        const formatted = { ...created, type: 'Late Regularization', employeeName: currentUser.name || currentUser.email };
        setRequests((prevRequests) => [...prevRequests, formatted]);
        toast.success('Request submitted successfully!');
        return;
      }

      if (newRequest.type === 'Leave' && Array.isArray(newRequest.dates) && newRequest.dates.length > 0) {
        const res = await apiPost('/api/v1/employee/leave-requests/batch', {
          type: 'Leave',
          reason: newRequest.reason,
          dates: newRequest.dates,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Unable to submit request');
        }
        const createdList = await res.json();
        const withNames = createdList.map((row) => ({
          ...row,
          employeeName: currentUser.name || currentUser.email,
        }));
        setRequests((prevRequests) => [...prevRequests, ...withNames]);
        toast.success('Request submitted successfully!');
        return;
      }

      const res = await apiPost('/api/v1/employee/leave-requests', {
        type: newRequest.type,
        date: newRequest.date,
        reason: newRequest.reason,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Unable to submit request');
      }
      const created = await res.json();
      const formatted = { ...created, employeeName: currentUser.name || currentUser.email };
      setRequests((prevRequests) => [...prevRequests, formatted]);
      toast.success('Request submitted successfully!');
    } catch (error) {
      console.error('Add request failed:', error);
      toast.error(error.message || 'Unable to submit request');
    }
  };

  const updateAttendance = async (newAttendance) => {
    try {
      if (newAttendance.checkedIn && !newAttendance.checkedOut) {
        const geo = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
          
          const timeoutId = setTimeout(() => {
            reject(new Error('Geolocation request timed out. Please check your location permissions.'));
          }, 10000); // 10 second timeout
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(timeoutId);
              resolve(position);
            },
            (error) => {
              clearTimeout(timeoutId);
              reject(new Error(`Geolocation failed: ${error.message}`));
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });

        const res = await apiPost('/api/v1/employee/attendance/check-in', {
          latitude: geo.coords.latitude,
          longitude: geo.coords.longitude,
          ...(newAttendance.lateReason ? { lateReason: newAttendance.lateReason } : {}),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Check-in failed');
        }

        const saved = await res.json();
        const formatted = {
          ...saved,
          date: toLocalDateKey(saved.date),
          lateReason: saved.lateReason || null,
        };
        setAttendanceLogs(prev => [...prev.filter((row) => row.date !== formatted.date), formatted]);
        return;
      }

      if (newAttendance.checkedOut) {
        const geo = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
          
          const timeoutId = setTimeout(() => {
            reject(new Error('Geolocation request timed out. Please check your location permissions.'));
          }, 10000); // 10 second timeout
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              clearTimeout(timeoutId);
              resolve(position);
            },
            (error) => {
              clearTimeout(timeoutId);
              reject(new Error(`Geolocation failed: ${error.message}`));
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });

        const res = await apiPost('/api/v1/employee/attendance/check-out', {
          latitude: geo.coords.latitude,
          longitude: geo.coords.longitude,
          ...(newAttendance.earlyCheckoutReason ? { earlyCheckoutReason: newAttendance.earlyCheckoutReason } : {}),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Check-out failed');
        }

        const saved = await res.json();
        const formatted = {
          ...saved,
          date: toLocalDateKey(saved.date),
          checkInTime: saved.checkInTime || saved.checkIn || null,
          checkOutTime: saved.checkOutTime || saved.checkOut || null,
          lateReason: saved.lateReason || null,
          earlyCheckoutReason: saved.earlyCheckoutReason || null,
        };
        setAttendanceLogs((prev) => {
          const matched = prev.some(
            (row) =>
              row.id === formatted.id ||
              (row.employeeId === formatted.employeeId && row.date === formatted.date)
          );
          if (!matched) return [...prev, formatted];
          return prev.map((row) =>
            row.id === formatted.id || (row.employeeId === formatted.employeeId && row.date === formatted.date)
              ? { ...row, ...formatted }
              : row
          );
        });
        return;
      }
    } catch (err) {
      console.error('Attendance sync failed:', err);
      toast.error(err.message || 'Attendance update failed');
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

  // Default user if none provided (for demo)
  const defaultUser = {
    name: 'Employee',
    email: 'employee@company.com',
    id: 'EMP001',
    department: 'General'
  };

  const currentUser = user || defaultUser;

  return (
    <AuthProvider>
      <LogoutConfirmation 
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <div className={employeeStyles.panel}>
        <TopBar 
          user={currentUser} 
          onLogout={() => setShowLogoutConfirm(true)}
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
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route 
                path="dashboard" 
                element={
                  <Dashboard 
                    attendanceLogs={attendanceLogs}
                    holidays={holidays}
                    checkIn={updateAttendance}
                    checkOut={updateAttendance}
                    currentStatus="present"
                    workingHours={{ start: settings.officeStart || '09:00', end: settings.officeEnd || '18:00' }}
                    officeStart={settings.officeStart || '09:00'}
                    graceTime={settings.graceTime ?? 15}
                    userId={currentUser.id}
                  />
                } 
              />
              <Route 
                path="requests" 
                element={<ApplyRequest addRequest={addRequest} />} 
              />
              <Route 
                path="history" 
                element={
                  <MyHistory 
                    attendanceLogs={attendanceLogs} 
                    requests={requests} 
                  />
                } 
              />
              <Route path="profile" element={<ProfileSettings role="employee" />} />
            </Routes>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default EmployeePanel;