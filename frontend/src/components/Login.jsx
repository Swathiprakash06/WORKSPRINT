import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enquiryStyles } from '../styles';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
console.log('🌐 API_BASE_URL:', API_BASE_URL);
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!formData.password.trim()) {
      toast.error('Please enter your password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const loginUrl = `${API_BASE_URL}/api/v1/auth/login`;
    const requestBody = {
      email: formData.email,
      password: formData.password
    };
    
    console.log('📤 Sending login request:', { url: loginUrl, email: requestBody.email });
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    const data = await response.json();
    
    console.log('📦 Response data:', { hasToken: !!data.accessToken, role: data.role });

    if (!response.ok) {
      toast.error(data.message || 'Login failed');
      return;
    }

    // ✅ Store token, refresh token & role
    sessionStorage.setItem('token', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('role', data.role);
    sessionStorage.setItem('userEmail', formData.email);

    toast.success('Login successful! Redirecting...');

    // ✅ Role-based navigation
    setTimeout(() => {
      if (data.role === 'employee') {
        navigate('/employee');
      } else if (data.role === 'hrAdmin') {
        navigate('/hradmin');
      } else if (data.role === 'superAdmin') {
        navigate('/super-admin');
      } else {
        toast.error('Invalid role');
      }
    }, 500);

  } catch (err) {
    toast.error('Server error. Please try again.');
    console.error('Login error:', err);
  } finally {
    setIsLoading(false);
  }
};

  // Load remembered email on component mount
  React.useEffect(() => {
    const role = sessionStorage.getItem('role');

    if (role === 'employee') navigate('/employee');
    if (role === 'hrAdmin') navigate('/hradmin');
    if (role === 'superAdmin') navigate('/super-admin');
    
  }, [navigate]);


  return (
    <>
      {/* <Navbar /> Add Navbar component */}
      <div className={enquiryStyles.section}>
        <div className={enquiryStyles.container}>
          <div className={enquiryStyles.header}>
            <h1 className={enquiryStyles.title}>
              Welcome Back to{' '}
              <span className={enquiryStyles.titleHighlight}>
                Worksprint
              </span>
            </h1>
            <p className={enquiryStyles.subtitle}>
              Sign in to access your account and manage your workspace
            </p>
          </div>

          <div className={enquiryStyles.formCard}>
            <div className={enquiryStyles.formWrapper}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                    <svg className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                {/* Email Field */}
                <div className={enquiryStyles.formRow}>
                  <div className={enquiryStyles.formGroupFull}>
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
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className={enquiryStyles.formRow}>
                  <div className={enquiryStyles.formGroupFull}>
                    <label className={enquiryStyles.label}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={enquiryStyles.input}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7C3AED] hover:text-[#9B4DFF] transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className={enquiryStyles.formRow}>
                  <div className={enquiryStyles.formGroupFull}>
                    <div className="flex items-center justify-end">
                      <Link to="/forgot-password" className="text-sm text-[#7C3AED] hover:text-[#9B4DFF] transition-colors">
                        Forgot password?
                      </Link>
                    </div>
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
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
                
                <div className="mt-6 text-center">
                  <span className="text-sm text-[#A0AEC0]">Don't have an account? </span>
                  <Link to="/enquiry" className="text-sm text-[#7C3AED] hover:text-[#9B4DFF] font-medium transition-colors">
                    Enquiry now
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer /> {/* Add Footer component */}
    </>
  );
};

export default Login;