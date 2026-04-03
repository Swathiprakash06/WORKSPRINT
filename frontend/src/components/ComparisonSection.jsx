import React from 'react';
import { comparisonStyles } from '../styles';

const ComparisonSection = () => {
  const proFeatures = [
    'Unified HR, payroll & compliance platform',
    'Built for operational efficiency',
    'API-first architecture',
    'Automation-driven workflows',
    'Compliance-ready systems'
  ];

  // Traditional tools issues
  const traditionalIssues = [
    'Fragmented systems with manual processes',
    'Compliance risks and errors',
    'Poor visibility across organization',
    'Lack of integration capabilities',
    'Manual data entry and reconciliation'
  ];

  return (
    <section className={comparisonStyles.section}>
      <div className={comparisonStyles.container}>
        <div className={comparisonStyles.header}>
          <div className={comparisonStyles.badge}>
            Platform Comparison
          </div>
          <h2 className={comparisonStyles.title}>
            Modern vs Traditional{' '}
            <span className={comparisonStyles.titleHighlight}>
              HR Operations
            </span>
          </h2>
          <p className={comparisonStyles.description}>
            See how WorkSprint transforms your HR operations compared to traditional tools
          </p>
        </div>
        <div className={comparisonStyles.comparisonGrid}>
          <div className={comparisonStyles.proCard}>
            <div className={comparisonStyles.proCardGradient}></div>
            <div className={comparisonStyles.proBadge}>
              WorkSprint
            </div>
            <h3 className={comparisonStyles.proTitle}>
              Unified HR, Payroll & Compliance
            </h3>
            <p className={comparisonStyles.proDescription}>
              Built for operational efficiency with automation, API-first design, and compliance-ready workflows.
            </p>
            <div className={comparisonStyles.proFeatureList}>
              {proFeatures.map((feature, index) => (
                <div key={index} className={comparisonStyles.proFeatureItem}>
                  <svg className={comparisonStyles.proFeatureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={comparisonStyles.proFeatureText}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traditional Tools Card */}
          <div className={comparisonStyles.traditionalCard}>
            <div className={comparisonStyles.traditionalBadge}>
              Traditional Tools
            </div>
            <h3 className={comparisonStyles.traditionalTitle}>
              Fragmented Systems
            </h3>
            <p className={comparisonStyles.traditionalDescription}>
              Manual processes, compliance risks, and poor visibility across disconnected platforms.
            </p>
            <div className={comparisonStyles.traditionalFeatureList}>
              {traditionalIssues.map((issue, index) => (
                <div key={index} className={comparisonStyles.traditionalFeatureItem}>
                  <svg className={comparisonStyles.traditionalFeatureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className={comparisonStyles.traditionalFeatureText}>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Differentiator */}
        <div className={comparisonStyles.highlightSection}>
          <p className={comparisonStyles.highlightText}>
            Built for modern enterprises with automation, API-first design, and compliance-ready workflows.
          </p>
          <div className={comparisonStyles.highlightFeature}>
            <svg className={comparisonStyles.highlightIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={comparisonStyles.highlightLabel}>Enterprise-grade reliability</span>
          </div>
        </div>

        {/* CTA Section */}
        <div className={comparisonStyles.ctaSection}>
          <h3 className={comparisonStyles.ctaTitle}>
            Get Started with WorkSprint
          </h3>
          <p className={comparisonStyles.ctaDescription}>
            Simplify . Automate Payroll. Stay Compliant.
          </p>
          <div className={comparisonStyles.buttonGroup}>
            <button className={comparisonStyles.primaryBtn}>
              Book a Demo
            </button>
            <button className={comparisonStyles.secondaryBtn}>
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={comparisonStyles.footer}>
          <p className={comparisonStyles.footerText}>
            WorkSprint — powering modern HR operations, one organization at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;