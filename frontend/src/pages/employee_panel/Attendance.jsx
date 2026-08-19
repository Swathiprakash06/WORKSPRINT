import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Download } from "lucide-react";
import toast from "react-hot-toast";
import { employeeStyles } from "../../styles";
import { getLateDuration, formatDuration, getCurrentDate, getCurrentTime, isLate, formatTime, toLocalDateKey, formatDate } from "../../utils/dateUtils";
import Pagination from '../../components/Pagination';

const Attendance = ({
  attendanceLogs = [],
  requests = [],
  holidays = [],
  checkIn: externalCheckIn,
  checkOut: externalCheckOut,
  currentStatus = "present",
  workingHours = { start: "09:00", end: "18:00" },
  officeStart = "09:00",
  graceTime = 15,
  userId = "anonymous",
  profileImage = null,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tableMonth, setTableMonth] = useState(getCurrentDate().slice(0, 7));
  const [tablePage, setTablePage] = useState(1);
  const tablePageSize = 10;
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [modalReason, setModalReason] = useState("");
  const approvedLeaveDates = new Set(
    (requests || [])
      .filter((request) => request.status === 'approved' && (request.type === 'Leave' || request.type === 'leave'))
      .map((request) => toLocalDateKey(request.date))
      .filter(Boolean)
  );

  // Map to get leave request details by date
  const approvedLeaveMap = new Map(
    (requests || [])
      .filter((request) => request.status === 'approved' && (request.type === 'Leave' || request.type === 'leave'))
      .map((request) => [toLocalDateKey(request.date), request])
  );

  const safeUserId = String(userId ?? "anonymous");
  const shortUserId = safeUserId.trim() || "anonymous";
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

  // Check if today is a holiday or weekend
  const isHolidayOrWeekend = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const todayStr = toLocalDateKey(today);

    // Check if it's a weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    // Check if it's a holiday
    return holidays?.some(h => toLocalDateKey(h.date) === todayStr);
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
      const todayDate = toLocalDateKey(new Date());
      
      // If it's after working hours and user hasn't checked in or marked absent
      if (currentTime > workingHours.end && !todayStatus.checkedIn && todayStatus.status !== 'absent') {
        const existingLog = localAttendanceLogs.find(log => log.date === todayDate);
        
        // Only mark as absent if no record exists or existing record doesn't have check-in
        if (!existingLog || (!existingLog.checkInTime && !existingLog.checkIn)) {
          const absentLog = {
            date: todayDate,
            status: "absent",
            checkInTime: null,
            checkOutTime: null,
            markedAbsentManually: false,  // Auto-marked, not manual
            timestamp: new Date().toISOString()
          };
          
          if (existingLog) {
            // Update existing log to absent
            const updatedLog = { ...existingLog, ...absentLog };
            setLocalAttendanceLogs(prev => prev.map(log => log.date === todayDate ? updatedLog : log));
            if (externalCheckIn) {
              externalCheckIn(updatedLog);
            }
          } else {
            // Create new absent log
            setLocalAttendanceLogs(prev => [...prev, absentLog]);
            if (externalCheckIn) {
              externalCheckIn(absentLog);
            }
          }
          
          setTodayStatus(prev => ({ ...prev, status: "absent" }));
          toast.error(`Auto-marked absent for ${todayDate} - No check-in recorded after working hours`);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkEndOfDay, 60000);
    checkEndOfDay(); // Initial check
    
    return () => clearInterval(interval);
  }, [todayStatus.checkedIn, todayStatus.status, localAttendanceLogs, workingHours.end, externalCheckIn]);

  // Load today's status from existing logs on component mount and when logs change
  useEffect(() => {
    const todayDate = toLocalDateKey(new Date());
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
      // No backend data for today, use default state
      setTodayStatus({
        checkedIn: false,
        checkedOut: false,
        checkInTime: null,
        checkOutTime: null,
        status: "absent"
      });
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
    const todayDate = toLocalDateKey(new Date());
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

  const finalizeCheckOut = async (row, showToast = true) => {
    const currentTime = row.checkOutTime;
    const todayDate = toLocalDateKey(new Date());

    console.log("Finalizing checkout with row:", row);

    setTodayStatus((prev) => ({
      ...prev,
      checkedOut: true,
      checkOutTime: currentTime,
    }));

    const existingLogIndex = localAttendanceLogs.findIndex((log) => log.date === todayDate);
    if (existingLogIndex >= 0) {
      const updatedLogs = [...localAttendanceLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        ...row,
      };
      setLocalAttendanceLogs(updatedLogs);

      // Call external checkOut function (updateAttendance)
      if (externalCheckOut) {
        try {
          await externalCheckOut(updatedLogs[existingLogIndex]);
          console.log("External checkout completed successfully");
        } catch (error) {
          console.error("External checkout failed:", error);
          // Don't show error here as updateAttendance already shows toast
        }
      }
    }

    if (showToast) {
      toast.success(`Checked out successfully at ${formatTime(currentTime)}`);
    }
  };

  const handleCheckOut = () => {
    const now = new Date();
    const todayDate = toLocalDateKey(new Date());
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
      finalizeCheckOut(row).catch((error) => {
        console.error("Failed to finalize normal checkout:", error);
      });
    }
  };

  const confirmEarlyModal = () => {
    if (!attendanceModal || attendanceModal.kind !== "early") {
      console.error("Invalid modal state for early checkout");
      return;
    }

    const trimmed = modalReason.trim();
    if (!trimmed) {
      toast.error("Please enter a reason for early check-out");
      return;
    }

    const todayDate = toLocalDateKey(new Date());
    const existingLogIndex = localAttendanceLogs.findIndex((log) => log.date === todayDate);

    if (existingLogIndex < 0) {
      console.error("No attendance log found for today during early checkout");
      toast.error("No check-in record found for today. Please check in first.");
      return;
    }

    const row = {
      ...localAttendanceLogs[existingLogIndex],
      ...attendanceModal.checkOutPatch,
      earlyCheckoutReason: trimmed,
    };

    console.log("Processing early checkout:", row);
    setAttendanceModal(null);
    setModalReason("");
    const toastId = toast.loading("Processing early checkout...");

    finalizeCheckOut(row, false)
      .then(() => {
        toast.success(`Checked out successfully at ${formatTime(row.checkOutTime)}`, { id: toastId });
      })
      .catch((error) => {
        console.error("Failed to finalize early checkout:", error);
        toast.error(error?.message || "Failed to process early check-out", { id: toastId });
      });
  };

  // Handle marking today as absent
  const handleMarkAbsent = () => {
    const todayDate = toLocalDateKey(new Date());
    
    // Can't mark if outside working hours
    if (!isWithinWorkingHours()) {
      toast.error(`You can only mark absent between ${formatTime(workingHours.start)} and ${formatTime(workingHours.end)}`);
      return;
    }
    
    // Can't mark approved leaves as absent
    if (approvedLeaveDates.has(todayDate)) {
      toast.error("This is an approved leave. Cannot mark as absent");
      return;
    }

    // Check if already has check-in record
    const existingLog = localAttendanceLogs.find(log => log.date === todayDate);
    if (existingLog && (existingLog.checkInTime || existingLog.checkIn)) {
      toast.error("Cannot mark as absent. You have already checked in today");
      return;
    }

    const absentLog = {
      date: todayDate,
      status: "absent",
      checkInTime: null,
      checkOutTime: null,
      markedAbsentManually: true,  // Flag to distinguish manual vs auto-mark
      timestamp: new Date().toISOString()
    };

    // Update local logs
    const existingLogIndex = localAttendanceLogs.findIndex(log => log.date === todayDate);
    let updatedLogs;
    if (existingLogIndex >= 0) {
      updatedLogs = [...localAttendanceLogs];
      updatedLogs[existingLogIndex] = absentLog;
    } else {
      updatedLogs = [...localAttendanceLogs, absentLog];
    }
    
    setLocalAttendanceLogs(updatedLogs);
    if (externalCheckIn) {
      externalCheckIn(absentLog);
    }
    
    setTodayStatus(prev => ({ ...prev, status: "absent" }));
    toast.success(`Marked today as absent`);
  };

  // Get status color with today's actual status
  const getStatusColor = (date, attendanceLogs = []) => {
    const dateStr = toLocalDateKey(date);
    const todayDate = toLocalDateKey(new Date());

    // Dynamic holidays from backend (any date)
    const holiday = holidays?.find(h => toLocalDateKey(h.date) === dateStr);
    if (holiday) return "holiday";

    // Check for approved leave (any date)
    if (approvedLeaveDates.has(dateStr)) return "leave";

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
    const dateStr = toLocalDateKey(date);
    return attendanceLogs.find((log) => log.date === dateStr);
  };

  // Get holiday data for a date
  const getHolidayData = (date, holidays = []) => {
    const dateStr = toLocalDateKey(date);
    // Find holiday by date - holidays is now an array of objects with date and name
    return holidays.find(h => toLocalDateKey(h.date) === dateStr);
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
  const renderCellContent = (status, dayData, holidayData, dateStr) => {
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
        const lateDuration = dayData
          ? getLateDuration(dayData.checkInTime || dayData.checkIn, officeStart, graceTime)
          : 0;
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

      case 'leave': {
        const leaveData = approvedLeaveMap.get(dateStr);
        return (
          <div>
            <div className={employeeStyles.calendar.dayCellStatus}>Approved</div>
            {leaveData?.reason && (
              <div className={employeeStyles.calendar.dayCellTime}>
                {leaveData.reason.length > 20 ? leaveData.reason.substring(0, 20) + '...' : leaveData.reason}
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
        return null;
    }
  };

  const exportTableData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/v1/employee/attendance/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'employee-attendance-export.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Attendance export downloaded');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export attendance report');
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const tableRows = [...attendanceLogs]
    .map((log) => {
      const date = toLocalDateKey(log.date);
      const approvedLeave = approvedLeaveDates.has(date);
      return {
        date,
        status: approvedLeave ? 'Approved Leave' : (log.status || 'Absent'),
        checkIn: formatTime(log.checkInTime || log.checkIn) || '-',
        checkOut: formatTime(log.checkOutTime || log.checkOut) || '-',
        hours: log.totalHours ?? '-',
        note: approvedLeave ? 'Approved leave' : (log.lateReason || log.earlyCheckoutReason || log.hrNote || '-'),
      };
    })
    .concat(
      [...approvedLeaveDates]
        .filter((date) => !attendanceLogs.some((log) => toLocalDateKey(log.date) === date))
        .map((date) => ({
          date,
          status: 'Approved Leave',
          checkIn: '-',
          checkOut: '-',
          hours: '-',
          note: 'Approved leave',
        }))
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((row) => row.date.startsWith(tableMonth));
  const pagedTableRows = tableRows.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  const normalizedProfileImage = profileImage
    ? (profileImage.startsWith('http') ? profileImage : `http://localhost:3001/${profileImage.replace(/\\/g, '/')}`)
    : null;

  return (
    <div className={employeeStyles.dashboard.container}>
      
      {/* Header */}
      <div className={employeeStyles.dashboard.header}>
        <h1 className={employeeStyles.dashboard.title}>Dashboard</h1>

        <div className={employeeStyles.dashboard.statusButtons}>
          {/* Button Logic based on attendance state */}
          {(() => {
            const isApprovedLeave = approvedLeaveDates.has(toLocalDateKey(new Date()));
            const isHolidayOrWeekendToday = isHolidayOrWeekend();
            const withinWorkingHours = isWithinWorkingHours();
            
            // Check if MANUALLY marked absent (not auto-marked at end of day)
            const todayLog = localAttendanceLogs.find(log => log.date === toLocalDateKey(new Date()));
            const manuallyMarkedAbsent = todayLog?.markedAbsentManually === true;
            
            // Button states:
            // If checked in → can only check out
            const checkInDisabled = todayStatus.checkedIn || isHolidayOrWeekendToday || isApprovedLeave || manuallyMarkedAbsent || !withinWorkingHours;
            const checkOutDisabled = !todayStatus.checkedIn || todayStatus.checkedOut || isHolidayOrWeekendToday || isApprovedLeave || manuallyMarkedAbsent || !withinWorkingHours;
            
            // If not checked in → can mark absent
            const markAbsentDisabled = todayStatus.checkedIn || isHolidayOrWeekendToday || isApprovedLeave || manuallyMarkedAbsent || !withinWorkingHours;

            return (
              <>
                <button
                  onClick={handleCheckIn}
                  className={employeeStyles.dashboard.checkInBtn}
                  disabled={checkInDisabled}
                  style={checkInDisabled ? { backgroundColor: '#9CA3AF', color: 'white', opacity: 0.7, cursor: 'not-allowed', borderColor: '#9CA3AF' } : {}}
                  title={!withinWorkingHours ? `Only available between ${workingHours.start} - ${workingHours.end}` : manuallyMarkedAbsent ? "Already marked as absent" : isApprovedLeave ? "On approved leave" : todayStatus.checkedIn ? "Already checked in" : ""}
                >
                  {getCheckInButtonText()} {todayStatus.checkInTime && `(${formatTime(todayStatus.checkInTime)})`}
                </button>

                <button
                  onClick={handleCheckOut}
                  className={employeeStyles.dashboard.checkOutBtn}
                  disabled={checkOutDisabled}
                  style={checkOutDisabled ? { backgroundColor: '#9CA3AF', color: 'white', opacity: 0.7, cursor: 'not-allowed', borderColor: '#9CA3AF' } : {}}
                  title={!withinWorkingHours ? `Only available between ${workingHours.start} - ${workingHours.end}` : !todayStatus.checkedIn ? "Check in first" : manuallyMarkedAbsent ? "Already marked as absent" : isApprovedLeave ? "On approved leave" : ""}
                >
                  {getCheckOutButtonText()} {todayStatus.checkOutTime && `(${formatTime(todayStatus.checkOutTime)})`}
                </button>

                <button
                  onClick={handleMarkAbsent}
                  className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={markAbsentDisabled}
                  style={markAbsentDisabled ? { backgroundColor: '#9CA3AF', opacity: 0.7, cursor: 'not-allowed' } : {}}
                  title={!withinWorkingHours ? `Only available between ${workingHours.start} - ${workingHours.end}` : todayStatus.checkedIn ? "Cannot mark absent after check-in" : manuallyMarkedAbsent ? "Already marked as absent" : isApprovedLeave ? "On approved leave" : ""}
                >
                  Mark Absent
                </button>
              </>
            );
          })()}

          <div className={employeeStyles.dashboard.statusBadge(currentStatus)}>
            <Clock size={14} className="inline mr-1" />
            Current Status:{" "}
            {approvedLeaveDates.has(toLocalDateKey(new Date())) ? 'Approved Leave' : todayStatus.checkedIn ? (todayStatus.status === 'present' ? 'Present' : 'Late') : 'Absent'}
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

            const dateStr = toLocalDateKey(day);
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
                  {renderCellContent(status, dayData, holidayData, dateStr)}
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
          <span className={employeeStyles.calendar.legendItem}>
            <span className={employeeStyles.calendar.legendColor("leave")}></span>
            Approved Leave
          </span>
        </div>
      </div>

      {normalizedProfileImage && (
        <div className="mt-6 flex justify-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <img
              src={normalizedProfileImage}
              alt="Employee profile"
              className="h-40 w-40 rounded-xl object-cover border border-gray-200 bg-gray-100"
            />
          </div>
        </div>
      )}

      <div className="mt-6 mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Attendance</h2>
            <p className="text-sm text-gray-500">Track your daily attendance and approved leave records.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="attendance-month" className="text-sm font-medium text-gray-900">Month</label>
              <input
                id="attendance-month"
                type="month"
                value={tableMonth}
                onChange={(e) => setTableMonth(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <button
              type="button"
              onClick={exportTableData}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Check-in</th>
                <th className="px-3 py-2 font-semibold">Check-out</th>
                <th className="px-3 py-2 font-semibold">Hours</th>
                <th className="px-3 py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {pagedTableRows.length > 0 ? pagedTableRows.map((row, index) => (
                <tr key={`${row.date}-${index}`} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{formatDate(row.date)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.status === 'Present' ? 'bg-green-100 text-green-700' : row.status === 'Late' ? 'bg-yellow-100 text-yellow-700' : row.status === 'Approved Leave' ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{row.checkIn}</td>
                  <td className="px-3 py-2 text-gray-700">{row.checkOut}</td>
                  <td className="px-3 py-2 text-gray-700">{row.hours === '-' ? '—' : `${row.hours}h`}</td>
                  <td className="px-3 py-2 text-gray-700">{row.note}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-gray-400">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={tablePage} pageSize={tablePageSize} total={tableRows.length} onPageChange={setTablePage} />
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

export default Attendance;