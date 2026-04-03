import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

const ROLE_ENDPOINT = {
  employee: '/api/v1/employee/profile',
  hrAdmin: '/api/v1/hr-admin/profile',
  superAdmin: '/api/v1/super-admin/profile',
};

const ProfileSettings = ({ role }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const endpoint = ROLE_ENDPOINT[role];
  const isEmployee = role === 'employee';
  const isSuperAdmin = role === 'superAdmin';
  const canEditProfile = !isEmployee;
  const canChangePassword = true;

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiGet(endpoint);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body?.message || 'Unable to fetch profile');
        err.status = res.status;
        throw err;
      }
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Profile load error:', error);
      const status = error?.status;
      if (status === 401 || status === 403 || status === 404) {
        sessionStorage.clear();
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        localStorage.removeItem('rememberMe');
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      toast.error(error.message || 'Could not load profile settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [endpoint]);

  const validateEmail = (email) => {
    if (email === profile.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{10,}$/.test(String(phone || '').replace(/\D/g, ''));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    const newErrors = {};
    if (!validateEmail(profile.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!isSuperAdmin && profile.phone && !validatePhone(profile.phone)) {
      newErrors.phone = 'Phone must contain at least 10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
      };
      if (!isSuperAdmin) {
        payload.phone = profile.phone;
      }

      const res = await apiPut(endpoint, payload);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Unable to update profile');
      }
      const updated = await res.json();
      setProfile(updated);
      setProfileErrors({});
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error(error.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }
    if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    try {
      const res = await apiPost(`${endpoint}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Password change failed');
      }

      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Could not change password');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-red-600">Profile not found</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Account + profile (left) */}
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">
                  {role === 'hrAdmin' ? 'HR Admin' : role === 'superAdmin' ? 'Super Admin' : 'Employee'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
          </div>

          {canEditProfile && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition ${
                      profileErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Email Address"
                  />
                  {profileErrors.email && <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>}
                </div>

                {!isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition ${
                        profileErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Phone Number"
                    />
                    {profileErrors.phone && <p className="text-red-500 text-sm mt-1">{profileErrors.phone}</p>}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#9B4DFF] transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {isEmployee && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Details (Read-only)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Your profile is managed by HR. Contact them to change these details.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Change password (right, aligned with account section) */}
        {canChangePassword && (
          <div className="lg:sticky lg:top-4 space-y-4 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition ${
                        passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Toggle password visibility"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition ${
                        passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Toggle password visibility"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition ${
                        passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label="Toggle password visibility"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#9B4DFF] transition-colors font-medium"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
