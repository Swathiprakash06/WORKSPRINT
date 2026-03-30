import React from 'react';
import { 
  Shield, 
  UserPlus, 
  FileText, 
  Settings, 
  Clock, 
  Calculator, 
  CreditCard 
} from 'lucide-react';
import { payrollFlowStyles } from '../styles';

const PayrollFlow = () => {
  const steps = [
    {
      number: "STEP 01",
      title: "Organization Sign-Up",
      icon: <Shield className="w-6 h-6" />
    },
    {
      number: "STEP 02",
      title: "Employee Onboarding",
      icon: <UserPlus className="w-6 h-6" />
    },
    {
      number: "STEP 03",
      title: "Policy Definition",
      icon: <FileText className="w-6 h-6" />
    },
    {
      number: "CORE STEP",
      title: "Payroll Configuration",
      icon: <Settings className="w-6 h-6" />,
    },
    {
      number: "STEP 05",
      title: "Attendance Generation",
      icon: <Clock className="w-6 h-6" />
    },
    {
      number: "STEP 06",
      title: "Salary Calculation",
      icon: <Calculator className="w-6 h-6" />
    },
    {
      number: "STEP 07",
      title: "Salary Disbursement",
      icon: <CreditCard className="w-6 h-6" />
    }
  ];

  return (
    <section className={payrollFlowStyles.section}>
      <div className={payrollFlowStyles.container}>
        {/* Header */}
        <div className={payrollFlowStyles.header}>
          <h2 className={payrollFlowStyles.headerTitle}>
            Payroll-First Process Flow
          </h2>
          <p className={payrollFlowStyles.headerSubtitle}>
            A structured, end-to-end workflow built to ensure accuracy, compliance, and zero payroll gaps.
          </p>
        </div>

        {/* Flow Steps */}
        <div className={payrollFlowStyles.flowContainer}>
          {/* Connecting line for desktop */}
          <div className={payrollFlowStyles.flowLine}></div>
          
          {/* Steps Grid */}
          <div className={payrollFlowStyles.stepsGrid}>
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={step.isCore ? payrollFlowStyles.stepCardCore : payrollFlowStyles.stepCard}
              >
                <div className={payrollFlowStyles.stepIcon}>
                  {step.icon}
                </div>
                {step.isCore && (
                  <div className={payrollFlowStyles.coreBadge}>
                    CORE
                  </div>
                )}
                <div className={payrollFlowStyles.stepNumber}>
                  {step.number}
                </div>
                <h3 className={payrollFlowStyles.stepTitle}>
                  {step.title}
                </h3>
                <p className={payrollFlowStyles.stepDescription}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <p className={payrollFlowStyles.note}>
           Secure Payroll Access: Organizations and users access payroll services through dedicated, secure payroll dashboards hosted on isolated payroll domains.
        </p>
      </div>
    </section>
  );
};

export default PayrollFlow;