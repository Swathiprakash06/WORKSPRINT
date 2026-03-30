// pages/super_admin_panel/CreateHRAdmin.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, UserPlus, Building2 } from 'lucide-react';
import { employeeStyles } from '../../styles';

const CreateHRAdmin = ({ organizations, setOrganizations }) => {
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

  const handleCreateHRAdmin = () => {
    if (!formData.name || !formData.email || !formData.employeeLimit || !formData.organizationId) {
      toast.error('Please fill all required fields');
      return;
    }

    const selectedOrg = organizations.find(org => org.id === parseInt(formData.organizationId));
    
    // Create new HR Admin (in real app, this would be an API call)
    const newHRAdmin = {
      id: Date.now(),
      companyName: selectedOrg?.companyName || 'New Organization',
      hrName: formData.name,
      email: formData.email,
      employeeLimit: parseInt(formData.employeeLimit),
      currentEmployees: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Update organizations list or create new if organization doesn't exist
    if (selectedOrg) {
      setOrganizations(organizations.map(org =>
        org.id === selectedOrg.id 
          ? { ...org, hrName: formData.name, email: formData.email, employeeLimit: parseInt(formData.employeeLimit) }
          : org
      ));
    } else {
      setOrganizations([...organizations, newHRAdmin]);
    }

    toast.success(`HR Admin created! Credentials sent to ${formData.email}`);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeLimit: '',
      organizationId: '',
    });
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
            <option value="new">+ Create New Organization</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.companyName}</option>
            ))}
          </select>
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
          <button
            onClick={handleSendCredentials}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#7C3AED] text-[#7C3AED] font-semibold rounded-lg hover:bg-[#7C3AED] hover:text-white transition-all duration-200"
          >
            <Send size={18} />
            Send Credentials via Email
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Building2 size={18} className="inline mr-2 text-blue-600" />
          <p className="text-sm text-blue-800 inline">
            HR Admin will receive login credentials via email and can manage their organization's employees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateHRAdmin;