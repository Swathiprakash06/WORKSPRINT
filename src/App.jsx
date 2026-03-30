// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ComparisonSection from "./components/ComparisonSection .jsx";
import Features from "./components/Features.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Modules from "./components/Modules.jsx";
import Navbar from "./components/Navbar";
import PayrollFlow from "./components/PayrollFlow.jsx";
import ScaleSection from "./components/ScaleSection.jsx";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Enquiry from './components/Enquiry.jsx';
import { Toaster } from 'react-hot-toast';
import EmployeePanel from './pages/employee_panel/EmployeePanel.jsx';
import HrAdminPanel from './pages/hradmin_panel/HrAdminPanel.jsx';
import SuperAdminPanel from './pages/super_admin_panel/SuperAdminPanel.jsx'; // Import Super Admin Panel

const HomePage = () => {
  return (
    <>
      <Hero />
      <Features />
      <Modules />
      <PayrollFlow />
      <ScaleSection />
      <ComparisonSection />
      <Footer />
    </>
  );
};


const Layout = ({ children }) => {
  const location = useLocation();
  const isHrAdminRoute = location.pathname.startsWith('/hradmin');
  const isEmployeeRoute = location.pathname.startsWith('/employee');
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');
  
  return (
    <>
      {!isHrAdminRoute && !isEmployeeRoute && !isSuperAdminRoute && <Navbar />}
      {children}
    </>
  );
};

export default function App() {
  return (
    <Router>
      {/* Add Toaster for toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public routes with navbar */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/enquiry" element={<Layout><Enquiry /></Layout>} />
        
        <Route path="/employee/*" element={<EmployeePanel />} />
        
        <Route path="/hradmin/*" element={<HrAdminPanel />} />
        
        <Route path="/super-admin/*" element={<SuperAdminPanel />} />
      </Routes>
    </Router>
  );
}