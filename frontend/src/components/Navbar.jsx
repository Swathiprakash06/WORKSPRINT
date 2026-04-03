
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { navbarStyles } from '../styles';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav className={navbarStyles.nav(isScrolled)}>
      <div className={navbarStyles.container}>
        <div className={navbarStyles.inner}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className={navbarStyles.logo}>
                WORKSPRINT
              </Link>
            </div>
          </div>

          <div className={navbarStyles.desktopNav}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={navbarStyles.navLink}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            <button
              onClick={handleLoginClick}
              className={navbarStyles.loginBtn}
            >
              Login
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={navbarStyles.mobileMenuBtn}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={navbarStyles.mobileMenu}>
          <div className={navbarStyles.mobileMenuContainer}>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={navbarStyles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLoginClick();
                setIsMobileMenuOpen(false);
              }}
              className={navbarStyles.mobileLoginBtn}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;