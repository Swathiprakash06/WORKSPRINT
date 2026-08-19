// pages/super_admin_panel/OrganizationList.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Edit, Trash2, Key, X, Copy, Eye } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { apiDelete, apiPost, apiPut } from '../../services/api';
import Pagination from '../../components/Pagination';

const OrganizationList = ({ organizations, setOrganizations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [editForm, setEditForm] = useState({ companyName: '', hrName: '', email: '', phone: '', employeeLimit: '' });
  const [resetOrganization, setResetOrganization] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const closeResetModal = () => {
    setResetOrganization(null);
    setResetPassword('');
    setConfirmPassword('');
  };

  const filteredOrganizations = organizations.filter(org =>
    org.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.hrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pagedOrganizations = filteredOrganizations.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (org) => {
    try {
      const res = await apiDelete(`/api/v1/super-admin/organizations/${org.id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to delete organization');
      }
      setOrganizations((prev) => prev.filter((o) => o.id !== org.id));
      toast.success('Organization deleted');
    } catch (error) {
      console.error('Delete organization failed:', error);
      toast.error(error.message || 'Could not delete organization');
    }
  };

  const handleEdit = (org) => {
    setEditingOrganization(org);
    setEditForm({
      companyName: org.companyName || '',
      hrName: org.hrName || '',
      email: org.email || '',
      phone: org.phone || '',
      employeeLimit: org.employeeLimit ?? '',
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await apiPut(`/api/v1/super-admin/organizations/${editingOrganization.id}`, {
        ...editForm,
        employeeLimit: Number(editForm.employeeLimit),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to update organization');
      }
      const updated = await res.json();
      setOrganizations((prev) => prev.map((org) => org.id === updated.id ? { ...org, ...updated } : org));
      setEditingOrganization(null);
      toast.success('Organization updated successfully');
    } catch (error) {
      toast.error(error.message || 'Could not update organization');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    const hrAdmin = resetOrganization?.hrAdmins?.[0];
    if (!hrAdmin) {
      toast.error('No HR admin is linked to this organization');
      return;
    }
    if (resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (resetPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setResetting(true);
    try {
      const res = await apiPost(`/api/v1/super-admin/hr-admins/${hrAdmin.id}/reset-password`, { password: resetPassword });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to reset password');
      }
      toast.success(`Password reset for ${hrAdmin.name || resetOrganization.hrName}`);
      closeResetModal();
    } catch (error) {
      toast.error(error.message || 'Could not reset password');
    } finally {
      setResetting(false);
    }
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
              pagedOrganizations.map(org => {
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
                          onClick={() => handleEdit(org)} 
                          className={employeeStyles.superAdminOrg.editBtn}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setResetOrganization(org)}
                          className="rounded-md p-1.5 text-amber-700 hover:bg-amber-100"
                          title="Reset HR admin password"
                        >
                          <Key size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(org)}
                          className={employeeStyles.superAdminOrg.deleteBtn}
                          title="Delete organization"
                        >
                          <Trash2 size={16} />
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
        <Pagination page={page} pageSize={pageSize} total={filteredOrganizations.length} onPageChange={setPage} />
      </div>

      {editingOrganization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleUpdate} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Edit Organization</h2>
              <button type="button" onClick={() => setEditingOrganization(null)} className="text-gray-500 hover:text-gray-800" title="Close">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['companyName', 'Company Name'],
                ['hrName', 'HR Name'],
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['employeeLimit', 'Employee Limit'],
              ].map(([name, label]) => (
                <label key={name} className="block text-sm text-gray-700 sm:last:col-span-2">
                  <span className="mb-1 block font-medium">{label}</span>
                  <input
                    type={name === 'employeeLimit' ? 'number' : name === 'email' ? 'email' : 'text'}
                    min={name === 'employeeLimit' ? 1 : undefined}
                    value={editForm[name]}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, [name]: event.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingOrganization(null)} className="rounded-md bg-gray-100 px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      {resetOrganization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
              <button type="button" onClick={closeResetModal} className="text-gray-400 transition-colors hover:text-gray-600" title="Close">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <p className="text-sm text-gray-600">
                Reset password for <strong>{resetOrganization.hrAdmins?.[0]?.name || resetOrganization.hrName}</strong>{' '}
                ({resetOrganization.hrAdmins?.[0]?.email || resetOrganization.email})
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={resetPassword}
                      onChange={(event) => setResetPassword(event.target.value)}
                      placeholder="Must be at least 6 characters"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye size={18} /></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetPassword) {
                        navigator.clipboard.writeText(resetPassword);
                        toast.success('Password copied to clipboard!');
                      } else {
                        toast.error('Enter a password first');
                      }
                    }}
                    className="rounded-md bg-gray-200 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-300"
                    title="Copy password"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Confirm Password *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><Eye size={18} /></div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={closeResetModal} className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={handleResetPassword} disabled={resetting} className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50">
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationList;