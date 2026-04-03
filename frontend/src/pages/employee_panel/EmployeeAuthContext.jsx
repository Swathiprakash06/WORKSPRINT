import React, { createContext, useState } from 'react';

const EmployeeAuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@worksprint.com',
    role: 'employee'
  });

  const login = (email, password) => {
    // Implement login logic
    console.log('Login:', email, password);
    // Add actual authentication logic here
    if (email === 'john.doe@worksprint.com' && password === 'password') {
      return true;
    }
    return false;
  };

  const logout = () => {
    // Implement logout logic
    console.log('Logout');
    setEmployee(null);
  };

  return (
    <EmployeeAuthContext.Provider value={{ employee, login, logout, setEmployee }}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};