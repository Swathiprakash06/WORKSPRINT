// admin/AttendanceSettings.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { employeeStyles } from '../../styles';

const defaultSettings = {
  officeStart: '09:00',
  officeEnd: '18:00',
  graceTime: 15,
  workHours: 8,
};

const AttendanceSettings = ({ settings, setSettings }) => {
  const [formData, setFormData] = useState(settings || defaultSettings);

  useEffect(() => {
    setFormData(settings || defaultSettings);
  }, [settings]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setSettings(formData);
      toast.success('Attendance settings saved successfully!');
    } catch (error) {
      console.error('Could not save settings:', error);
      toast.error('Failed to save attendance settings');
    }
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
