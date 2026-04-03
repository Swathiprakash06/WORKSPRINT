// src/components/ScaleSection.jsx
import React from 'react';
import { scaleStyles } from '../styles';

const ScaleSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4m9-6a2 2 0 11-4 0 2 2 0 014 0zM5 15a2 2 0 104 0 2 2 0 00-4 0z" />
        </svg>
      ),
      title: 'API-first architecture',
      text: 'Powering dashboards, workflows, and integrations.'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'Enterprise-grade customization',
      text: 'For complex HR and payroll policies.'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Multi-organization ready',
      text: 'Designed for multi-tenant environments.'
    }
  ];

  const audience = [
    { 
      title: 'Startups & SMEs', 
      text: 'Looking for structured HR and compliant payroll from day one.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      title: 'Growing Companies', 
      text: 'Managing complex salary structures and expanding teams.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      title: 'Enterprises', 
      text: 'Needing compliance-ready, scalable payroll systems.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      title: 'Automation-Driven Teams', 
      text: 'Seeking API-driven HR workflows and system integrations.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <section className={scaleStyles.section}>
      <div className={scaleStyles.container}>
        <div className={scaleStyles.grid}>
          {/* Left Column - Features */}
          <div className={scaleStyles.leftColumn}>
            <div className={scaleStyles.badge}>
              Built for Scale & Automation
            </div>
            
            <h2 className={scaleStyles.title}>
              WorkSprint is engineered for{' '}
              <span className={scaleStyles.highlight}>
                modern organizations
              </span>
            </h2>
            
            <p className={scaleStyles.description}>
              That demand flexibility, automation, and enterprise-grade reliability.
            </p>
            
            <div className={scaleStyles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={scaleStyles.featureCard}>
                  <div className={scaleStyles.featureIcon}>
                    {feature.icon}
                  </div>
                  <div className={scaleStyles.featureContent}>
                    <h3 className={scaleStyles.featureTitle}>
                      {feature.title}
                    </h3>
                    <p className={scaleStyles.featureText}>
                      {feature.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Who It's For */}
          <div className={scaleStyles.rightColumn}>
            <div className={scaleStyles.gradientOrb}></div>
            <div className={scaleStyles.gradientOrbBottom}></div>
            
            <div className={scaleStyles.card}>
              <h3 className={scaleStyles.cardTitle}>
                Who Is WorkSprint For?
              </h3>
              
              <div className={scaleStyles.whoGrid}>
                {audience.map((item, index) => (
                  <div key={index} className={scaleStyles.whoItem}>
                    <div className={scaleStyles.whoItemIcon}>
                      {item.icon}
                    </div>
                    <h4 className={scaleStyles.whoItemTitle}>
                      {item.title}
                    </h4>
                    <p className={scaleStyles.whoItemText}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScaleSection;