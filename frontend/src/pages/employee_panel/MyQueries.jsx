import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Send } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { apiGet, apiPost } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const statusBadge = (status) => {
  const colors = {
    open: 'bg-orange-100 text-orange-700',
    answered: 'bg-blue-100 text-blue-700',
    closed: 'bg-gray-100 text-gray-700',
  };
  return `${colors[status] || colors.open} px-2 py-1 rounded-full text-xs font-medium inline-block capitalize`;
};

const MyQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const loadQueries = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/api/v1/employee/queries');
      if (res.ok) setQueries(await res.json());
    } catch (err) {
      console.error('Failed to load queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!subject || !message) {
      toast.error('Subject and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost('/api/v1/employee/queries', { subject, message });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit query');
      }
      const created = await res.json();
      setQueries((prev) => [created, ...prev]);
      setForm({ subject: '', message: '' });
      toast.success('Your query has been sent to HR');
    } catch (err) {
      toast.error(err.message || 'Could not submit query');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <div>
          <h1 className={employeeStyles.table.title}>Contact HR</h1>
          <p className="text-sm text-gray-500 mt-1">
            Send problems, questions, or concerns directly to the HR team
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle size={20} className="text-indigo-600" />
          New Query
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. Salary issue, attendance correction..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Describe your problem or question in detail..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <Send size={16} />
          {submitting ? 'Sending...' : 'Send to HR'}
        </button>
      </form>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">My Queries</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : queries.length === 0 ? (
        <p className="text-sm text-gray-500">No queries yet. Use the form above to contact HR.</p>
      ) : (
        <div className="space-y-4">
          {queries.map((q) => (
            <div
              key={q.id}
              className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{q.subject}</h3>
                <span className={statusBadge(q.status)}>{q.status}</span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{q.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                Submitted {formatDate(q.createdAt)}
              </p>
              {q.hrResponse && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">HR Response</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.hrResponse}</p>
                  {q.respondedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Responded {formatDate(q.respondedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQueries;
