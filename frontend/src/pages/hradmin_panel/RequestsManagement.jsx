// admin/RequestsManagement.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Search } from 'lucide-react'; // ← Add Search here
import { employeeStyles } from '../../styles';
import Pagination from '../../components/Pagination';

const RequestsManagement = ({ requests, setRequests, onApprove, onReject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const dataRequests = Array.isArray(requests) ? requests : [];
  const lowerSearch = searchTerm.toLowerCase();

  const filteredRequests = dataRequests.filter(req => {
    const employeeName = (req.employeeName || '').toString().toLowerCase();
    const type = (req.type || '').toString().toLowerCase();
    return employeeName.includes(lowerSearch) || type.includes(lowerSearch);
  });
  const pagedRequests = filteredRequests.slice((page - 1) * pageSize, page * pageSize);

  const handleApprove = async (request) => {
    if (onApprove) {
      await onApprove(request);
      return;
    }

    setRequests(requests.map(req =>
      req.id === request.id && req.type === request.type ? { ...req, status: 'approved' } : req
    ));
    toast.success('Request approved');
  };

  const handleReject = async (request) => {
    if (onReject) {
      await onReject(request);
      return;
    }

    setRequests(requests.map(req =>
      req.id === request.id && req.type === request.type ? { ...req, status: 'rejected' } : req
    ));
    toast.success('Request rejected');
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return `${colors[status]} px-2 py-1 rounded-full text-xs font-medium inline-block`;
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <h1 className={employeeStyles.table.title}>Requests Management</h1>
        <div className={employeeStyles.table.searchBox}>
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or type..."
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
              <th className={employeeStyles.table.th}>Request Type</th>
              <th className={employeeStyles.table.th}>Reason</th>
              <th className={employeeStyles.table.th}>Status</th>
              <th className={employeeStyles.table.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedRequests.map(req => (
              <tr key={`${req.type}-${req.id}`}>
                <td className={employeeStyles.table.td}>{req.employeeName}</td>
                <td className={employeeStyles.table.td}>{req.type}</td>
                <td className={employeeStyles.table.td}>{req.reason}</td>
                <td className={employeeStyles.table.td}>
                  <span className={getStatusBadge(req.status)}>{req.status}</span>
                </td>
                <td className={employeeStyles.table.td}>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(req)} 
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleReject(req)} 
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                  {req.status !== 'pending' && (
                    <span className="text-xs text-gray-400">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={filteredRequests.length} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default RequestsManagement;