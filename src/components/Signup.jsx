// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { modalStyles } from '../styles';

// const Signup = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     acceptTerms: false
//   });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     if (!formData.acceptTerms) {
//       setError('Please accept the terms and conditions');
//       return;
//     }

//     if (!formData.name || !formData.email || !formData.password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Add your signup logic here
//       console.log('Signup successful', formData);
      
//       // Redirect to login page after successful signup
//       navigate('/login');
//     } catch (err) {
//       setError('Signup failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={modalStyles.overlay}>
//       <div className={modalStyles.backdrop}></div>
//       <div className={modalStyles.container}>
//         <div className={modalStyles.wrapper}>
//           <div className={modalStyles.header}>
//             <div className={modalStyles.headerContent}>
//               <h2 className={modalStyles.title}>Create Account</h2>
//               <Link to="/" className={modalStyles.closeBtn}>
//                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </Link>
//             </div>
//             <p className={modalStyles.subtitle}>Join Worksprint to get started</p>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className={modalStyles.body}>
//               {error && (
//                 <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
//                   {error}
//                 </div>
//               )}
              
//               <div className={modalStyles.inputGroup}>
//                 <label className={modalStyles.label}>
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className={modalStyles.input}
//                   placeholder="John Doe"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div className={modalStyles.inputGroup}>
//                 <label className={modalStyles.label}>
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className={modalStyles.input}
//                   placeholder="you@example.com"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>
              
//               <div className={modalStyles.inputGroup}>
//                 <label className={modalStyles.label}>
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className={modalStyles.input}
//                   placeholder="••••••••"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>

//               <div className={modalStyles.inputGroup}>
//                 <label className={modalStyles.label}>
//                   Confirm Password
//                 </label>
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className={modalStyles.input}
//                   placeholder="••••••••"
//                   required
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             <div className={modalStyles.footer}>
//               <button 
//                 type="submit" 
//                 className={modalStyles.signInBtn}
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Creating account...' : 'Sign Up'}
//               </button>
              
//               <div className={modalStyles.signUpText}>
//                 <span className="text-sm text-[#A0AEC0]">Already have an account? </span>
//                 <Link to="/login" className={modalStyles.signUpLink}>
//                   Sign in
//                 </Link>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { modalStyles } from '../styles';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Signup successful', formData);
      navigate('/login');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.container}>
        <div className={modalStyles.wrapper}>
          <div className={modalStyles.header}>
            <div className={modalStyles.headerContent}>
              <h2 className={modalStyles.title}>Create Account</h2>
              <Link to="/" className={modalStyles.closeBtn}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
            <p className={modalStyles.subtitle}>Join Worksprint to get started</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={modalStyles.body}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}
              
              {/* First row - Name and Email */}
              <div className={modalStyles.formRow}>
                <div className={modalStyles.inputGroupHalf}>
                  <label className={modalStyles.label}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={modalStyles.input}
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className={modalStyles.inputGroupHalf}>
                  <label className={modalStyles.label}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={modalStyles.input}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Second row - Password and Confirm Password */}
              <div className={modalStyles.formRow}>
                <div className={modalStyles.inputGroupHalf}>
                  <label className={modalStyles.label}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={modalStyles.input}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className={modalStyles.inputGroupHalf}>
                  <label className={modalStyles.label}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={modalStyles.input}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Terms and Conditions - Full width */}
              <div className={modalStyles.formRow}>
                <div className={modalStyles.inputGroupFull}>
                  <label className={modalStyles.checkboxLabel}>
                    <input 
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className={modalStyles.checkbox}
                      disabled={isLoading}
                    />
                    <span className={modalStyles.checkboxText}>
                      I accept the terms and conditions
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className={modalStyles.footer}>
              <button 
                type="submit" 
                className={modalStyles.signInBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
              
              <div className={modalStyles.signUpText}>
                <span className="text-sm text-[#A0AEC0]">Already have an account? </span>
                <Link to="/login" className={modalStyles.signUpLink}>
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;