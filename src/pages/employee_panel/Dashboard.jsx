import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { employeeStyles } from "../../styles";

// Sample holidays
const holidays = ["2026-01-26", "2026-03-17", "2026-12-25"];

// ✅ Safe function
const getStatusColor = (date, attendanceLogs = []) => {
  const dateStr = date.toISOString().split("T")[0];

  if (holidays.includes(dateStr)) return "holiday";

  const log = attendanceLogs.find((log) => log.date === dateStr);

  if (!log) return "absent";

  return log.status === "present" ? "present" : "late";
};

const Dashboard = ({
  attendanceLogs = [], 
  checkIn,
  checkOut,
  currentStatus = "present",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Empty slots for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <div className={employeeStyles.dashboard.container}>
      
      {/* Header */}
      <div className={employeeStyles.dashboard.header}>
        <h1 className={employeeStyles.dashboard.title}>Dashboard</h1>

        <div className={employeeStyles.dashboard.statusButtons}>
          
          <button
            onClick={checkIn}
            className={employeeStyles.dashboard.checkInBtn}
          >
            Check-in
          </button>

          <button
            onClick={checkOut}
            className={employeeStyles.dashboard.checkOutBtn}
          >
            Check-out
          </button>

          <div
            className={employeeStyles.dashboard.statusBadge(currentStatus)}
          >
            Current Status:{" "}
            {currentStatus === "present" ? "Present" : "Late"}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className={employeeStyles.calendar.container}>
        
        {/* Month Navigation */}
        <div className={employeeStyles.calendar.header}>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1
                )
              )
            }
            className={employeeStyles.calendar.headerBtn}
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className={employeeStyles.calendar.headerTitle}>
            {monthNames[currentDate.getMonth()]}{" "}
            {currentDate.getFullYear()}
          </h2>

          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1
                )
              )
            }
            className={employeeStyles.calendar.headerBtn}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div className={employeeStyles.calendar.weekdays}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
            <div
              key={day}
              className={employeeStyles.calendar.weekdayCell}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={employeeStyles.calendar.days}>
          {days.map((day, idx) => {
            if (!day) {
              return <div key={idx}></div>;
            }

            const status = getStatusColor(day, attendanceLogs);

            return (
              <div
                key={idx}
                className={employeeStyles.calendar.dayCell(status)}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={employeeStyles.calendar.legend}>
          
          <span className={employeeStyles.calendar.legendItem}>
            <span
              className={employeeStyles.calendar.legendColor("present")}
            ></span>
            Present
          </span>

          <span className={employeeStyles.calendar.legendItem}>
            <span
              className={employeeStyles.calendar.legendColor("absent")}
            ></span>
            Absent
          </span>

          <span className={employeeStyles.calendar.legendItem}>
            <span
              className={employeeStyles.calendar.legendColor("holiday")}
            ></span>
            Holiday
          </span>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;