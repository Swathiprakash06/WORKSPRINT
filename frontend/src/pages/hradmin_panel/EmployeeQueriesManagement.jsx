import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, MessageSquareReply } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { apiPut } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import Pagination from '../../components/Pagination';

const statusBadge = (status) => {
  const colors = {
    open: 'bg-orange-100 text-orange-700',
    answered: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-700',
  };
  return `${colors[status] || colors.open} px-2 py-1 rounded-full text-xs font-medium inline-block capitalize`;
};

const EmployeeQueriesManagement = ({ queries, setQueries, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const dataQueries = Array.isArray(queries) ? queries : [];
  const lowerSearch = searchTerm.toLowerCase();

  const filteredQueries = dataQueries.filter((q) => {
    const name = (q.employee?.name || '').toLowerCase();
    const email = (q.employee?.email || '').toLowerCase();
    const subject = (q.subject || '').toLowerCase();
    const matchesSearch = name.includes(lowerSearch) || email.includes(lowerSearch) || subject.includes(lowerSearch);
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const pagedQueries = filteredQueries.slice((page - 1) * pageSize, page * pageSize);

  const openRespond = (query) => {
    setRespondingTo(query);
    setResponseText(query.hrResponse || '');
  };

  const closeRespond = () => {
    setRespondingTo(null);
    setResponseText('');
  };

  const handleSubmitResponse = async (closeAfter = false) => {
    if (!respondingTo) return;
    const trimmed = responseText.trim();
    if (!trimmed) {
      toast.error('Please enter a response');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPut(`/api/v1/hr-admin/queries/${respondingTo.id}/respond`, {
        response: trimmed,
        status: closeAfter ? 'closed' : 'answered',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send response');
      }
      const updated = await res.json();
      setQueries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      toast.success(closeAfter ? 'Query closed' : 'Response sent to employee');
      closeRespond();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'Could not send response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <div>
          <h1 className={employeeStyles.table.title}>Employee Queries</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and respond to employee problems and questions
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
          <div className={employeeStyles.table.searchBox}>
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search employee or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={employeeStyles.table.searchInput}
            />
          </div>
        </div>
      </div>

      <div className={employeeStyles.table.tableWrapper}>
        <table className={employeeStyles.table.table}>
          <thead>
            <tr>
              <th className={employeeStyles.table.th}>Employee</th>
              <th className={employeeStyles.table.th}>Subject</th>
              <th className={employeeStyles.table.th}>Message</th>
              <th className={employeeStyles.table.th}>Submitted</th>
              <th className={employeeStyles.table.th}>Status</th>
              <th className={employeeStyles.table.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${employeeStyles.table.td} text-center text-gray-500`}>
                  No queries found
                </td>
              </tr>
            ) : (
              pagedQueries.map((q) => (
                <tr key={q.id}>
                  <td className={employeeStyles.table.td}>
                    <div className="font-medium">{q.employee?.name || '—'}</div>
                    <div className="text-xs text-gray-500">{q.employee?.email}</div>
                  </td>
                  <td className={employeeStyles.table.td}>{q.subject}</td>
                  <td className={`${employeeStyles.table.td} max-w-xs truncate`} title={q.message}>
                    {q.message}
                  </td>
                  <td className={employeeStyles.table.td}>{formatDate(q.createdAt)}</td>
                  <td className={employeeStyles.table.td}>
                    <span className={statusBadge(q.status)}>{q.status}</span>
                  </td>
                  <td className={employeeStyles.table.td}>
                    <button
                      type="button"
                      onClick={() => openRespond(q)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
                    >
                      <MessageSquareReply size={14} />
                      {q.hrResponse ? 'View / Edit' : 'Respond'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={filteredQueries.length} onPageChange={setPage} />
      </div>

      {respondingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Respond to: {respondingTo.subject}
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {respondingTo.message}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your response</label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Write your reply to the employee..."
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={closeRespond}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitResponse(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Response'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmitResponse(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
              >
                Send & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeQueriesManagement;
