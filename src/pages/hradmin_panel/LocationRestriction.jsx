// admin/LocationRestriction.jsx
import React, { useState } from 'react';
import { MapPinIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';
const LocationRestriction = () => {
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    radius: '',
  });

  const handleSave = () => {
    // This page is left empty as per requirement - just show success message
    toast.success('Location restriction settings saved (demo)');
  };

  return (
    <div className={employeeStyles.location.container}>
      <h1 className={employeeStyles.location.title}>Location Restriction</h1>
      <div className={employeeStyles.location.card}>
        <div className={employeeStyles.location.formGroup}>
          <label className={employeeStyles.location.label}>Office Latitude</label>
          <input
            type="text"
            placeholder="e.g., 28.6139"
            value={location.latitude}
            onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
            className={employeeStyles.location.input}
          />
        </div>
        
        <div className={employeeStyles.location.formGroup}>
          <label className={employeeStyles.location.label}>Office Longitude</label>
          <input
            type="text"
            placeholder="e.g., 77.2090"
            value={location.longitude}
            onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
            className={employeeStyles.location.input}
          />
        </div>
        
        <div className={employeeStyles.location.formGroup}>
          <label className={employeeStyles.location.label}>Radius (meters)</label>
          <input
            type="number"
            placeholder="e.g., 100"
            value={location.radius}
            onChange={(e) => setLocation({ ...location, radius: e.target.value })}
            className={employeeStyles.location.input}
          />
        </div>
        
        <button onClick={handleSave} className={employeeStyles.requests.submitBtn}>
          <Save size={18} className="inline mr-2" />
          Save Location Settings
        </button>
        
        <div className={employeeStyles.location.infoBox}>
          <MapPinIcon size={20} className="inline mr-2 text-blue-600" />
          <p className={employeeStyles.location.infoText}>
            👉 Only allow login/check-in inside this area. Employees will only be able to check in when within the specified radius of the office location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationRestriction;