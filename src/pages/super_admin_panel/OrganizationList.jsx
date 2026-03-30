// pages/super_admin_panel/OrganizationList.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Edit, Power, Eye } from 'lucide-react';
import { employeeStyles } from '../../styles';

const OrganizationList = ({ organizations, setOrganizations }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrganizations = organizations.filter(org =>
    org.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.hrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuspend = (id) => {
    setOrganizations(organizations.map(org =>
      org.id === id ? { ...org, status: org.status === 'active' ? 'suspended' : 'active' } : org
    ));
    toast.success('Organization status updated');
  };

  const handleEdit = (org) => {
    toast.success(`Edit ${org.companyName} - Feature coming soon`);
  };

  const handleView = (org) => {
    toast.success(`Viewing ${org.companyName} details`);
  };

  const getUsagePercentage = (current, limit) => {
    return Math.round((current / limit) * 100);
  };

  return (
    <div className={employeeStyles.superAdminOrg.container}>
      <div className={employeeStyles.superAdminOrg.header}>
        <h1 className={employeeStyles.superAdminOrg.title}>Organization List</h1>
        <div className={employeeStyles.superAdminOrg.searchBox}>
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by company or HR name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={employeeStyles.superAdminOrg.searchInput}
          />
        </div>
      </div>
      
      <div className={employeeStyles.superAdminOrg.tableWrapper}>
        <table className={employeeStyles.superAdminOrg.table}>
          <thead>
            <tr>
              <th className={employeeStyles.superAdminOrg.th}>Company Name</th>
              <th className={employeeStyles.superAdminOrg.th}>HR Name</th>
              <th className={employeeStyles.superAdminOrg.th}>Email</th>
              <th className={employeeStyles.superAdminOrg.th}>Employee Limit</th>
              <th className={employeeStyles.superAdminOrg.th}>Current Usage</th>
              <th className={employeeStyles.superAdminOrg.th}>Status</th>
              <th className={employeeStyles.superAdminOrg.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map(org => {
                const usagePercentage = getUsagePercentage(org.currentEmployees, org.employeeLimit);
                return (
                  <tr key={org.id}>
                    <td className={employeeStyles.superAdminOrg.td}>{org.companyName}</td>
                    <td className={employeeStyles.superAdminOrg.td}>{org.hrName}</td>
                    <td className={employeeStyles.superAdminOrg.td}>{org.email}</td>
                    <td className={employeeStyles.superAdminOrg.td}>{org.employeeLimit}</td>
                    <td className={employeeStyles.superAdminOrg.td}>
                      <div className="flex items-center gap-2">
                        <span className={employeeStyles.superAdminOrg.limitBadge(org.currentEmployees, org.employeeLimit)}>
                          {org.currentEmployees} / {org.employeeLimit}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${usagePercentage >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${usagePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={employeeStyles.superAdminOrg.td}>
                      <span className={employeeStyles.superAdminOrg.statusBadge(org.status)}>
                        {org.status}
                      </span>
                    </td>
                    <td className={employeeStyles.superAdminOrg.td}>
                      <div className={employeeStyles.superAdminOrg.actions}>
                        <button 
                          onClick={() => handleView(org)} 
                          className={employeeStyles.superAdminOrg.editBtn}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(org)} 
                          className={employeeStyles.superAdminOrg.editBtn}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleSuspend(org.id)} 
                          className={employeeStyles.superAdminOrg.suspendBtn}
                          title={org.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No organizations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrganizationList;