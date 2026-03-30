import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enquiryStyles } from '../styles';
import Footer from '../components/Footer'; // Import the Footer component

const Enquiry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    employees: '',
    industry:''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!formData.employees.trim()) {
      toast.error('Please enter number of employees');
      return;
    }
    if (!formData.industry.trim()) {
      toast.error('Please enter your company type');
      return;
    }
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newEnquiry = {
        id: Date.now(),
        company: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        employees: formData.employees,
        industry:formData.industry,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };

      const existingEnquiries = JSON.parse(localStorage.getItem('enquiries') || '[]');
      const updatedEnquiries = [newEnquiry, ...existingEnquiries];
      localStorage.setItem('enquiries', JSON.stringify(updatedEnquiries));
      
      console.log('Enquiry submitted:', newEnquiry);
      toast.success('Thank you for your enquiry! We will contact you shortly.');
      
      setFormData({
        companyName: '',
        email: '',
        phone: '',
        employees: '',
        industry:''
      });
      
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={enquiryStyles.section}>
        <div className={enquiryStyles.container}>
          <div className={enquiryStyles.header}>
            <h1 className={enquiryStyles.title}>
              Get Started with{' '}
              <span className={enquiryStyles.titleHighlight}>
                Worksprint
              </span>
            </h1>
            <p className={enquiryStyles.subtitle}>
              Tell us about your company and we'll help you find the perfect solution
            </p>
          </div>

          <div className={enquiryStyles.formCard}>
            <div className={enquiryStyles.formWrapper}>
              <form onSubmit={handleSubmit}>
                {/* First row - Company Name and Email */}
                <div className={enquiryStyles.formRow}>
                  <div className={enquiryStyles.formGroup}>
                    <label className={enquiryStyles.label}>
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={enquiryStyles.input}
                      placeholder="Enter your company name"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className={enquiryStyles.formGroup}>
                    <label className={enquiryStyles.label}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={enquiryStyles.input}
                      placeholder="you@company.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Second row - Phone Number and Employees */}
                <div className={enquiryStyles.formRow}>
                  <div className={enquiryStyles.formGroup}>
                    <label className={enquiryStyles.label}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={enquiryStyles.input}
                      placeholder="+1 (555) 000-0000"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className={enquiryStyles.formGroup}>
                    <label className={enquiryStyles.label}>
                      Number of Employees
                    </label>
                    <input
                      type="text"
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      className={enquiryStyles.input}
                      placeholder="Enter number of employees"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Third row - Industry Type (full width) */}
                <div className={enquiryStyles.formRow}>
                  <div className={enquiryStyles.formGroupFull}>
                    <label className={enquiryStyles.label}>
                      Industry Type
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className={enquiryStyles.input}
                      placeholder="Ex: IT Department, Healthcare, Manufacturing"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Button row */}
                <div className={enquiryStyles.buttonRow}>
                  <button 
                    type="submit" 
                    className={enquiryStyles.submitBtn}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Sign Up Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer /> {/* Add Footer component here */}
    </>
  );
};

export default Enquiry;