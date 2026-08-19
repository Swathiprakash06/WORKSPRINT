import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Send, MessageSquareReply } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut } from '../services/api';
import { employeeStyles } from '../styles';
import { formatDate } from '../utils/dateUtils';

const AdminQueries = ({ role }) => {
  const isSuperAdmin = role === 'superAdmin';
  const basePath = isSuperAdmin ? '/api/v1/super-admin' : '/api/v1/hr-admin';
  const [queries, setQueries] = useState([]);
  const [hrAdmins, setHrAdmins] = useState([]);
  const [form, setForm] = useState({ hrAdminId: '', subject: '', message: '' });
  const [responseFor, setResponseFor] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadQueries = useCallback(async () => {
    try {
      const res = await apiGet(`${basePath}/admin-queries`);
      if (res.ok) setQueries(await res.json());
      if (isSuperAdmin) {
        const adminsRes = await apiGet('/api/v1/super-admin/hr-admins');
        if (adminsRes.ok) setHrAdmins(await adminsRes.json());
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load admin queries');
    } finally {
      setLoading(false);
    }
  }, [basePath, isSuperAdmin]);

  useEffect(() => { loadQueries(); }, [loadQueries]);

  const sentQueries = queries.filter((query) => query.senderRole === (isSuperAdmin ? 'superAdmin' : 'hrAdmin'));
  const receivedQueries = queries.filter((query) => query.senderRole !== (isSuperAdmin ? 'superAdmin' : 'hrAdmin'));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.message.trim() || (isSuperAdmin && !form.hrAdminId)) {
      toast.error(isSuperAdmin ? 'Select an HR admin, subject, and message' : 'Subject and message are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost(`${basePath}/admin-queries`, {
        ...(isSuperAdmin ? { hrAdminId: Number(form.hrAdminId) } : {}),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to send query');
      const created = await res.json();
      setQueries((previous) => [created, ...previous]);
      setForm({ hrAdminId: '', subject: '', message: '' });
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.message || 'Could not send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (status = 'answered') => {
    if (!responseFor || !response.trim()) {
      toast.error('Response is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPut(`${basePath}/admin-queries/${responseFor.id}/respond`, { response: response.trim(), status });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to respond');
      const updated = await res.json();
      setQueries((previous) => previous.map((query) => query.id === updated.id ? updated : query));
      setResponseFor(null);
      setResponse('');
      toast.success(status === 'closed' ? 'Response sent and query closed' : 'Response sent');
    } catch (error) {
      toast.error(error.message || 'Could not respond');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <div>
          <h1 className={employeeStyles.table.title}>{isSuperAdmin ? 'HR Communications' : 'Super Admin Communications'}</h1>
          <p className="mt-1 text-sm text-gray-500">Send and respond to messages between HR and Super Admin.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800"><MessageCircle size={20} /> New Message</h2>
        {isSuperAdmin && (
          <select value={form.hrAdminId} onChange={(event) => setForm({ ...form, hrAdminId: event.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required>
            <option value="">Select HR admin</option>
            {hrAdmins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name} ({admin.organization?.companyName || 'Organization'})</option>)}
          </select>
        )}
        <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" maxLength={200} required />
        <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Write your message..." rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><Send size={16} /> Send Message</button>
      </form>

      {loading ? <p className="text-sm text-gray-500">Loading...</p> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <MessageSection
            title="Sent Messages"
            queries={sentQueries}
            emptyText="No sent messages yet."
            formatDate={formatDate}
          />
          <MessageSection
            title="Received Messages"
            queries={receivedQueries}
            emptyText="No received messages yet."
            formatDate={formatDate}
            onRespond={(query) => { setResponseFor(query); setResponse(query.response || ''); }}
          />
        </div>
      )}

      {responseFor && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold">Respond to: {responseFor.subject}</h2><textarea value={response} onChange={(event) => setResponse(event.target.value)} rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Write your response..." /><div className="flex justify-end gap-2"><button type="button" onClick={() => setResponseFor(null)} className="rounded-lg px-4 py-2 text-sm text-gray-600">Cancel</button><button type="button" disabled={submitting} onClick={() => handleRespond('answered')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">Send Response</button><button type="button" disabled={submitting} onClick={() => handleRespond('closed')} className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white">Send & Close</button></div></div></div>}
    </div>
  );
};

const MessageSection = ({ title, queries, emptyText, formatDate, onRespond }) => (
  <section className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-500">{queries.length}</span>
    </div>
    {queries.length === 0 ? <p className="py-6 text-sm text-gray-500">{emptyText}</p> : (
      <div className="space-y-3">
        {queries.map((query) => (
          <article key={query.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">{query.subject}</h3>
                <p className="text-xs text-gray-500">{query.organization?.companyName} · {formatDate(query.createdAt)}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs capitalize text-gray-700">{query.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{query.message}</p>
            {query.response && (
              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs font-semibold text-indigo-700">Response</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{query.response}</p>
              </div>
            )}
            {onRespond && query.status !== 'closed' && (
              <button type="button" onClick={() => onRespond(query)} className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700">
                <MessageSquareReply size={14} /> {query.response ? 'View / Edit Response' : 'Respond'}
              </button>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
);

export default AdminQueries;
