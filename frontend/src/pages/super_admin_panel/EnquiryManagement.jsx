// pages/super_admin_panel/EnquiryManagement.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { employeeStyles } from '../../styles';

const EnquiryManagement = ({ enquiries, setEnquiries, onAccept, onReject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.hrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || enquiry.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleAccept = async (id) => {
    if (onAccept) {
      await onAccept(id);
      return;
    }

    const enquiry = enquiries.find(e => e.id === id);
    setEnquiries(enquiries.map(e =>
      e.id === id ? { ...e, status: 'accepted' } : e
    ));
    toast.success(`${enquiry.companyName} has been accepted!`);
    
    // In a real app, you would also create an organization here
  };

  const handleReject = async (id) => {
    if (onReject) {
      await onReject(id);
      return;
    }

    const enquiry = enquiries.find(e => e.id === id);
    setEnquiries(enquiries.map(e =>
      e.id === id ? { ...e, status: 'rejected' } : e
    ));
    toast.error(`${enquiry.companyName} has been rejected`);
  };

  

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return `${colors[status]} px-2 py-1 rounded-full text-xs font-medium inline-block`;
  };

  const stats = {
    total: enquiries.length,
    pending: enquiries.filter(e => e.status === 'pending').length,
    accepted: enquiries.filter(e => e.status === 'accepted').length,
    rejected: enquiries.filter(e => e.status === 'rejected').length,
  };

  return (
    <div className={employeeStyles.superAdminEnquiry.container}>
      <div className={employeeStyles.superAdminEnquiry.header}>
        <h1 className={employeeStyles.superAdminEnquiry.title}>Enquiry Management</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className={employeeStyles.superAdminEnquiry.searchBox}>
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, HR name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={employeeStyles.superAdminEnquiry.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          <p className="text-xs text-green-600">Accepted</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-xs text-red-600">Rejected</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={employeeStyles.superAdminEnquiry.filterBtn(filterStatus === 'all')}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={employeeStyles.superAdminEnquiry.filterBtn(filterStatus === 'pending')}
        >
          Pending
        </button>
        <button
          onClick={() => setFilterStatus('accepted')}
          className={employeeStyles.superAdminEnquiry.filterBtn(filterStatus === 'accepted')}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={employeeStyles.superAdminEnquiry.filterBtn(filterStatus === 'rejected')}
        >
          Rejected
        </button>
      </div>
      
      <div className={employeeStyles.superAdminEnquiry.tableWrapper}>
        <table className={employeeStyles.superAdminEnquiry.table}>
          <thead>
            <tr>
              <th className={employeeStyles.superAdminEnquiry.th}>Company Name</th>
              <th className={employeeStyles.superAdminEnquiry.th}>HR Name</th>
              <th className={employeeStyles.superAdminEnquiry.th}>Email</th>
              <th className={employeeStyles.superAdminEnquiry.th}>Phone</th>
              <th className={employeeStyles.superAdminEnquiry.th}>Employee Size</th>
              <th className={employeeStyles.superAdminEnquiry.th}>Status</th>
              <th className={employeeStyles.superAdminEnquiry.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.length > 0 ? (
              filteredEnquiries.map(enquiry => (
                <tr key={enquiry.id}>
                  <td className={employeeStyles.superAdminEnquiry.td}>{enquiry.companyName}</td>
                  <td className={employeeStyles.superAdminEnquiry.td}>{enquiry.hrName}</td>
                  <td className={employeeStyles.superAdminEnquiry.td}>{enquiry.email}</td>
                  <td className={employeeStyles.superAdminEnquiry.td}>{enquiry.phone}</td>
                  <td className={employeeStyles.superAdminEnquiry.td}>{enquiry.employeeSize}</td>
                  <td className={employeeStyles.superAdminEnquiry.td}>
                    <span className={getStatusBadge(enquiry.status)}>{enquiry.status}</span>
                  </td>
                  <td className={employeeStyles.superAdminEnquiry.td}>
                    <div className={employeeStyles.superAdminEnquiry.actionButtons}>
                      
                      {enquiry.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAccept(enquiry.id)} 
                            className={employeeStyles.superAdminEnquiry.acceptBtn}
                            title="Accept"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleReject(enquiry.id)} 
                            className={employeeStyles.superAdminEnquiry.rejectBtn}
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  No enquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnquiryManagement;