import React, { useMemo, useState } from 'react';
import { Users, CheckCircle, XCircle, AlertCircle, CalendarDays } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { getCurrentDate, toLocalDateKey, formatDate } from '../../utils/dateUtils';
import TablePlaceholder from '../../components/TablePlaceholder';
import { apiGet } from '../../services/api';

const Dashboard = ({ employees, attendanceData, todaySummary }) => {
  const employeesList = Array.isArray(employees) ? employees : (employees && employees.items) || [];
  const attendanceList = Array.isArray(attendanceData) ? attendanceData : [];
  const today = getCurrentDate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateSummary, setSelectedDateSummary] = useState(null);

  // Use backend-provided todaySummary when available (includes synthetic absent records and counts)
  const todayRecords = (todaySummary && Array.isArray(todaySummary.records))
    ? todaySummary.records
    : attendanceList.filter((a) => toLocalDateKey(a.date) === today);

  // When a user selects a date, fetch the server summary for that date
  React.useEffect(() => {
    let mounted = true;
    const fetchForDate = async (date) => {
      try {
        const res = await apiGet(`/api/v1/hr-admin/attendance/today?date=${date}`);
        if (!mounted) return;
        if (res && res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.records)) {
            const normalizedToday = json.records.map((row) => ({
              ...row,
              date: toLocalDateKey(row.date),
            }));
            setSelectedDateSummary({ ...json, records: normalizedToday });
          } else {
            setSelectedDateSummary(json);
          }
        } else {
          setSelectedDateSummary(null);
        }
      } catch (err) {
        console.error('Failed to load date summary', err);
        setSelectedDateSummary(null);
      }
    };

    if (!selectedDate) {
      setSelectedDateSummary(null);
      return () => { mounted = false; };
    }

    // if selected date is today and we have todaySummary, reuse it
    if (selectedDate === today && todaySummary) {
      setSelectedDateSummary(todaySummary);
      return () => { mounted = false; };
    }

    fetchForDate(selectedDate);
    return () => { mounted = false; };
  }, [selectedDate, todaySummary, today]);

  const totalEmployees = employeesList.length;
  const presentToday = todayRecords.filter((a) => a.status === 'present').length;
  const absentToday = todayRecords.filter((a) => a.status === 'absent').length;
  const leaveToday = todayRecords.filter((a) => a.status === 'leave').length;
  const lateToday = todayRecords.filter((a) => a.status === 'late').length;

  const employeeMap = useMemo(
    () => new Map(employeesList.map((emp) => [emp.id, emp])),
    [employeesList]
  );

  const absentRecords = useMemo(() => {
    // If user is viewing today, prefer todaySummary (includes synthetic absentees / leave)
    const source = (selectedDate && selectedDateSummary && Array.isArray(selectedDateSummary.records))
      ? selectedDateSummary.records
      : (selectedDate === today && todaySummary && Array.isArray(todaySummary.records))
        ? todaySummary.records
        : attendanceList;

    return source
      .filter((a) => (a.status === 'absent' || a.status === 'leave') && !a.isTest)
      .map((record) => {
        const emp = employeeMap.get(record.employeeId);
        const dateKey = toLocalDateKey(record.date);
        return {
          id: record.id,
          employeeId: record.employeeId,
          dateKey,
          status: record.status,
          name: record.employeeName || record.employee?.name || emp?.name || 'Unknown Employee',
          email: record.employee?.email || emp?.email || '-',
          department: record.employee?.department || emp?.department || '-',
        };
      })
      .filter((row) => !selectedDate || row.dateKey === selectedDate)
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || a.name.localeCompare(b.name));
  }, [attendanceList, employeeMap, selectedDate, selectedDateSummary, today, todaySummary]);

  const availableAbsentDates = useMemo(() => {
    const dates = new Set(
      attendanceList
        .filter((a) => (a.status === 'absent' || a.status === 'leave') && !a.isTest)
        .map((a) => toLocalDateKey(a.date))
        .filter(Boolean)
    );
    // include today if backend reports absentees or approved leave for today
    if (todaySummary && (todaySummary.absentCount > 0 || todaySummary.leavesCount > 0 || todaySummary.records?.some((r) => r.status === 'leave'))) {
      dates.add(today);
    }
    return [...dates].sort((a, b) => b.localeCompare(a));
  }, [attendanceList]);

  const cards = [
    { title: 'Total Employees', value: totalEmployees, color: 'bg-purple-100 text-purple-800', icon: Users },
    { title: 'Present Today', value: presentToday, color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { title: 'Absent Today', value: absentToday, color: 'bg-red-100 text-red-800', icon: XCircle },

    { title: 'Late Today', value: lateToday, color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  ];

  return (
    <div className={employeeStyles.adminDashboard.container}>
      <h1 className={employeeStyles.adminDashboard.title}>Dashboard</h1>

      <div className={employeeStyles.adminDashboard.cardGrid}>
        {cards.map((card, idx) => (
          <div key={idx} className={employeeStyles.adminDashboard.card}>
            <div className={employeeStyles.adminDashboard.cardHeader}>
              <card.icon className={employeeStyles.adminDashboard.cardIcon} />
              <span className={employeeStyles.adminDashboard.cardBadge(card.color)}>
                {card.title}
              </span>
            </div>
            <p className={employeeStyles.adminDashboard.cardValue}>{card.value}</p>
            <p className={employeeStyles.adminDashboard.cardLabel}>as of today</p>
          </div>
        ))}
      </div>

      <div className={employeeStyles.adminDashboard.absenteesSection}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className={employeeStyles.adminDashboard.sectionTitle}>Absentees & Approved Leave</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedDate
                ? `Showing absentees and approved leave on ${formatDate(selectedDate)}`
                : 'All absentees and approved leave sorted by date (newest first)'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <CalendarDays size={16} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm outline-none bg-transparent"
              />
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Show all dates
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              className="px-3 py-2 text-sm text-[#7C3AED] bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {availableAbsentDates.length > 0 && (
          <p className="text-xs text-gray-400 mb-3">
            {availableAbsentDates.length} date{availableAbsentDates.length !== 1 ? 's' : ''} with absent records
          </p>
        )}

        <div className={employeeStyles.adminDashboard.tableContainer}>
          <table className={employeeStyles.adminDashboard.table}>
            <thead>
              <tr>
                <th className={employeeStyles.adminDashboard.th}>Date</th>
                <th className={employeeStyles.adminDashboard.th}>Employee Name</th>
                <th className={employeeStyles.adminDashboard.th}>Email</th>
                <th className={employeeStyles.adminDashboard.th}>Department</th>
                <th className={employeeStyles.adminDashboard.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {absentRecords.length > 0 ? (
                absentRecords.map((row) => (
                  <tr key={`${row.dateKey}-${row.employeeId}-${row.id}`}>
                    <td className={employeeStyles.adminDashboard.td}>{formatDate(row.dateKey)}</td>
                    <td className={employeeStyles.adminDashboard.td}>{row.name}</td>
                    <td className={employeeStyles.adminDashboard.td}>{row.email}</td>
                    <td className={employeeStyles.adminDashboard.td}>{row.department}</td>
                    <td className={employeeStyles.adminDashboard.td}>
                      <span className={employeeStyles.adminDashboard.statusBadge(row.status === 'leave' ? 'leave' : 'absent')}>
                        {row.status === 'leave' ? 'Approved Leave' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <TablePlaceholder columns={5} rows={3} showMessage={true} message="No entries" />
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
