import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';

const ApplyRequest = ({ addRequest }) => {
  const [formData, setFormData] = useState({
    type: 'Leave',
    date: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.reason) {
      addRequest({
        id: Date.now(),
        date: formData.date,
        type: formData.type,
        reason: formData.reason,
        status: 'pending'
      });
      toast.success('Request submitted successfully!');
      setFormData({ type: 'Leave', date: '', reason: '' });
    } else {
      toast.error('Please fill all fields');
    }
  };

  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Apply Request</h1>
      <form onSubmit={handleSubmit} className={employeeStyles.requests.form}>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Request Type</label>
          <select 
            value={formData.type} 
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={employeeStyles.requests.select}
          >
            <option>Leave</option>
            <option>Late Regularization</option>
          </select>
        </div>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Date</label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
            required 
            className={employeeStyles.requests.input}
          />
        </div>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Reason</label>
          <textarea 
            rows="4" 
            value={formData.reason} 
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })} 
            required
            placeholder="Please provide detailed reason for your request..."
            className={employeeStyles.requests.textarea}
          ></textarea>
        </div>
        <button type="submit" className={employeeStyles.requests.submitBtn}>
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default ApplyRequest;