// admin/EmployeeList.jsx
import React, { useState } from 'react';
import { Edit, Power, Search, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';
import { apiDelete } from '../../services/api';

const EmployeeList = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    status: 'active'
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeactivate = (id) => {
    setEmployees(employees.map(emp =>
      emp.id === id ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' } : emp
    ));
    toast.success('Employee status updated');
  };

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
      status: emp.status || 'active'
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateEmployee = () => {
    // Validate form data
    if (!editFormData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editFormData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Update employee in the list
    setEmployees(employees.map(emp =>
      emp.id === editingEmployee.id
        ? { ...emp, ...editFormData }
        : emp
    ));

    toast.success('Employee updated successfully');
    setEditingEmployee(null);
  };

  const handleCloseModal = () => {
    setEditingEmployee(null);
  };

  return (
    <div className={employeeStyles.table.container}>
      <div className={employeeStyles.table.header}>
        <h1 className={employeeStyles.table.title}>Employee List</h1>
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
      </div>
      
      <div className={employeeStyles.table.tableWrapper}>
        <table className={employeeStyles.table.table}>
          <thead>
            <tr>
              <th className={employeeStyles.table.th}>Name</th>
              <th className={employeeStyles.table.th}>Email</th>
              <th className={employeeStyles.table.th}>Department</th>
              <th className={employeeStyles.table.th}>Position</th>
              <th className={employeeStyles.table.th}>Status</th>
              <th className={employeeStyles.table.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td className={employeeStyles.table.td}>{emp.name}</td>
                <td className={employeeStyles.table.td}>{emp.email}</td>
                <td className={employeeStyles.table.td}>{emp.department || '-'}</td>
                <td className={employeeStyles.table.td}>{emp.position || '-'}</td>
                <td className={employeeStyles.table.td}>
                  <span className={employeeStyles.table.statusBadge(emp.status)}>
                    {emp.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={employeeStyles.table.td}>
                  <div className={employeeStyles.requests.actionButtons}>
                    <button onClick={() => handleEdit(emp)} className={employeeStyles.requests.editBtn}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeactivate(emp.id)} className={employeeStyles.requests.deactivateBtn}>
                      <Power size={16} />
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
        </table>
      </div>

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Edit Employee</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee email"
                />
              </div>

              {/* Department Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
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

              {/* Position Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={editFormData.position}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter employee position"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-4 border-t">
              <button
                onClick={handleCloseModal}
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
    </div>
  );
};

export default EmployeeList;