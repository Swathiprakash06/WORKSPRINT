// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { modalStyles } from '../styles';

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     rememberMe: false
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
//     setIsLoading(true);
    
//     // Add your authentication logic here
//     // For demo purposes, we'll simulate a login
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       if (formData.email && formData.password) {
//         // Store auth token if needed
//         if (formData.rememberMe) {
//           localStorage.setItem('userEmail', formData.email);
//         }
        
//         // Successful login - redirect to home page
//         console.log('Login successful', formData);
//         navigate('/'); // Redirect to home page
//       } else {
//         setError('Please fill in all fields');
//       }
//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={modalStyles.overlay}>
//       <div className={modalStyles.container}>
//         <div className={modalStyles.wrapper}>
//           <div className={modalStyles.header}>
//             <div className={modalStyles.headerContent}>
//               <h2 className={modalStyles.title}>Welcome Back</h2>
//               <Link to="/" className={modalStyles.closeBtn}>
//                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </Link>
//             </div>
//             <p className={modalStyles.subtitle}>Sign in to access your account</p>
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

//               <div className={modalStyles.checkboxGroup}>
//                 <label className={modalStyles.checkboxLabel}>
//                   <input 
//                     type="checkbox" 
//                     name="rememberMe"
//                     checked={formData.rememberMe}
//                     onChange={handleChange}
//                     className={modalStyles.checkbox}
//                     disabled={isLoading}
//                   />
//                   <span className={modalStyles.checkboxText}>Remember me</span>
//                 </label>
//                 <Link to="/forgot-password" className={modalStyles.forgotPassword}>
//                   Forgot password?
//                 </Link>
//               </div>
//             </div>

//             <div className={modalStyles.footer}>
//               <button 
//                 type="submit" 
//                 className={modalStyles.signInBtn}
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Signing in...' : 'Sign In'}
//               </button>
              
//               <div className={modalStyles.signUpText}>
//                 <span className="text-sm text-[#A0AEC0]">Don't have an account? </span>
//                 <Link to="/signup" className={modalStyles.signUpLink}>
//                   Sign up free
//                 </Link>
//               </div>

              
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { modalStyles } from '../styles';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formData.email && formData.password) {
        if (formData.rememberMe) {
          localStorage.setItem('userEmail', formData.email);
        }
        
        console.log('Login successful', formData);
        navigate('/');
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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
              <h2 className={modalStyles.title}>Welcome Back</h2>
              <Link to="/" className={modalStyles.closeBtn}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>
            <p className={modalStyles.subtitle}>Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={modalStyles.body}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                  {error}
                </div>
              )}
              
              <div className={modalStyles.inputGroup}>
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
              
              <div className={modalStyles.inputGroup}>
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

              <div className={modalStyles.checkboxGroup}>
                <label className={modalStyles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className={modalStyles.checkbox}
                    disabled={isLoading}
                  />
                  <span className={modalStyles.checkboxText}>Remember me</span>
                </label>
                <Link to="/forgot-password" className={modalStyles.forgotPassword}>
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
              
              <div className={modalStyles.signUpText}>
                <span className="text-sm text-[#A0AEC0]">Don't have an account? </span>
                <Link to="/signup" className={modalStyles.signUpLink}>
                  Sign up free
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;