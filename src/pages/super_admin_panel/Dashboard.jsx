// pages/super_admin_panel/Dashboard.jsx
import React from 'react';
import { Mail, CheckCircle, XCircle, Building2, TrendingUp, Users } from 'lucide-react';
import { employeeStyles } from '../../styles';

const Dashboard = ({ enquiries, organizations }) => {
  const totalEnquiries = enquiries.length;
  const acceptedEnquiries = enquiries.filter(e => e.status === 'accepted').length;
  const rejectedEnquiries = enquiries.filter(e => e.status === 'rejected').length;
  const totalOrganizations = organizations.length;
  
  const recentEnquiries = [...enquiries]
    .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
    .slice(0, 5);

  const cards = [
    { 
      title: 'Total Enquiries', 
      value: totalEnquiries, 
      color: 'bg-purple-100 text-purple-800', 
      icon: Mail,
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Accepted Enquiries', 
      value: acceptedEnquiries, 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle,
      trend: '+5%',
      trendUp: true
    },
    { 
      title: 'Rejected Enquiries', 
      value: rejectedEnquiries, 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle,
      trend: '-2%',
      trendUp: false
    },
    { 
      title: 'Total Organizations', 
      value: totalOrganizations, 
      color: 'bg-blue-100 text-blue-800', 
      icon: Building2,
      trend: '+3',
      trendUp: true
    },
  ];

  return (
    <div className={employeeStyles.superAdminDashboard.container}>
      <h1 className={employeeStyles.superAdminDashboard.title}>Super Admin Dashboard</h1>
      
      <div className={employeeStyles.superAdminDashboard.cardGrid}>
        {cards.map((card, idx) => (
          <div key={idx} className={employeeStyles.superAdminDashboard.card}>
            <div className={employeeStyles.superAdminDashboard.cardHeader}>
              <card.icon className={employeeStyles.superAdminDashboard.cardIcon} />
              <span className={employeeStyles.superAdminDashboard.cardBadge(card.color)}>
                {card.title}
              </span>
            </div>
            <p className={employeeStyles.superAdminDashboard.cardValue}>{card.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {card.trendUp ? (
                <TrendingUp size={12} className="text-green-500" />
              ) : (
                <TrendingUp size={12} className="text-red-500 rotate-180" />
              )}
              <p className={`text-xs ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {card.trend} from last week
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className={employeeStyles.superAdminDashboard.recentSection}>
        <h2 className={employeeStyles.superAdminDashboard.sectionTitle}>Recent Enquiries</h2>
        <div className={employeeStyles.superAdminDashboard.tableContainer}>
          <table className={employeeStyles.superAdminDashboard.table}>
            <thead>
              <tr>
                <th className={employeeStyles.superAdminDashboard.th}>Company Name</th>
                <th className={employeeStyles.superAdminDashboard.th}>HR Name</th>
                <th className={employeeStyles.superAdminDashboard.th}>Employee Size</th>
                <th className={employeeStyles.superAdminDashboard.th}>Status</th>
                <th className={employeeStyles.superAdminDashboard.th}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.length > 0 ? (
                recentEnquiries.map(enquiry => (
                  <tr key={enquiry.id}>
                    <td className={employeeStyles.superAdminDashboard.td}>{enquiry.companyName}</td>
                    <td className={employeeStyles.superAdminDashboard.td}>{enquiry.hrName}</td>
                    <td className={employeeStyles.superAdminDashboard.td}>{enquiry.employeeSize}</td>
                    <td className={employeeStyles.superAdminDashboard.td}>
                      <span className={employeeStyles.superAdminDashboard.statusBadge(enquiry.status)}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className={employeeStyles.superAdminDashboard.td}>{enquiry.submittedDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No enquiries found
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