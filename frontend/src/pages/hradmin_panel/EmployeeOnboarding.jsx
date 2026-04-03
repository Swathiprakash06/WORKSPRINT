// // admin/EmployeeOnboarding.jsx
// import React, { useState } from 'react';
// import toast from 'react-hot-toast';
// import { Send, UserPlus } from 'lucide-react';
// import { employeeStyles } from '../../styles';
// const EmployeeOnboarding = ({ setEmployees, employees }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     role: '',
//     department: '',
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleCreateEmployee = () => {
//     if (!formData.name || !formData.email || !formData.phone) {
//       toast.error('Please fill all required fields');
//       return;
//     }
    
//     const newEmployee = {
//       id: Date.now(),
//       ...formData,
//       status: 'active',
//     };
    
//     setEmployees([...employees, newEmployee]);
//     toast.success('Employee created successfully!');
//     setFormData({ name: '', email: '', phone: '', role: '', department: '' });
//   };

//   const handleSendCredentials = () => {
//     if (!formData.email) {
//       toast.error('Please enter email address');
//       return;
//     }
//     toast.success(`Credentials sent to ${formData.email}`);
//   };

//   return (
//     <div className={employeeStyles.requests.container}>
//       <h1 className={employeeStyles.requests.title}>Employee Onboarding</h1>
//       <div className={employeeStyles.requests.form}>
//         <div className={employeeStyles.requests.formGroup}>
//           <label className={employeeStyles.requests.label}>Name *</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter full name"
//             className={employeeStyles.requests.input}
//           />
//         </div>
        
//         <div className={employeeStyles.requests.formGroup}>
//           <label className={employeeStyles.requests.label}>Email *</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter email address"
//             className={employeeStyles.requests.input}
//           />
//         </div>
        
//         <div className={employeeStyles.requests.formGroup}>
//           <label className={employeeStyles.requests.label}>Phone *</label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             placeholder="Enter phone number"
//             className={employeeStyles.requests.input}
//           />
//         </div>
        
//         <div className={employeeStyles.requests.formGroup}>
//           <label className={employeeStyles.requests.label}>Role (optional)</label>
//           <input
//             type="text"
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             placeholder="e.g., Developer, Designer"
//             className={employeeStyles.requests.input}
//           />
//         </div>
        
//         <div className={employeeStyles.requests.formGroup}>
//           <label className={employeeStyles.requests.label}>Department (optional)</label>
//           <input
//             type="text"
//             name="department"
//             value={formData.department}
//             onChange={handleChange}
//             placeholder="e.g., Engineering, HR"
//             className={employeeStyles.requests.input}
//           />
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-4 mt-6">
//           <button
//             onClick={handleCreateEmployee}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
//           >
//             <UserPlus size={18} />
//             Create Employee
//           </button>
//           <button
//             onClick={handleSendCredentials}
//             className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#7C3AED] text-[#7C3AED] font-semibold rounded-lg hover:bg-[#7C3AED] hover:text-white transition-all duration-200"
//           >
//             <Send size={18} />
//             Send Credentials via Email
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeOnboarding;


// admin/EmployeeOnboarding.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Send, UserPlus, Key, RefreshCw } from 'lucide-react';
import { employeeStyles } from '../../styles';
import { apiPost } from '../../services/api';

const EmployeeOnboarding = ({ setEmployees, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    position: '',
    department: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    toast.success('Password generated!');
  };

  const handleCreateEmployee = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.role?.trim()) {
      toast.error('Please fill all required fields (Name, Email, Phone, Password, Role)');
      return;
    }
    if (!formData.department?.trim() || !formData.position?.trim()) {
      toast.error('Department and Position are required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const response = await apiPost('/api/v1/hr-admin/employees', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role || 'Employee',
        department: formData.department || '',
        position: formData.position || '',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create employee');
      }

      const newEmployee = await response.json();

      // Update local state
      setEmployees([...employees, newEmployee]);

      toast.success(`Employee ${formData.name} created successfully! Credentials sent to their email.`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        position: '',
        department: '',
      });
    } catch (error) {
      console.error('Create employee error:', error);
      toast.error(error.message || 'Failed to create employee');
    }
  };




  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Employee Onboarding</h1>
      <div className={employeeStyles.requests.form}>
        {/* Name Field */}
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className={employeeStyles.requests.input}
          />
        </div>
        
        {/* Email Field */}
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
        
        {/* Phone Field */}
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            className={employeeStyles.requests.input}
          />
        </div>
        
        {/* Password Field with Generate Button */}
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
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap flex items-center gap-2"
            >
              <Key size={16} />
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password will be sent to employee's email after creation
          </p>
        </div>
        
        {/* Role Field - Input Text */}
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Role *</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Enter role (e.g., Admin, Manager, Developer)"
            className={employeeStyles.requests.input}
          />
        </div>

        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Department *</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Enter Department (e.g. Engineering, Sales, Human Resources)"
            className={employeeStyles.requests.input}
          />
        </div>

        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Position *</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Enter Position (e.g. Senior Software Engineer, HR Executive)"
            className={employeeStyles.requests.input}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleCreateEmployee}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <UserPlus size={18} />
            Create Employee
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;