// src/components/Modules.jsx (Enhanced Version)
import React, { useState } from 'react';
import { modulesStyles } from '../styles';

const Modules = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const modules = [
    { name: "Payroll", icon: "fa-indian-rupee-sign",  },
    { name: "Company Management", icon: "fa-building" },
    { name: "Employee Management", icon: "fa-users"},
    { name: "Leave Management", icon: "fa-calendar-alt" },
    { name: "Policies", icon: "fa-file-alt"},
    { name: "TaskGo Tasks & Workflows", icon: "fa-tasks" },
    { name: "Appraisal & Performance", icon: "fa-chart-line" },
    { name: "Integrations", icon: "fa-plug" }
  ];

  return (
    <section className={modulesStyles.section}>
      <div className={modulesStyles.container}>
        {/* Header */}
        <div className={modulesStyles.header}>
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#7C3AED] to-[#9B4DFF] rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-cubes text-white text-xl"></i>
            </div>
          </div>
          <h2 className={modulesStyles.title}>
            Modular HRMS Architecture
          </h2>
          <p className={modulesStyles.subtitle}>
            Choose what you need today. Scale effortlessly as you grow.
          </p>
        </div>

        {/* Modules Grid */}
        <div className={modulesStyles.grid}>
          {modules.map((module, index) => (
            <div 
              key={index} 
              className={modulesStyles.card}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={`${modulesStyles.cardIcon} ${hoveredIndex === index ? 'scale-110' : ''}`}>
                <i className={`fa-solid ${module.icon} text-2xl`}></i>
              </div>
              <h3 className={modulesStyles.cardTitle}>
                {module.name}
              </h3>
              {hoveredIndex === index && (
                <p className="text-xs text-[#7C3AED] mt-2 animate-fadeIn">
                  {module.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Pricing Note */}
        <div className={modulesStyles.pricingNote}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <i className="fa-solid fa-tag text-[#7C3AED] text-xl"></i>
            <p className={modulesStyles.pricingText}>
              Pay only for what you use.
            </p>
          </div>
          <p className={modulesStyles.pricingDescription}>
            WorkSprint follows a flexible subscription model — activate modules anytime as your business scales.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Modules;