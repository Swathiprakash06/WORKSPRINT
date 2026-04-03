import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enquiryStyles } from '../styles';
import { modalStyles  } from '../styles';
import Footer from '../components/Footer'; // Import the Footer component
import { apiPost } from '../services/api';

const Enquiry = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    phone: '',
    employeeSize: ''
  });
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

    if (!formData.companyName.trim()) {
      toast.error('Please enter your company name');
      return;
    }

    if (!formData.hrName.trim()) {
      toast.error('Please enter HR name');
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

    if (!formData.employeeSize.trim()) {
      toast.error('Please enter employee size');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        hrName: formData.hrName,
        email: formData.email,
        phone: formData.phone,
        employeeSize: Number(formData.employeeSize),
      };

      const response = await apiPost('/api/v1/auth/enquiry', payload);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not submit enquiry');
      }

      const created = await response.json();
      console.log('Enquiry created:', created);
      toast.success('Thank you for your enquiry! We will contact you shortly.');

      setFormData({
        companyName: '',
        hrName: '',
        email: '',
        phone: '',
        employeeSize: '',
      });
    } catch (err) {
      console.error('Enquiry submission failed:', err);
      toast.error(err.message || 'Something went wrong. Please try again.');
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
                {/* First row - Company Name and HR Name */}
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
                      HR Name
                    </label>
                    <input
                      type="text"
                      name="hrName"
                      value={formData.hrName}
                      onChange={handleChange}
                      className={enquiryStyles.input}
                      placeholder="Enter HR name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Second row - Email Address and Phone Number */}
                <div className={enquiryStyles.formRow}>
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
                      placeholder="+91 9876543210"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Third row - Employee Size (full width) */}
                <div className={enquiryStyles.formRow}>
  <div className={enquiryStyles.formGroup}>
    <label className={enquiryStyles.label}>
      Employee Size
    </label>
    <input
      type="text"
      name="employeeSize"
      value={formData.employeeSize}
      onChange={handleChange}
      className={enquiryStyles.input}
      placeholder="Enter employee size (e.g., 50, 100-200, 500+)"
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
                      'Submiyt Enquiry'
                    )}
                  </button>
                </div>
                <div className={modalStyles.signUpText}>
                  <span className="text-sm text-[#A0AEC0]">Already onboarded? </span>
                  <Link to="/login" className={modalStyles.signUpLink}>
                     Sign in to your WorkSprint account
                  </Link>
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