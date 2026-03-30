// admin/EmployeeList.jsx
import React, { useState } from 'react';
import { Edit, Power, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';
const EmployeeList = ({ employees, setEmployees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleEdit = (emp) => {
    // In a real app, open a modal to edit
    toast.success(`Edit ${emp.name} - Feature coming soon`);
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
              <th className={employeeStyles.table.th}>Status</th>
              <th className={employeeStyles.table.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td className={employeeStyles.table.td}>{emp.name}</td>
                <td className={employeeStyles.table.td}>{emp.email}</td>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;