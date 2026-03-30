import React from 'react';
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { employeeStyles } from '../../styles';

const Dashboard = ({ employees, attendanceData }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData.filter(a => a.date === today);
  
  const totalEmployees = employees.length;
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const lateToday = todayAttendance.filter(a => a.status === 'late').length;
  
  const absentees = employees.filter(emp => 
    todayAttendance.some(a => a.employeeId === emp.id && a.status === 'absent')
  );

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
        <h2 className={employeeStyles.adminDashboard.sectionTitle}>Absentees List</h2>
        <div className={employeeStyles.adminDashboard.tableContainer}>
          <table className={employeeStyles.adminDashboard.table}>
            <thead>
              <tr>
                <th className={employeeStyles.adminDashboard.th}>Employee Name</th>
                <th className={employeeStyles.adminDashboard.th}>Email</th>
                <th className={employeeStyles.adminDashboard.th}>Department</th>
                <th className={employeeStyles.adminDashboard.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {absentees.length > 0 ? (
                absentees.map(emp => (
                  <tr key={emp.id}>
                    <td className={employeeStyles.adminDashboard.td}>{emp.name}</td>
                    <td className={employeeStyles.adminDashboard.td}>{emp.email}</td>
                    <td className={employeeStyles.adminDashboard.td}>{emp.department || '-'}</td>
                    <td className={employeeStyles.adminDashboard.td}>
                      <span className={employeeStyles.adminDashboard.statusBadge('absent')}>
                        Absent
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    No absentees today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;