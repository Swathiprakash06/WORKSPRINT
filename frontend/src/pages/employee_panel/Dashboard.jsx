import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { employeeStyles } from "../../styles";
import { getLateDuration, formatDuration, getCurrentTime, getCurrentDate, isLate, formatTime } from "../../utils/dateUtils";

const Dashboard = ({
  attendanceLogs = [],
  holidays = [],
  checkIn: externalCheckIn,
  checkOut: externalCheckOut,
  currentStatus = "present",
  workingHours = { start: "09:00", end: "18:00" },
  officeStart = "09:00",
  graceTime = 15,
  userId = "anonymous",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [modalReason, setModalReason] = useState("");

  const safeUserId = userId || "anonymous";
  const todayStatusKey = `todayStatus_${safeUserId}`;
  const todayStatusDateKey = `todayStatusDate_${safeUserId}`;

  const minutesOf = (hhmm) => {
    if (!hhmm || typeof hhmm !== "string") return 0;
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return 0;
    return h * 60 + m;
  };

  const [todayStatus, setTodayStatus] = useState(() => {
    // Initialize with default state - backend data will override this on load
    return {
      checkedIn: false,
      checkedOut: false,
      checkInTime: null,
      checkOutTime: null,
      status: "absent"
    };
  });
  const [localAttendanceLogs, setLocalAttendanceLogs] = useState(attendanceLogs);

  useEffect(() => {
    setLocalAttendanceLogs(attendanceLogs);
  }, [attendanceLogs]);

  // Normalize Date object to local YYYY-MM-DD string (safe against timezone shifts)
  const getDateKey = (dateInput) => {
    if (!dateInput) return null;
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if today is a holiday or weekend
  const isHolidayOrWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const todayStr = getDateKey(today);

    // Check if it's a weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    // Check if it's a holiday
    return holidays?.some(h => getDateKey(h.date) === todayStr);
  };

  // Get button text based on state
  const getCheckInButtonText = () => {
    if (isHolidayOrWeekend()) {
      return todayStatus.checkedIn ? "✓ Checked In" : "Holiday/Weekend";
    }
    return todayStatus.checkedIn ? "✓ Checked In" : "Check-in";
  };

  const getCheckOutButtonText = () => {
    if (isHolidayOrWeekend()) {
      return todayStatus.checkedOut ? "✓ Checked Out" : "Holiday/Weekend";
    }
    return todayStatus.checkedOut ? "✓ Checked Out" : "Check-out";
  };

  // Check if current time is within working hours
  const isWithinWorkingHours = () => {
    const currentTime = getCurrentTime();
    return currentTime >= workingHours.start && currentTime <= workingHours.end;
  };

  // Auto check for absence at end of day
  useEffect(() => {
    const checkEndOfDay = () => {
      const currentTime = getCurrentTime();
      const todayDate = getDateKey(new Date());
      
      // If it's after working hours and user hasn't checked in
      if (currentTime > workingHours.end && !todayStatus.checkedIn) {
        const existingLog = localAttendanceLogs.find(log => log.date === todayDate);
        if (!existingLog) {
          // Mark as absent
          const absentLog = {
            date: todayDate,
            status: "absent",
            checkInTime: null,
            checkOutTime: null,
            markedAbsent: true,
            timestamp: new Date().toISOString()
          };
          setLocalAttendanceLogs(prev => [...prev, absentLog]);
          if (externalCheckIn) {
            externalCheckIn(absentLog);
          }
          setTodayStatus(prev => ({ ...prev, status: "absent" }));
          toast.error(`Marked absent for ${todayDate} - No check-in recorded`);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkEndOfDay, 60000);
    checkEndOfDay(); // Initial check
    
    return () => clearInterval(interval);
  }, [todayStatus.checkedIn, localAttendanceLogs, workingHours.end, externalCheckIn]);

  // Load today's status from existing logs on component mount and when logs change
  useEffect(() => {
    const todayDate = getDateKey(new Date());
    const todayLog = localAttendanceLogs.find(log => log.date === todayDate);

    if (todayLog) {
      const newStatus = {
        checkedIn: !!todayLog.checkInTime,
        checkedOut: !!todayLog.checkOutTime,
        checkInTime: todayLog.checkInTime,
        checkOutTime: todayLog.checkOutTime,
        status: todayLog.status || "absent"
      };
      setTodayStatus(newStatus);
    } else {
      // No backend data for today, check localStorage as fallback
      const saved = localStorage.getItem(todayStatusKey);
      const todayDate = getCurrentDate();
      const savedDate = localStorage.getItem(todayStatusDateKey);

      if (saved && savedDate === todayDate) {
        try {
          const parsed = JSON.parse(saved);
          // Only use localStorage if it has check-in data (not just default absent state)
          if (parsed.checkedIn || parsed.checkedOut) {
            setTodayStatus(parsed);
          } else {
            // Reset to default if no real check-in data
            setTodayStatus({
              checkedIn: false,
              checkedOut: false,
              checkInTime: null,
              checkOutTime: null,
              status: "absent"
            });
          }
        } catch (e) {
          console.error('Error parsing saved todayStatus:', e);
          setTodayStatus({
            checkedIn: false,
            checkedOut: false,
            checkInTime: null,
            checkOutTime: null,
            status: "absent"
          });
        }
      } else {
        // No saved data for today
        setTodayStatus({
          checkedIn: false,
          checkedOut: false,
          checkInTime: null,
          checkOutTime: null,
          status: "absent"
        });
      }
    }
  }, [localAttendanceLogs, todayStatusKey, todayStatusDateKey]);

  const finalizeCheckIn = (checkInData) => {
    const todayDate = checkInData.date;
    setTodayStatus({
      checkedIn: true,
      checkedOut: false,
      checkInTime: checkInData.checkInTime,
      checkOutTime: null,
      status: checkInData.status,
    });

    // Clear any conflicting localStorage data since backend is now source of truth
    localStorage.removeItem(todayStatusKey);
    localStorage.removeItem(todayStatusDateKey);

    const existingLogIndex = localAttendanceLogs.findIndex((log) => log.date === todayDate);
    if (existingLogIndex >= 0) {
      const updatedLogs = [...localAttendanceLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        ...checkInData,
      };
      setLocalAttendanceLogs(updatedLogs);
      if (externalCheckIn) externalCheckIn(updatedLogs[existingLogIndex]);
    } else {
      const newLogs = [...localAttendanceLogs, checkInData];
      setLocalAttendanceLogs(newLogs);
      if (externalCheckIn) externalCheckIn(checkInData);
    }

    if (checkInData.status === "late") {
      toast.success(`Checked in (late) at ${formatTime(checkInData.checkInTime)}. Your reason was recorded for HR.`);
    } else {
      toast.success(`Checked in successfully at ${formatTime(checkInData.checkInTime)}`);
    }
  };

  const handleCheckIn = () => {
    const now = new Date();
    const todayDate = getDateKey(new Date());
    const currentTime = getCurrentTime();

    if (isHolidayOrWeekend()) {
      toast.error("Check-in is not required on holidays or weekends!");
      return;
    }

    if (todayStatus.checkedIn) {
      toast.error("You have already checked in today!");
      return;
    }

    if (!isWithinWorkingHours()) {
      toast.error(`Check-in is only allowed between ${formatTime(workingHours.start)} and ${formatTime(workingHours.end)}`);
      return;
    }

    const isLateNow = isLate(currentTime, officeStart, graceTime);
    const status = isLateNow ? "late" : "present";

    const baseCheckIn = {
      date: todayDate,
      checkInTime: currentTime,
      checkInTimestamp: now.toISOString(),
      status,
      checkedIn: true,
      checkedOut: false,
      checkOutTime: null,
    };

    if (isLateNow) {
      setModalReason("");
      setAttendanceModal({ kind: "late", checkInData: baseCheckIn });
      return;
    }

    finalizeCheckIn(baseCheckIn);
  };

  const confirmLateModal = () => {
    if (!attendanceModal || attendanceModal.kind !== "late") return;
    const trimmed = modalReason.trim();
    if (!trimmed) {
      toast.error("Please enter a reason for late check-in");
      return;
    }
    finalizeCheckIn({ ...attendanceModal.checkInData, lateReason: trimmed });
    setAttendanceModal(null);
    setModalReason("");
  };

  const finalizeCheckOut = (row) => {
    const currentTime = row.checkOutTime;
    const todayDate = getDateKey(new Date());
    setTodayStatus((prev) => ({
      ...prev,
      checkedOut: true,
      checkOutTime: currentTime,
    }));

    // Clear any conflicting localStorage data since backend is now source of truth
    localStorage.removeItem(todayStatusKey);
    localStorage.removeItem(todayStatusDateKey);

    const existingLogIndex = localAttendanceLogs.findIndex((log) => log.date === todayDate);
    if (existingLogIndex >= 0) {
      const updatedLogs = [...localAttendanceLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        ...row,
      };
      setLocalAttendanceLogs(updatedLogs);
      if (externalCheckOut) externalCheckOut(updatedLogs[existingLogIndex]);
    }

    toast.success(`Checked out successfully at ${formatTime(currentTime)}`);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const todayDate = getDateKey(new Date());
    const currentTime = getCurrentTime();

    if (!todayStatus.checkedIn) {
      toast.error("You haven't checked in today!");
      return;
    }

    if (todayStatus.checkedOut) {
      toast.error("You have already checked out today!");
      return;
    }

    if (currentTime < workingHours.start) {
      toast.error(`Cannot check out before ${formatTime(workingHours.start)}`);
      return;
    }

    const checkOutPatch = {
      checkOutTime: currentTime,
      checkOutTimestamp: now.toISOString(),
      checkedOut: true,
    };

    const isEarly = minutesOf(currentTime) < minutesOf(workingHours.end);
    if (isEarly) {
      setModalReason("");
      setAttendanceModal({ kind: "early", checkOutPatch });
      return;
    }

    const existingLogIndex = localAttendanceLogs.findIndex((log) => log.date === todayDate);
    if (existingLogIndex >= 0) {
      const row = {
        ...localAttendanceLogs[existingLogIndex],
        ...checkOutPatch,
      };
      finalizeCheckOut(row);
    }
  };

  const confirmEarlyModal = () => {
    if (!attendanceModal || attendanceModal.kind !== "early") return;
    const trimmed = modalReason.trim();
    if (!trimmed) {
      toast.error("Please enter a reason for early check-out");
      return;
    }
    const todayDate = getDateKey(new Date());
    const existingLogIndex = localAttendanceLogs.findIndex((log) => log.date === todayDate);
    if (existingLogIndex < 0) return;
    const row = {
      ...localAttendanceLogs[existingLogIndex],
      ...attendanceModal.checkOutPatch,
      earlyCheckoutReason: trimmed,
    };
    finalizeCheckOut(row);
    setAttendanceModal(null);
    setModalReason("");
  };

  // Get status color with today's actual status
  const getStatusColor = (date, attendanceLogs = []) => {
    const dateStr = getDateKey(date);
    const todayDate = getDateKey(new Date());

    // Dynamic holidays from backend (any date)
    const holiday = holidays?.find(h => getDateKey(h.date) === dateStr);
    if (holiday) return "holiday";

    // If date is today, show real-time status or default until marked absent at EOD.
    if (dateStr === todayDate) {
      if (todayStatus.checkedIn) {
        return todayStatus.status; // "present" or "late"
      }
      return "default"; // normal blue with no text
    }

    // Future dates should remain default (blue with no status text)
    if (new Date(dateStr) > new Date(todayDate)) {
      return "default";
    }

    // Past dates: check attendance logs and fall back to absent
    const log = attendanceLogs.find((log) => log.date === dateStr);
    if (!log) return "absent";

    return log.status === "present" ? "present" : log.status === "late" ? "late" : "absent";
  };

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

  // Get day data from attendance logs
  const getDayData = (date, attendanceLogs = []) => {
    const dateStr = getDateKey(date);
    return attendanceLogs.find((log) => log.date === dateStr);
  };

  // Get holiday data for a date
  const getHolidayData = (date, holidays = []) => {
    const dateStr = getDateKey(date);
    // Find holiday by date - holidays is now an array of objects with date and name
    return holidays.find(h => getDateKey(h.date) === dateStr);
  };

  // Get tooltip text for calendar cell
  const getCellTooltip = (date, status, dayData, holidayData) => {
    if (holidayData) {
      return `${holidayData.name} - ${date.toLocaleDateString()}`;
    }

    if (dayData) {
      const checkIn = dayData.checkInTime || dayData.checkIn;
      const checkOut = dayData.checkOutTime || dayData.checkOut;
      let tooltip = `${status.charAt(0).toUpperCase() + status.slice(1)} - ${date.toLocaleDateString()}`;

      if (checkIn) tooltip += `\nCheck-in: ${formatTime(checkIn)}`;
      if (checkOut) tooltip += `\nCheck-out: ${formatTime(checkOut)}`;

      return tooltip;
    }

    return `${date.toLocaleDateString()}`;
  };

  // Render cell content based on status
  const renderCellContent = (status, dayData, holidayData) => {
    if (holidayData) {
      return (
        <div className={employeeStyles.calendar.dayCellStatus}>
          {holidayData.name}
        </div>
      );
    }

    switch (status) {
      case 'present':
        return (
          <div>
            <div className={employeeStyles.calendar.dayCellStatus}>Present</div>
            {dayData?.checkIn && (
              <div className={employeeStyles.calendar.dayCellTime}>
                {formatTime(dayData.checkInTime || dayData.checkIn)}
              </div>
            )}
            {dayData?.checkOut && (
              <div className={employeeStyles.calendar.dayCellTime}>
                {formatTime(dayData.checkOutTime || dayData.checkOut)}
              </div>
            )}
          </div>
        );

      case 'late': {
        const lateDuration = dayData ? getLateDuration(dayData.checkInTime || dayData.checkIn) : 0;
        return (
          <div>
            <div className={employeeStyles.calendar.dayCellStatus}>Late</div>
            {dayData?.checkIn && (
              <div className={employeeStyles.calendar.dayCellTime}>
                {formatTime(dayData.checkInTime || dayData.checkIn)}
              </div>
            )}
            {lateDuration > 0 && (
              <div className={employeeStyles.calendar.dayCellTime}>
                {formatDuration(lateDuration)}
              </div>
            )}
          </div>
        );
      }

      case 'absent':
        return (
          <div className={employeeStyles.calendar.dayCellStatus}>
            Absent
          </div>
        );

      default:
        return null; // Just show the date
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={employeeStyles.dashboard.container}>
      
      {/* Header */}
      <div className={employeeStyles.dashboard.header}>
        <h1 className={employeeStyles.dashboard.title}>Dashboard</h1>

        <div className={employeeStyles.dashboard.statusButtons}>
          <button
            onClick={handleCheckIn}
            className={employeeStyles.dashboard.checkInBtn}
            disabled={todayStatus.checkedIn || isHolidayOrWeekend()}
            style={(todayStatus.checkedIn || isHolidayOrWeekend()) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {getCheckInButtonText()} {todayStatus.checkInTime && `(${formatTime(todayStatus.checkInTime)})`}
          </button>

          <button
            onClick={handleCheckOut}
            className={employeeStyles.dashboard.checkOutBtn}
            disabled={!todayStatus.checkedIn || todayStatus.checkedOut || isHolidayOrWeekend()}
            style={(!todayStatus.checkedIn || todayStatus.checkedOut || isHolidayOrWeekend()) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {getCheckOutButtonText()} {todayStatus.checkOutTime && `(${formatTime(todayStatus.checkOutTime)})`}
          </button>

          <div className={employeeStyles.dashboard.statusBadge(currentStatus)}>
            <Clock size={14} className="inline mr-1" />
            Current Status:{" "}
            {todayStatus.checkedIn ? (todayStatus.status === "present" ? "Present" : "Late") : "Absent"}
          </div>
        </div>
      </div>

      {/* Today's Summary Card */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          {todayStatus.checkInTime && (
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-green-600" />
              <span className="text-sm text-gray-600">
                Check-in: {formatTime(todayStatus.checkInTime)}
                {todayStatus.status === "late" && (
                  <span className="ml-2 text-yellow-600 font-medium">(Late)</span>
                )}
              </span>
            </div>
          )}
          {todayStatus.checkOutTime && (
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-600" />
              <span className="text-sm text-gray-600">Check-out: {formatTime(todayStatus.checkOutTime)}</span>
            </div>
          )}
          {!todayStatus.checkedIn && todayStatus.status !== "absent" && (
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-600" />
              <span className="text-sm text-red-600 font-medium">Not checked in yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className={employeeStyles.calendar.container}>
        
        {/* Month Navigation */}
        <div className={employeeStyles.calendar.header}>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className={employeeStyles.calendar.headerBtn}
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className={employeeStyles.calendar.headerTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className={employeeStyles.calendar.headerBtn}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekdays */}
        <div className={employeeStyles.calendar.weekdays}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className={employeeStyles.calendar.weekdayCell}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={employeeStyles.calendar.days}>
          {days.map((day, idx) => {
            if (!day) {
return <div key={idx} className="h-[3rem] sm:h-[3.5rem] md:h-[4rem]"></div>;
            }

            const status = getStatusColor(day, localAttendanceLogs);
            const isToday = day.toDateString() === new Date().toDateString();
            const dayData = getDayData(day, localAttendanceLogs);
            const holidayData = getHolidayData(day, holidays);

            // Determine if cell has content to show
            const hasContent = status !== 'default' || holidayData;

            return (
              <div
                key={idx}
                className={employeeStyles.calendar.dayCell(status, hasContent)}
                style={{
                  ...(isToday && { border: '2px solid #7C3AED', fontWeight: 'bold' }),
                }}
                title={getCellTooltip(day, status, dayData, holidayData)}
              >
                <div className={employeeStyles.calendar.dayCellContent}>
                  <div className={employeeStyles.calendar.dayCellDate}>
                    {day.getDate()}
                  </div>
                  {renderCellContent(status, dayData, holidayData)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={employeeStyles.calendar.legend}>
          <span className={employeeStyles.calendar.legendItem}>
            <span className={employeeStyles.calendar.legendColor("present")}></span>
            Present
          </span>
          <span className={employeeStyles.calendar.legendItem}>
            <span className={employeeStyles.calendar.legendColor("absent")}></span>
            Absent
          </span>
          <span className={employeeStyles.calendar.legendItem}>
            <span className={employeeStyles.calendar.legendColor("late")}></span>
            Late
          </span>
          <span className={employeeStyles.calendar.legendItem}>
            <span className={employeeStyles.calendar.legendColor("holiday")}></span>
            Holiday
          </span>
        </div>
      </div>

      {attendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {attendanceModal.kind === "late" ? "Late check-in reason" : "Early check-out reason"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {attendanceModal.kind === "late"
                ? `You are checking in after the allowed time (office start ${formatTime(officeStart)} with ${graceTime} min grace).`
                : `You are checking out before the official end time (${formatTime(workingHours.end)}).`}
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder={
                attendanceModal.kind === "late"
                  ? "Explain why you are late (e.g. traffic, medical appointment)…"
                  : "Explain why you are leaving early (e.g. personal emergency, approved half-day)…"
              }
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => {
                  setAttendanceModal(null);
                  setModalReason("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white bg-[#7C3AED] rounded-lg hover:opacity-90"
                onClick={attendanceModal.kind === "late" ? confirmLateModal : confirmEarlyModal}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;