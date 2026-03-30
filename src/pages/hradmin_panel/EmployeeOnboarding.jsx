// admin/EmployeeOnboarding.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, UserPlus } from 'lucide-react';
import { employeeStyles } from '../../styles';
const EmployeeOnboarding = ({ setEmployees, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEmployee = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const newEmployee = {
      id: Date.now(),
      ...formData,
      status: 'active',
    };
    
    setEmployees([...employees, newEmployee]);
    toast.success('Employee created successfully!');
    setFormData({ name: '', email: '', phone: '', role: '', department: '' });
  };

  const handleSendCredentials = () => {
    if (!formData.email) {
      toast.error('Please enter email address');
      return;
    }
    toast.success(`Credentials sent to ${formData.email}`);
  };

  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Employee Onboarding</h1>
      <div className={employeeStyles.requests.form}>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Role (optional)</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Developer, Designer"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Department (optional)</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Engineering, HR"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleCreateEmployee}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <UserPlus size={18} />
            Create Employee
          </button>
          <button
            onClick={handleSendCredentials}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#7C3AED] text-[#7C3AED] font-semibold rounded-lg hover:bg-[#7C3AED] hover:text-white transition-all duration-200"
          >
            <Send size={18} />
            Send Credentials via Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;