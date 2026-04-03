// admin/LocationRestriction.jsx
import React, { useState, useEffect } from 'react';
import { MapPinIcon, Save, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';

const isValidLat = (n) => Number.isFinite(n) && n >= -90 && n <= 90;
const isValidLng = (n) => Number.isFinite(n) && n >= -180 && n <= 180;

const LocationRestriction = ({ settings, setSettings }) => {
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    radius: '',
  });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setLocation({
      latitude: settings?.locationLat != null && settings.locationLat !== '' ? String(settings.locationLat) : '',
      longitude: settings?.locationLng != null && settings.locationLng !== '' ? String(settings.locationLng) : '',
      radius: settings?.locationRadius != null && settings.locationRadius !== '' ? String(settings.locationRadius) : '',
    });
  }, [settings]);

  const fillCurrentPosition = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        toast.success('Filled latitude and longitude from this device');
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || 'Could not read your location. Allow location permission and use HTTPS or localhost.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSave = async () => {
    const latStr = String(location.latitude).trim();
    const lngStr = String(location.longitude).trim();
    const radStr = String(location.radius).trim();

    if (!latStr || !lngStr || !radStr) {
      toast.error('Enter latitude, longitude, and radius (meters), or clear all to disable geofence.');
      return;
    }

    const lat = Number(latStr);
    const lng = Number(lngStr);
    const radius = Number(radStr);

    if (!isValidLat(lat) || !isValidLng(lng)) {
      toast.error('Latitude must be -90..90 and longitude -180..180');
      return;
    }
    if (!Number.isFinite(radius) || radius < 10 || radius > 500000) {
      toast.error('Radius must be a number between 10 and 500000 meters');
      return;
    }

    try {
      const data = {
        ...settings,
        locationLat: lat,
        locationLng: lng,
        locationRadius: Math.round(radius),
      };
      if (setSettings) {
        await setSettings(data);
      }
      toast.success('Location restriction saved. Check-in/out will use this geofence.');
    } catch (error) {
      console.error('Location restriction save failed', error);
      toast.error('Failed to save location settings');
    }
  };

  const handleDisableGeofence = async () => {
    try {
      const data = {
        ...settings,
        locationLat: null,
        locationLng: null,
        locationRadius: null,
      };
      setLocation({ latitude: '', longitude: '', radius: '' });
      if (setSettings) {
        await setSettings(data);
      }
      toast.success('Location restriction cleared — check-in allowed without GPS boundary');
    } catch (error) {
      console.error('Clear location failed', error);
      toast.error('Failed to clear location settings');
    }
  };

  const geofenceActive =
    settings?.locationLat != null &&
    settings?.locationLng != null &&
    settings?.locationRadius != null &&
    Number(settings.locationRadius) > 0;

  return (
    <div className={employeeStyles.location.container}>
      <h1 className={employeeStyles.location.title}>Location Restriction</h1>
      <div className={employeeStyles.location.card}>
        <div
          className={`mb-4 px-3 py-2 rounded-lg text-sm ${geofenceActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}
        >
          {geofenceActive ? (
            <>
              <strong>Geofence is ON.</strong> Employees must check in/out within {settings.locationRadius} m of the office
              point ({Number(settings.locationLat).toFixed(5)}, {Number(settings.locationLng).toFixed(5)}).
            </>
          ) : (
            <>
              <strong>Geofence is OFF.</strong> Set coordinates and radius below, then save, to require on-site check-in/out.
            </>
          )}
        </div>

        <div className={employeeStyles.location.formGroup}>
          <label className={employeeStyles.location.label}>Office Latitude</label>
          <input
            type="text"
            inputMode="decimal"
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
            inputMode="decimal"
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
            min={10}
            placeholder="e.g., 150"
            value={location.radius}
            onChange={(e) => setLocation({ ...location, radius: e.target.value })}
            className={employeeStyles.location.input}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={fillCurrentPosition}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
          >
            <LocateFixed size={18} />
            {locating ? 'Getting location…' : 'Use this device’s location'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleSave} className={employeeStyles.requests.submitBtn}>
            <Save size={18} className="inline mr-2" />
            Save Location Settings
          </button>
          <button
            type="button"
            onClick={handleDisableGeofence}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Disable geofence
          </button>
        </div>


      </div>
    </div>
  );
};

export default LocationRestriction;
