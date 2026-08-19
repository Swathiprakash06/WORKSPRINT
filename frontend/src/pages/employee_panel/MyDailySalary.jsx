import React, { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { apiGet } from '../../services/api';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/salaryUtils';
import Pagination from '../../components/Pagination';

const MyDailySalary = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedEntries = entries.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const loadSalary = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/api/v1/employee/salary/daily?month=${month}&year=${year}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
          setMonthlyTotal(data.monthlyTotal || 0);
        }
      } catch (err) {
        console.error('Failed to load salary credits:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSalary();
  }, [month, year]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <div>
          <h1 className={employeeStyles.table.title}>My Daily Salary</h1>
          <p className="text-sm text-gray-500 mt-1">
            Salary is credited when you work 6+ hours in a day
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3">
          <IndianRupee size={28} />
          <div>
            <p className="text-sm opacity-90">Running total for {months[month - 1]} {year}</p>
            <p className="text-3xl font-bold">{formatCurrency(monthlyTotal)}</p>
          </div>
        </div>
      </div>

      <div className={employeeStyles.table.tableWrapper}>
        <table className={employeeStyles.table.table}>
          <thead>
            <tr>
              <th className={employeeStyles.table.th}>Date</th>
              <th className={employeeStyles.table.th}>Check-in</th>
              <th className={employeeStyles.table.th}>Check-out</th>
              <th className={employeeStyles.table.th}>Hours Worked</th>
              <th className={employeeStyles.table.th}>Salary Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">Loading...</td>
              </tr>
            ) : entries.length > 0 ? (
              pagedEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className={employeeStyles.table.td}>{formatDate(entry.date)}</td>
                  <td className={employeeStyles.table.td}>
                    {entry.checkInTimestamp ? formatTime(entry.checkInTimestamp) : entry.checkInTime ? formatTime(entry.checkInTime) : 'Not checked in'}
                  </td>
                  <td className={employeeStyles.table.td}>
                    {entry.checkOutTimestamp ? formatTime(entry.checkOutTimestamp) : entry.checkOutTime ? formatTime(entry.checkOutTime) : 'Not checked out'}
                  </td>
                  <td className={employeeStyles.table.td}>{Number(entry.hoursWorked || 0).toFixed(2)}h</td>
                  <td className={employeeStyles.table.td}>
                    {entry.credited ? (
                      <span className="font-medium text-emerald-700">{formatCurrency(entry.amountCredited)} credited</span>
                    ) : (
                      <span className="text-amber-700">Not credited {entry.hoursWorked < 6 ? '(under 6 hours)' : ''}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
                  No attendance records for this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={entries.length} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default MyDailySalary;
