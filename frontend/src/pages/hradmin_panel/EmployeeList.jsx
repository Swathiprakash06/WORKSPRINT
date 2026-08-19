// admin/EmployeeList.jsx
import React, { useState } from 'react';
import { Edit, Search, X, Trash2, UserPlus, Key, Copy, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';
import { apiDelete, apiPost, apiPut } from '../../services/api';
import { formatCurrency } from '../../utils/salaryUtils';
import { INDIAN_STATES } from '../../constants/indianStates';
import TablePlaceholder from '../../components/TablePlaceholder';
import Pagination from '../../components/Pagination';

const EMPTY_CREATE_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  position: '',
  department: '',
  state: '',
  monthlySalary: '',
};

const EmployeeList = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    monthlySalary: '',
  });
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [resettingPassword, setResettingPassword] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pagedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  const handleDeleteEmployee = async (id) => {
    try {
      const res = await apiDelete(`/api/v1/hr-admin/employees/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete employee');
      }
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Delete employee failed:', error);
      toast.error(error.message || 'Could not delete employee');
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setEditFormData({
      name: emp.name || '',
      email: emp.email || '',
      department: emp.department || '',
      position: emp.position || '',
      phone: emp.phone || '',
      monthlySalary: emp.monthlySalary ?? '',
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateInputChange = (e) => {
    setCreateFormData({ ...createFormData, [e.target.name]: e.target.value });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateFormData({ ...createFormData, password });
    toast.success('Password generated!');
  };

  const handleCreateEmployee = async () => {
    if (!createFormData.name || !createFormData.email || !createFormData.monthlySalary || !createFormData.password) {
      toast.error(' Please fill all required fields (Name, Email, Monthly Salary, Password)');
      return;
    }
    if (!createFormData.department?.trim() || !createFormData.position?.trim()) {
      toast.error(' Department and Position are required');
      return;
    }
    if (!createFormData.state?.trim()) {
      toast.error(' State belongs to is required');
      return;
    }

    // Validate password length
    if (createFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createFormData.email)) {
      toast.error(' Please enter a valid email address');
      return;
    }

    const phoneValue = (createFormData.phone || '').trim();
    if (phoneValue && !/^[0-9+()\-\s]{7,20}$/.test(phoneValue)) {
      toast.error(' Please enter a valid phone number');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: createFormData.name,
        email: createFormData.email,
        phone: createFormData.phone,
        password: createFormData.password,
        department: createFormData.department || '',
        position: createFormData.position || '',
        state: createFormData.state || '',
        monthlySalary: createFormData.monthlySalary ? Number(createFormData.monthlySalary) : null,
      };
      console.log('Create employee payload:', payload);
      const response = await apiPost('/api/v1/hr-admin/employees', payload);

      if (!response.ok) {
        // Read raw text and attempt to parse JSON so we can log the full server response for debugging.
        const text = await response.text().catch(() => '');
        let parsed = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch {
          // ignore JSON parse error; keep raw text
        }
        console.error('Create employee failed. Server response:', {
          status: response.status,
          statusText: response.statusText,
          bodyText: text,
          bodyJson: parsed,
        });

        // Prefer common error properties when available for the thrown message.
        const msg = (parsed && (parsed.message || parsed.error || parsed.detail)) || text || `Request failed ${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      const newEmployee = await response.json();
      console.log('Create employee succeeded. New employee:', newEmployee);
      setEmployees([...employees, newEmployee]);
      toast.success(`Employee ${createFormData.name} created successfully! Credentials sent to their email.`);
      setCreateFormData(EMPTY_CREATE_FORM);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create employee error:', error);
      // Show specific error messages
      if (error.message && error.message.toLowerCase().includes('email')) {
        toast.error(' Email already exists. Please use a different email.');
      } else if (error.message && error.message.toLowerCase().includes('password')) {
        toast.error('Password must be at least 6 characters long.');
      } else {
        toast.error(' ' + (error.message || 'Failed to create employee'));
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editFormData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editFormData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      const payload = {
        ...editFormData,
        monthlySalary: editFormData.monthlySalary !== '' ? Number(editFormData.monthlySalary) : null,
      };
      const res = await apiPut(`/api/v1/hr-admin/employees/${editingEmployee.id}`, payload);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Update failed (${res.status})`);
      }
      const updated = await res.json();
      setEmployees(employees.map(emp =>
        emp.id === editingEmployee.id ? { ...emp, ...updated } : emp
      ));
      toast.success('Employee updated successfully');
      setEditingEmployee(null);
    } catch (error) {
      toast.error(error.message || 'Could not update employee');
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData(EMPTY_CREATE_FORM);
  };

  const handleCloseEditModal = () => {
    setEditingEmployee(null);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordForm.password) {
      toast.error('Please enter a new password');
      return;
    }

    if (resetPasswordForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      toast.error(' Passwords do not match');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await apiPost(
        `/api/v1/hr-admin/employees/${resetPasswordEmployee.id}/reset-password`,
        { password: resetPasswordForm.password }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to reset password');
      }

      toast.success(`Password reset successfully for ${resetPasswordEmployee.name}!`);
      setResetPasswordEmployee(null);
      setResetPasswordForm({ password: '', confirmPassword: '' });
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.message && error.message.toLowerCase().includes('password')) {
        toast.error('Password must be at least 6 characters long.');
      } else {
        toast.error(' ' + (error.message || 'Could not reset password'));
      }
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCloseResetPasswordModal = () => {
    setResetPasswordEmployee(null);
    setResetPasswordForm({ password: '', confirmPassword: '' });
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <h1 className={employeeStyles.table.title}>Employee List</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className={employeeStyles.table.searchBox}>
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={employeeStyles.table.searchInput}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 whitespace-nowrap"
          >
            <UserPlus size={16} />
            Create Employee
          </button>
        </div>
      </div>

      <div className={employeeStyles.table.tableWrapper}>
        <table className={employeeStyles.table.table}>
          <thead>
            <tr>
              <th className={employeeStyles.table.th}>Name</th>
              <th className={employeeStyles.table.th}>Email</th>
              <th className={employeeStyles.table.th}>Department</th>
              <th className={employeeStyles.table.th}>Position</th>
              <th className={employeeStyles.table.th}>Monthly Salary</th>
              <th className={employeeStyles.table.th}>Actions</th>
            </tr>
          </thead>
          {filteredEmployees.length > 0 ? (
            <tbody>
              {pagedEmployees.map(emp => (
                <tr key={emp.id}>
                  <td className={employeeStyles.table.td}>{emp.name}</td>
                  <td className={employeeStyles.table.td}>{emp.email}</td>
                  <td className={employeeStyles.table.td}>{emp.department || '-'}</td>
                  <td className={employeeStyles.table.td}>{emp.position || '-'}</td>
                  <td className={employeeStyles.table.td}>
                    {emp.monthlySalary ? formatCurrency(emp.monthlySalary) : '-'}
                  </td>
                  
                  <td className={employeeStyles.table.td}>
                    <div className={employeeStyles.requests.actionButtons}>
                      <button onClick={() => handleEdit(emp)} className={employeeStyles.requests.editBtn}>
                        <Edit size={16} />
                      </button>                      <button 
                        onClick={() => setResetPasswordEmployee(emp)} 
                        className={employeeStyles.requests.rejectBtn}
                        title="Reset Password"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className={employeeStyles.requests.deleteBtn}
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <TablePlaceholder columns={7} rows={4} showMessage={true} message="No entries" useTbody={true} />
          )}
        </table>
        <Pagination page={page} pageSize={pageSize} total={filteredEmployees.length} onPageChange={setPage} />
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">Create Employee</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateInputChange}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    name="email"
                    value={createFormData.email}
                    onChange={handleCreateInputChange}
                    placeholder="Enter email address"
                    aria-required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createFormData.email || '');
                        toast.success('Email copied to clipboard');
                      } catch (err) {
                        console.error('Copy failed', err);
                        toast.error('Copy failed');
                      }
                    }}
                    className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    title="Copy email"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={createFormData.phone}
                  onChange={handleCreateInputChange}
                  placeholder="Enter 10-digit phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="password"
                    value={createFormData.password}
                    onChange={handleCreateInputChange}
                    placeholder="Enter or generate password"
                    aria-required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createFormData.password || '');
                        toast.success('Password copied to clipboard');
                      } catch (err) {
                        console.error('Copy failed', err);
                        toast.error('Copy failed');
                      }
                    }}
                    className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    title="Copy password"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm whitespace-nowrap flex items-center gap-2"
                  >
                    <Key size={16} />
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  name="department"
                  value={createFormData.department}
                  onChange={handleCreateInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State belongs to *</label>
                <select
                  name="state"
                  value={createFormData.state}
                  onChange={handleCreateInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((stateName) => (
                    <option key={stateName} value={stateName}>{stateName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  name="position"
                  value={createFormData.position}
                  onChange={handleCreateInputChange}
                  placeholder="e.g. Senior Software Engineer, HR Executive"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹) *</label>
                <input
                  type="number"
                  name="monthlySalary"
                  value={createFormData.monthlySalary}
                  onChange={handleCreateInputChange}
                  placeholder="e.g. 18000"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={handleCloseCreateModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEmployee}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] rounded-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                <UserPlus size={16} />
                {creating ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Edit Employee</h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={editFormData.department}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">Human Resources</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee position"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
                <input
                  type="number"
                  name="monthlySalary"
                  value={editFormData.monthlySalary}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 18000"
                  min="0"
                  step="100"
                />
              </div>

             
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmployee}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
              <button
                onClick={handleCloseResetPasswordModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Reset password for <strong>{resetPasswordEmployee.name}</strong> ({resetPasswordEmployee.email})
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={resetPasswordForm.password}
                      onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, password: e.target.value })}
                      placeholder="Must be at least 6 characters"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Eye size={18} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetPasswordForm.password) {
                        navigator.clipboard.writeText(resetPasswordForm.password);
                        toast.success('Password copied to clipboard!');
                      } else {
                        toast.error('Enter a password first');
                      }
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                    title="Copy password"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Eye size={18} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseResetPasswordModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {resettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
