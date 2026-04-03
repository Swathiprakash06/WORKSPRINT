// src/components/Features.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { featuresStyles } from '../styles';

const Features = () => {
  const features = [
    {
      id: 1,
      icon: "fa-building-user",
      title: "Organization & Access",
      points: [
        "Custom org login URLs",
        "Role-based permissions",
        "Personal dashboards",
        "API-based onboarding"
      ]
    },
    {
      id: 2,
      icon: "fa-indian-rupee-sign",
      title: "Payroll Management",
      points: [
        "Salary structures",
        "Attendance-based payroll",
        "Direct bank transfers",
        "Approval workflows"
      ]
    },
    {
      id: 3,
      icon: "fa-calendar-check",
      title: "Leave & Attendance",
      points: [
        "Automated leave tracking",
        "Policy-based deductions",
        "Attendance payroll sync",
        "Real-time visibility"
      ]
    },
    {
      id: 4,
      icon: "fa-scale-balanced",
      title: "Statutory & Compliance Management",
      points: [
        "PF, ESI, PT & IT",
        "Indian labor law ready",
        "Auto statutory reports",
        "Audit-ready records"
      ]
    },
    {
      id: 5,
      icon: "fa-user-gear",
      title: "Employee Self‑Service Portal",
      points: [
        "Access payslips and payroll history",
        "Update personal and bank details",
        "View leave balances and policies",
        "Raise requests without HR dependency"
      ]
    },
    {
      id: 6,
      icon: "fa-id-card",
      title: "Employee Data Management",
      points: [
        "Centralized employee profiles",
        "Employment history & role tracking",
        "Performance and appraisal records",
        "Secure data storage with controlled access"
      ]
    },
    {
      id: 7,
      icon: "fa-bullseye",
      title: "Appraisal & Performance Management",
      points: [
        "Goal and KPI‑based performance tracking",
        "Appraisal cycles linked to incentives",
        "Data‑driven salary revisions"
      ]
    },
    {
      id: 8,
      icon: "fa-chart-pie",
      title: "Reports & Analytics",
      points: [
        "Payroll summaries & cost analysis",
        "Compliance and tax reports",
        "Attendance & leave analytics",
        "Exportable reports for finance and audits"
      ]
    },
    {
      id: 9,
      icon: "fa-plug",
      title: "Integrations",
      points: [
        "Accounting software integration (Tally, QuickBooks, and more)",
        "Open APIs for ERP, attendance devices & third‑party tools"
      ]
    }
  ];

  return (
    <section className={featuresStyles.section}>
      <div className={featuresStyles.container}>
        <div className={featuresStyles.whySection}>
          <div className={featuresStyles.whyContent}>
            <h2 className={featuresStyles.whyTitle}>Why WorkSprint?</h2>
            <p className={featuresStyles.whyDescription}>
              Managing people, payroll, and compliance shouldn't slow your business down. 
              WorkSprint is built to automate routine HR operations, reduce errors, and ensure 
              statutory compliance—so HR teams can focus on people, not paperwork.
            </p>
          </div>
        </div>

        {/* Core Capabilities Section */}
        <div className={featuresStyles.coreSection}>
          <div className="text-center mb-12">
            <h2 className={featuresStyles.coreTitle}>Core Capabilities</h2>
            <p className={featuresStyles.coreSubtitle}>
              Built for Indian payroll needs. Designed for modern teams.
            </p>
          </div>

          {/* Carousel with Swiper */}
          <div className="relative mt-16">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={{
                prevEl: '.swiper-prev',
                nextEl: '.swiper-next',
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 2,
                },
                1280: {
                  slidesPerView: 2,
                },
              }}
              className="coreSwiper"
            >
              {features.map((feature) => (
                <SwiperSlide key={feature.id}>
                  <div className={featuresStyles.card}>
                    <div className={featuresStyles.cardIcon}>
                      <i className={`fa-solid ${feature.icon} text-xl`}></i>
                    </div>
                    <h3 className={featuresStyles.cardTitle}>
                      {feature.title}
                    </h3>
                    <ul className={featuresStyles.cardList}>
                      {feature.points.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;