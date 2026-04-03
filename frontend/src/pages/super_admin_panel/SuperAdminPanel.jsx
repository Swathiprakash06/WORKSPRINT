// pages/super_admin_panel/SuperAdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiGet, apiPost, logoutApi } from '../../services/api';
import SuperAdminLayout from './SuperAdminLayout';
import Dashboard from './Dashboard';
import EnquiryManagement from './EnquiryManagement';
import OrganizationList from './OrganizationList';
import CreateHRAdmin from './CreateHRAdmin';
import ProfileSettings from '../../components/ProfileSettings';
import LogoutConfirmation from '../../components/LogoutConfirmation';
import { isOrganizationEligibleForHRAdmin } from '../../utils/organizationFilters';

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      if (!token || role !== 'superAdmin') throw new Error('Unauthorized');

      const [enquiriesRes, orgsRes] = await Promise.all([
        apiGet('/api/v1/super-admin/enquiries'),
        apiGet('/api/v1/super-admin/organizations'),
      ]);

      if (enquiriesRes && enquiriesRes.ok) setEnquiries(await enquiriesRes.json());
      if (orgsRes && orgsRes.ok) setOrganizations(await orgsRes.json());
    } catch (error) {
      console.error('SuperAdmin loadData error:', error);
      if (error.message === 'Unauthorized') {
        sessionStorage.clear();
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAcceptEnquiry = async (id) => {
    try {
      const res = await apiPost(`/api/v1/super-admin/enquiries/${id}/accept`);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to accept enquiry');
      const updated = await res.json();
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'accepted' } : e)));
      if (updated.organization) {
        setOrganizations((prev) => [...prev, updated.organization]);
      }
      toast.success('Enquiry accepted and organization added');
    } catch (error) {
      console.error('Accept enquiry failed:', error);
      toast.error(error.message || 'Failed to accept enquiry');
    }
  };

  const handleRejectEnquiry = async (id) => {
    try {
      const res = await apiPost(`/api/v1/super-admin/enquiries/${id}/reject`);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to reject enquiry');
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'rejected' } : e)));
      toast.success('Enquiry rejected');
    } catch (error) {
      console.error('Reject enquiry failed:', error);
      toast.error(error.message || 'Failed to reject enquiry');
    }
  };

  const handleToggleOrganizationStatus = async (id) => {
    try {
      const res = await apiPost(`/api/v1/super-admin/organizations/${id}/suspend`);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to toggle status');
      const updatedOrg = await res.json();
      setOrganizations((prev) => prev.map((org) => (org.id === id ? updatedOrg : org)));
      toast.success('Organization status updated');
    } catch (error) {
      console.error('Toggle organization status error:', error);
      toast.error(error.message || 'Failed to update organization');
    }
  };

  const handleCreateHRAdmin = async (payload) => {
    try {
      const res = await apiPost('/api/v1/super-admin/hr-admins', payload);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create HR admin');
      const created = await res.json();
      toast.success(`HR Admin created: ${created.email}`);
      await loadData();
    } catch (error) {
      console.error('Create HR admin failed:', error);
      toast.error(error.message || 'Failed to create HR admin');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.warn('Logout API failed:', error);
    }

    sessionStorage.clear();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('rememberMe');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <LogoutConfirmation 
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
      <SuperAdminLayout onLogout={() => setShowLogoutConfirm(true)} superAdminName="Super Admin">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard enquiries={enquiries} organizations={organizations} />} />
        <Route path="enquiry-management" element={<EnquiryManagement enquiries={enquiries} setEnquiries={setEnquiries} onAccept={handleAcceptEnquiry} onReject={handleRejectEnquiry} />} />
        <Route path="organization-list" element={<OrganizationList organizations={organizations} setOrganizations={setOrganizations} onToggleStatus={handleToggleOrganizationStatus} />} />
        <Route
          path="create-hr-admin"
          element={
            <CreateHRAdmin
              organizations={organizations.filter(isOrganizationEligibleForHRAdmin)}
              onCreateHRAdmin={handleCreateHRAdmin}
            />
          }
        />
        <Route path="profile" element={<ProfileSettings role="superAdmin" />} />
      </Routes>
    </SuperAdminLayout>
    </>
  );
};

export default SuperAdminPanel;
