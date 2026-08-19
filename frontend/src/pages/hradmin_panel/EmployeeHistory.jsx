// admin/EmployeeHistory.jsx
import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/salaryUtils';
import { apiGet } from '../../services/api';

const EmployeeHistory = ({ employees, attendanceData, requests }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryData, setSalaryData] = useState({ credits: [], employee: null });
  const [loadingSalary, setLoadingSalary] = useState(false);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const employeeAttendance = selectedEmployee
    ? attendanceData
        .filter(a => a.employeeId === selectedEmployee.id && !a.isTest)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const employeeRequests = selectedEmployee
    ? requests.filter(r => r.employeeId === selectedEmployee.id)
    : [];

  const employeeLeaves = employeeRequests.filter(
    r => String(r.type).toLowerCase() === 'leave' && r.status === 'approved'
  );
  const employeeLateRecords = employeeAttendance.filter(a => a.status === 'late');

  useEffect(() => {
    if (!selectedEmployee) {
      setSalaryData({ credits: [], employee: null });
      return;
    }

    const loadSalary = async () => {
      setLoadingSalary(true);
      try {
        const res = await apiGet(`/api/v1/hr-admin/employees/${selectedEmployee.id}/salary-credits`);
        if (res.ok) {
          setSalaryData(await res.json());
        }
      } catch (err) {
        console.error('Failed to load salary history:', err);
      } finally {
        setLoadingSalary(false);
      }
    };
    loadSalary();
  }, [selectedEmployee]);

  const monthlySalary = salaryData.employee?.monthlySalary ?? selectedEmployee?.monthlySalary;

  return (
    <div className={employeeStyles.history.container}>
      <h1 className={employeeStyles.history.title}>Employee History</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Employee List Sidebar */}
        <div className="lg:w-1/3 bg-white rounded-xl shadow-lg p-4 h-fit">
          <div className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedEmployee?.id === emp.id
                    ? 'bg-[#7C3AED] text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedEmployee?.id === emp.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    <User size={14} className={selectedEmployee?.id === emp.id ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{emp.name}</p>
                    <p className="text-xs opacity-75">{emp.position || 'No position'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Employee Details */}
        <div className="lg:w-2/3">
          {selectedEmployee ? (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-[#1F1A2E] mb-2">{selectedEmployee.name}</h2>
                <p className="text-gray-600 text-sm">{selectedEmployee.email}</p>
                <p className="text-gray-600 text-sm">{selectedEmployee.phone}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{selectedEmployee.position || 'No position'}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{selectedEmployee.department || 'No department'}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Monthly Salary: {monthlySalary ? formatCurrency(monthlySalary) : 'Not assigned'}
                  </span>
                </div>
              </div>

              {/* Daily Salary Credits */}
              <div className={employeeStyles.history.section}>
                <h3 className={employeeStyles.history.sectionTitle}>Daily Salary Credits</h3>
                <div className={employeeStyles.history.tableContainer}>
                  <table className={employeeStyles.history.table}>
                    <thead>
                      <tr>
                        <th className={employeeStyles.history.th}>Date</th>
                        <th className={employeeStyles.history.th}>Hours Worked</th>
                        <th className={employeeStyles.history.th}>Status</th>
                        <th className={employeeStyles.history.th}>Amount Credited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingSalary ? (
                        <tr><td colSpan="4" className="text-center py-4 text-gray-400">Loading...</td></tr>
                      ) : salaryData.credits?.length > 0 ? (
                        salaryData.credits.map((credit, idx) => (
                          <tr key={idx} className={credit.salaryCredited ? '' : 'bg-red-50'}>
                            <td className={employeeStyles.history.td}>{formatDate(credit.date)}</td>
                            <td className={employeeStyles.history.td}>{credit.hoursWorked}h</td>
                            <td className={employeeStyles.history.td}>
                              {credit.salaryCredited ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Credited</span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Not Credited</span>
                              )}
                            </td>
                            <td className={employeeStyles.history.td}>
                              {credit.salaryCredited ? formatCurrency(credit.amountCredited) : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center py-4 text-gray-400">No salary records yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance History */}
              <div className={employeeStyles.history.section}>
                <h3 className={employeeStyles.history.sectionTitle}>Attendance History</h3>
                <div className={employeeStyles.history.tableContainer}>
                  <table className={employeeStyles.history.table}>
                    <thead>
                      <tr>
                        <th className={employeeStyles.history.th}>Date</th>
                        <th className={employeeStyles.history.th}>Check-in</th>
                        <th className={employeeStyles.history.th}>Check-out</th>
                        <th className={employeeStyles.history.th}>Hours</th>
                        <th className={employeeStyles.history.th}>Status</th>
                        <th className={employeeStyles.history.th}>Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeAttendance.length > 0 ? (
                        employeeAttendance.map(att => (
                          <tr key={att.id}>
                            <td className={employeeStyles.history.td}>{formatDate(att.date)}</td>
                            <td className={employeeStyles.history.td}>{formatTime(att.checkInTime || att.checkIn) || '-'}</td>
                            <td className={employeeStyles.history.td}>{formatTime(att.checkOutTime || att.checkOut) || '-'}</td>
                            <td className={employeeStyles.history.td}>{att.totalHours ?? '-'}</td>
                            <td className={employeeStyles.history.td}>
                              <span className={employeeStyles.history.statusCell(att.status)}>
                                {att.status}
                              </span>
                            </td>
                            <td className={employeeStyles.history.td}>
                              {att.salaryCredited ? formatCurrency(att.salaryAmount) : '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="text-center py-4 text-gray-400">No attendance records</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leaves & Late Records */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={employeeStyles.history.section}>
                  <h3 className={employeeStyles.history.sectionTitle}>Approved Leaves</h3>
                  {employeeLeaves.length > 0 ? (
                    <div className="space-y-2">
                      {employeeLeaves.map(leave => (
                        <div key={leave.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-sm">{formatDate(leave.date)}</p>
                          <p className="text-xs text-gray-600">{leave.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">No approved leaves</p>
                  )}
                </div>

                <div className={employeeStyles.history.section}>
                  <h3 className={employeeStyles.history.sectionTitle}>Late Records</h3>
                  {employeeLateRecords.length > 0 ? (
                    <div className="space-y-2">
                      {employeeLateRecords.map(rec => (
                        <div key={rec.id} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                          <p className="font-medium text-sm">{formatDate(rec.date)}</p>
                          <p className="text-xs text-gray-600">Checked in at {formatTime(rec.checkInTime || rec.checkIn)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">No late records</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={employeeStyles.empty.container}>
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className={employeeStyles.empty.title}>Select an Employee</h3>
              <p className={employeeStyles.empty.description}>Choose an employee from the list to view their history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistory;
