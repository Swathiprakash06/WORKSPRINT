// admin/AttendanceMonitoring.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { getCurrentDate, formatTime, toLocalDateKey } from '../../utils/dateUtils';
const AttendanceMonitoring = ({ attendanceData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const today = getCurrentDate();
  const todayAttendance = attendanceData.filter((a) => {
    const rowDate = toLocalDateKey(a?.date);
    return rowDate === today;
  });

  const filteredAttendance = todayAttendance.filter((att) => {
    const employeeName = att.employeeName || att.employee?.name || att.employee?.email || '';
    return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-700',
      late: 'bg-yellow-100 text-yellow-700',
      absent: 'bg-red-100 text-red-700',
    };
    return `${colors[status]} px-2 py-1 rounded-full text-xs font-medium inline-block`;
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <h1 className={employeeStyles.table.title}>Attendance Monitoring - Today</h1>
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
      
      <div className={employeeStyles.table.tableWrapper}>
        <table className={employeeStyles.table.table}>
          <thead>
            <tr>
              <th className={employeeStyles.table.th}>Employee Name</th>
              <th className={employeeStyles.table.th}>Check-in</th>
              <th className={employeeStyles.table.th}>Check-out</th>
              <th className={employeeStyles.table.th}>Status</th>
              <th className={employeeStyles.table.th}>Late reason</th>
              <th className={employeeStyles.table.th}>Early checkout</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((att) => (
                <tr key={att.id}>
                  <td className={employeeStyles.table.td}>{att.employeeName || att.employee?.name || att.employee?.email || 'Unknown Employee'}</td>
                  <td className={employeeStyles.table.td}>{formatTime(att.checkInTime || att.checkIn) || '-'}</td>
                  <td className={employeeStyles.table.td}>{formatTime(att.checkOutTime || att.checkOut) || '-'}</td>
                  <td className={employeeStyles.table.td}>
                    <span className={getStatusBadge(att.status)}>
                      {att.status === 'present' ? 'Present' : att.status === 'late' ? 'Late' : 'Absent'}
                    </span>
                  </td>
                  <td className={`${employeeStyles.table.td} max-w-[200px] text-xs text-gray-700 whitespace-normal break-words`}>
                    {att.lateReason?.trim() ? att.lateReason : '—'}
                  </td>
                  <td className={`${employeeStyles.table.td} max-w-[200px] text-xs text-gray-700 whitespace-normal break-words`}>
                    {att.earlyCheckoutReason?.trim() ? att.earlyCheckoutReason : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400">No attendance records for today</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceMonitoring;