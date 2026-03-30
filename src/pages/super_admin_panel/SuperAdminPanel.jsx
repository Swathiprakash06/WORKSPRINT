// pages/super_admin_panel/SuperAdminPanel.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from './SuperAdminLayout';
import Dashboard from './Dashboard';
import EnquiryManagement from './EnquiryManagement';
import OrganizationList from './OrganizationList';
import CreateHRAdmin from './CreateHRAdmin';

const SuperAdminPanel = () => {
  const [enquiries, setEnquiries] = useState([
    {
      id: 1,
      companyName: 'TechCorp Solutions',
      hrName: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1 234 567 8901',
      employeeSize: 150,
      status: 'pending',
      submittedDate: '2026-03-28'
    },
    {
      id: 2,
      companyName: 'InnovateLabs',
      hrName: 'Michael Chen',
      email: 'michael@innovatelabs.com',
      phone: '+1 234 567 8902',
      employeeSize: 75,
      status: 'accepted',
      submittedDate: '2026-03-25'
    },
    {
      id: 3,
      companyName: 'DigitalDynamics',
      hrName: 'Emily Rodriguez',
      email: 'emily@digitaldynamics.com',
      phone: '+1 234 567 8903',
      employeeSize: 200,
      status: 'pending',
      submittedDate: '2026-03-29'
    },
    {
      id: 4,
      companyName: 'CloudNine Systems',
      hrName: 'David Kim',
      email: 'david@cloudnine.com',
      phone: '+1 234 567 8904',
      employeeSize: 50,
      status: 'rejected',
      submittedDate: '2026-03-20'
    },
  ]);

  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      companyName: 'TechCorp Solutions',
      hrName: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      employeeLimit: 150,
      currentEmployees: 45,
      status: 'active',
      createdAt: '2026-03-28'
    },
    {
      id: 2,
      companyName: 'InnovateLabs',
      hrName: 'Michael Chen',
      email: 'michael@innovatelabs.com',
      employeeLimit: 75,
      currentEmployees: 72,
      status: 'active',
      createdAt: '2026-03-25'
    },
  ]);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <SuperAdminLayout onLogout={handleLogout} superAdminName="Super Admin">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard enquiries={enquiries} organizations={organizations} />} />
        <Route path="enquiry-management" element={<EnquiryManagement enquiries={enquiries} setEnquiries={setEnquiries} />} />
        <Route path="organization-list" element={<OrganizationList organizations={organizations} setOrganizations={setOrganizations} />} />
        <Route path="create-hr-admin" element={<CreateHRAdmin organizations={organizations} setOrganizations={setOrganizations} />} />
      </Routes>
    </SuperAdminLayout>
  );
};

export default SuperAdminPanel;