// src/components/Footer.jsx
import React from 'react';
import { footerStyles } from '../styles';

const Footer = () => {
  // Product links
  const productLinks = [
    { name: 'Payroll', href: '#' },
    { name: 'Employee Management', href: '#' },
    { name: 'Leave & Attendance', href: '#' },
    { name: 'Appraisal & Performance', href: '#' }
  ];

  // Resources links
  const resourceLinks = [
    { name: 'Blog', href: '#' },
    { name: 'Guides', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'FAQ', href: '#' }
  ];

  return (
    <footer className={footerStyles.section}>
      <div className={footerStyles.container}>
        <div className={footerStyles.grid}>
          <div className={footerStyles.logoColumn}>
            <div className={footerStyles.logo}>
              WORKSPRINT
            </div>
            <p className={footerStyles.tagline}>
              Powering modern HR operations with automation, compliance, and scalable workflows.
            </p>
          </div>

          {/* Product Column */}
          <div className={footerStyles.productColumn}>
            <h3 className={footerStyles.columnTitle}>
              Product
            </h3>
            <div className={footerStyles.navLinks}>
              {productLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className={footerStyles.navLink}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div className={footerStyles.resourcesColumn}>
            <h3 className={footerStyles.columnTitle}>
              Resources
            </h3>
            <div className={footerStyles.navLinks}>
              {resourceLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className={footerStyles.navLink}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Column */}
          <div className={footerStyles.newsletterColumn}>
            <h3 className={footerStyles.columnTitle}>
              Stay Connected
            </h3>
            <p className={footerStyles.newsletterText}>
              Subscribe to our newsletter for updates and insights.
            </p>
            <div className={footerStyles.subscribeForm}>
              <input 
                type="email" 
                placeholder="Your email" 
                className={footerStyles.emailInput}
              />
              <button className={footerStyles.subscribeBtn}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={footerStyles.footerBottom}>
          <p className={footerStyles.copyright}>
            © {new Date().getFullYear()} WorkSprint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;