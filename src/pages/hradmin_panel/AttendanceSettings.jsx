// admin/AttendanceSettings.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { employeeStyles } from '../../styles';
const AttendanceSettings = ({ settings, setSettings }) => {
  const [formData, setFormData] = useState(settings);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(formData);
    toast.success('Attendance settings saved successfully!');
  };

  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Attendance Settings</h1>
      <form onSubmit={handleSubmit} className={employeeStyles.requests.form}>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Office Start Time</label>
          <input
            type="time"
            name="officeStart"
            value={formData.officeStart}
            onChange={handleChange}
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Office End Time</label>
          <input
            type="time"
            name="officeEnd"
            value={formData.officeEnd}
            onChange={handleChange}
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Grace Time (minutes allowed late)</label>
          <input
            type="number"
            name="graceTime"
            value={formData.graceTime}
            onChange={handleChange}
            placeholder="Minutes"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Work Hours (per day)</label>
          <input
            type="number"
            name="workHours"
            value={formData.workHours}
            onChange={handleChange}
            placeholder="Hours"
            step="0.5"
            className={employeeStyles.requests.input}
          />
        </div>
        
        <button type="submit" className={employeeStyles.requests.submitBtn}>
          <Save size={18} className="inline mr-2" />
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default AttendanceSettings;