// admin/AttendanceMonitoring.jsx
import React, { useState, useEffect } from 'react';
import { Search, Download, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';
import { getCurrentDate, formatTime, toLocalDateKey } from '../../utils/dateUtils';
import { formatCurrency, MIN_HOURS_FOR_SALARY } from '../../utils/salaryUtils';
import { apiPost, apiGet } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AttendanceMonitoring = ({ attendanceData, employees = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDate, setViewDate] = useState(getCurrentDate());
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    hours: '6',
    date: getCurrentDate(),
    note: '',
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadAttendanceForDate = async () => {
      try {
        const res = await apiGet(`/api/v1/hr-admin/attendance/today?date=${viewDate}`);
        if (res.ok) {
          const data = await res.json();
          const rows = Array.isArray(data.records) ? data.records : [];
          setAttendanceForDate(rows.map((row) => ({
            ...row,
            date: toLocalDateKey(row.date),
            employeeName: row.employeeName || row.employee?.name || row.employee?.email || 'Unknown Employee',
            checkInTime: row.checkInTime || row.checkIn || null,
            checkOutTime: row.checkOutTime || row.checkOut || null,
            hoursWorked: row.hoursWorked ?? row.totalHours ?? 0,
          })));
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      }
    };
    loadAttendanceForDate();
  }, [viewDate, attendanceData]);

  const [attendanceForDate, setAttendanceForDate] = useState([]);

  const filteredByDate = (attendanceForDate.length ? attendanceForDate : attendanceData).filter((a) => {
    const rowDate = toLocalDateKey(a?.date);
    const matchesDate = rowDate === viewDate;
    return matchesDate && !a.isTest;
  });

  const filteredAttendance = filteredByDate.filter((att) => {
    const employeeName = att.employeeName || att.employee?.name || att.employee?.email || '';
    return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const combinedRecords = filteredAttendance;

  const getStatusBadge = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-700',
      late: 'bg-yellow-100 text-yellow-700',
      absent: 'bg-red-100 text-red-700',
      leave: 'bg-gray-100 text-gray-700',
    };
    return `${colors[status] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded-full text-xs font-medium inline-block`;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = sessionStorage.getItem('token');
      const url = `${API_BASE}/api/v1/hr-admin/reports/export`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'attendance-salary-report.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Report exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleManualMark = async () => {
    if (!manualForm.employeeId) {
      toast.error('Select an employee');
      return;
    }
    if (!manualForm.note?.trim()) {
      toast.error('Please add a note (e.g. employee forgot to mark attendance)');
      return;
    }
    try {
      const res = await apiPost('/api/v1/hr-admin/attendance/manual-mark', {
        employeeId: Number(manualForm.employeeId),
        hours: Number(manualForm.hours),
        date: manualForm.date,
        note: manualForm.note.trim(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to mark attendance');
      }
      const result = await res.json();
      setViewDate(manualForm.date);
      if (result.salary?.credited) {
        toast.success(`Attendance marked. ${formatCurrency(result.salary.amount)} salary credited (${manualForm.hours}h). Employee will see this.`);
      } else if (result.salary?.reason === 'Already credited for this date') {
        toast.success('Attendance updated. Salary was already credited for this date.');
      } else {
        toast(`Attendance marked for employee. No salary credited — ${result.salary?.reason || 'hours below 6'}.`, { icon: '⚠️' });
      }
      setManualForm({ employeeId: '', hours: '6', date: manualForm.date, note: '' });
      if (onRefresh) await onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to mark attendance');
    }
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <div>
          <h1 className={employeeStyles.table.title}>Attendance Monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">View records by date or mark attendance when an employee forgot to check in</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export Daily Report'}
          </button>
          <div className={employeeStyles.table.searchBox}>
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={employeeStyles.table.searchInput}
            />
          </div>
        </div>
      </div>

      {/* HR Manual Mark — always visible, real attendance */}
      <div className="mb-6 p-4 bg-white border border-purple-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <UserCheck size={18} className="text-[#7C3AED]" />
            Mark Attendance (Employee forgot)
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Creates a real attendance record visible to the employee. Salary is credited if hours are {MIN_HOURS_FOR_SALARY}+.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Employee *</label>
              <select
                value={manualForm.employeeId}
                onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Select employee</option>
                {employees.filter((e) => e.status === 'active').map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Working Hours *</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={manualForm.hours}
                onChange={(e) => setManualForm({ ...manualForm, hours: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date *</label>
              <input
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Note *</label>
              <input
                type="text"
                value={manualForm.note}
                onChange={(e) => setManualForm({ ...manualForm, note: e.target.value })}
                placeholder="Forgot to mark attendance"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <button
              onClick={handleManualMark}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9]"
            >
              Mark Attendance
            </button>
          </div>
      </div>

      <div className={employeeStyles.table.tableWrapper}>
        <table className={employeeStyles.table.table}>
          <thead>
            <tr>
              <th className={employeeStyles.table.th}>Employee Name</th>
              <th className={employeeStyles.table.th}>Check-in</th>
              <th className={employeeStyles.table.th}>Check-out</th>
              <th className={employeeStyles.table.th}>Hours</th>
              <th className={employeeStyles.table.th}>Status</th>
              <th className={employeeStyles.table.th}>Salary Credited</th>
              <th className={employeeStyles.table.th}>Amount</th>
              <th className={employeeStyles.table.th}>Source</th>
              <th className={employeeStyles.table.th}>Late reason</th>
            </tr>
          </thead>
          <tbody>
            {combinedRecords.length > 0 ? (
              combinedRecords.map((att) => (
                <tr key={att.id} className={att.markedByHr ? 'bg-purple-50' : att.status === 'leave' ? 'bg-gray-50' : ''}>
                  <td className={employeeStyles.table.td}>
                    {att.employeeName || att.employee?.name || att.employee?.email || 'Unknown Employee'}
                  </td>
                  <td className={employeeStyles.table.td}>{formatTime(att.checkInTime || att.checkIn) || '-'}</td>
                  <td className={employeeStyles.table.td}>{formatTime(att.checkOutTime || att.checkOut) || '-'}</td>
                  <td className={employeeStyles.table.td}>{att.hoursWorked ?? att.totalHours ?? '-'}</td>
                  <td className={employeeStyles.table.td}>
                    <span className={getStatusBadge(att.status)}>
                      {att.status === 'present' ? 'Present' : att.status === 'late' ? 'Late' : att.status === 'leave' ? 'Approved Leave' : 'Absent'}
                    </span>
                  </td>
                  <td className={employeeStyles.table.td}>
                    {att.status === 'leave' ? '-' : att.salaryCredited ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className={employeeStyles.table.td}>
                    {att.salaryAmount != null ? formatCurrency(att.salaryAmount) : '—'}
                  </td>
                  <td className={employeeStyles.table.td}>
                    {att.markedByHr ? (
                      <span className="text-xs text-purple-700 font-medium">HR Marked</span>
                    ) : (
                      <span className="text-xs text-gray-500">Self</span>
                    )}
                  </td>
                  <td className={`${employeeStyles.table.td} max-w-[200px] text-xs text-gray-700 whitespace-normal break-words`}>
                    {att.lateReason?.trim() ? att.lateReason : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-400">No attendance records for this date</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceMonitoring;
