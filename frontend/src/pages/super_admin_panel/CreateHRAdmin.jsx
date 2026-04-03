// pages/super_admin_panel/CreateHRAdmin.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, UserPlus, Building2 } from 'lucide-react';
import { employeeStyles } from '../../styles';

const CreateHRAdmin = ({ organizations, onCreateHRAdmin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeLimit: '',
    organizationId: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleCreateHRAdmin = async () => {
    if (!formData.name || !formData.email || !formData.employeeLimit || !formData.organizationId) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (onCreateHRAdmin) {
        await onCreateHRAdmin({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          organizationId: Number(formData.organizationId),
        });

        setFormData({ name: '', email: '', password: '', employeeLimit: '', organizationId: '' });
        return;
      }

      toast.error('No create handler configured');
    } catch (error) {
      console.error('Create HR admin failed:', error);
      toast.error(error.message || 'Failed to create HR admin');
    }
  };



  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Create HR Admin</h1>
      <div className={employeeStyles.requests.form}>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter HR admin full name"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Email Address *</label>
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
          <label className={employeeStyles.requests.label}>Password *</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter or generate password"
              className={`${employeeStyles.requests.input} flex-1`}
            />
            <button
              type="button"
              onClick={generateRandomPassword}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>

        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Organization *</label>
          <select
            name="organizationId"
            value={formData.organizationId}
            onChange={handleChange}
            className={employeeStyles.requests.select}
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.companyName}
              </option>
            ))}
          </select>
          {organizations.length === 0 && (
            <p className="text-xs text-amber-700 mt-2">
              No organizations in the list yet. Accept an enquiry in Enquiry Management to create a real company record first.
            </p>
          )}
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Employee Limit *</label>
          <input
            type="number"
            name="employeeLimit"
            value={formData.employeeLimit}
            onChange={handleChange}
            placeholder="Maximum number of employees allowed"
            className={employeeStyles.requests.input}
          />
          <p className="text-xs text-gray-500 mt-1">
            This organization can add up to this many employees
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleCreateHRAdmin}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <UserPlus size={18} />
            Create HR Admin
          </button>
          
        </div>

        {/* Info Box */}
        
      </div>
    </div>
  );
};

export default CreateHRAdmin;