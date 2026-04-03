// src/components/Hero.jsx
import React from 'react';
import { heroStyles } from '../styles';

const Hero = () => {
  return (
    <section className={heroStyles.section}>
      <div className={heroStyles.container}>
        <div className={heroStyles.grid}>
          <div>
            <div className={heroStyles.badge}>
              <span>✨ AI-Powered HRMS Platform</span>
            </div>
            <h1 className={heroStyles.title}>
              WORKSPRINT — <br />
              A Smarter, <span className={heroStyles.highlight}>Compliant & Scalable</span> HRMS
            </h1>
            <p className={heroStyles.description}>
              One Platform. Complete HR & Payroll Control.
            </p>
            <p className={heroStyles.subtext}>
              WorkSprint is a modern, API-driven HRMS and Payroll platform designed for growing organizations 
              that want accuracy, compliance, and speed—without complexity. From employee onboarding to 
              payroll processing and performance appraisals, WorkSprint brings everything together in one 
              secure, scalable system.
            </p>
            <div className={heroStyles.buttonGroup}>
              <button className={heroStyles.ctaBtn}>
                Schedule Demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className={heroStyles.trustBadge}>
                <svg className={heroStyles.trustIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Trusted by 500+ growing companies</span>
              </div>
            </div>
          </div>

          <div className={heroStyles.imageContainer}>
            <div className={heroStyles.imageWrapper}>
              <img 
                src="https://i.pinimg.com/1200x/97/2e/62/972e6270e6324e7931d44182bf62f6eb.jpg" 
                alt="HR-Pro Dashboard Preview"
                className={heroStyles.image}
              />
            </div>
            <div className={heroStyles.floatingCard}>
              <div className={heroStyles.floatingCardContent}>
                <div className={heroStyles.liveDot}></div>
                <span className={heroStyles.liveText}>Live Demo Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;