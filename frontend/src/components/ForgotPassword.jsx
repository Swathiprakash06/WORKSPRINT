import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enquiryStyles } from '../styles';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to send reset link');
        return;
      }

      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error('Server error. Please try again.');
      console.error('Forgot password error:', err);
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
              Reset Your{' '}
              <span className={enquiryStyles.titleHighlight}>
                Password
              </span>
            </h1>
            <p className={enquiryStyles.subtitle}>
              {submitted 
                ? 'Check your email for password reset instructions'
                : 'Enter your email address to receive a password reset link'}
            </p>
          </div>

          <div className={enquiryStyles.formCard}>
            <div className={enquiryStyles.formWrapper}>
              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <div className={enquiryStyles.formRow}>
                    <div className={enquiryStyles.formGroupFull}>
                      <label className={enquiryStyles.label}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={enquiryStyles.input}
                        placeholder="you@company.com"
                        required
                        disabled={isLoading}
                        autoComplete="email"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        We'll send a password reset link to this email address.
                      </p>
                    </div>
                  </div>

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
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>

                  <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-[#7C3AED] hover:text-[#9B4DFF] font-medium transition-colors">
                      ← Back to Login
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    Click the link in the email to reset your password. The link will expire in 24 hours.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSubmitted(false)}
                      className={enquiryStyles.submitBtn}
                    >
                      Try Another Email
                    </button>
                    <Link 
                      to="/login" 
                      className="block w-full px-6 py-3 text-center border-2 border-[#7C3AED] text-[#7C3AED] rounded-lg hover:bg-[#7C3AED]/5 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
