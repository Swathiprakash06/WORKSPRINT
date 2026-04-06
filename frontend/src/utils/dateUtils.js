// utils/dateUtils.js
import { format, parseISO, isValid } from 'date-fns';
import { enIN } from 'date-fns/locale';

const INDIA_TIMEZONE = 'Asia/Kolkata';

const getTimeZoneDateParts = (date, timeZone = INDIA_TIMEZONE) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
};

const getIndiaDate = (date = new Date()) => {
  const parts = getTimeZoneDateParts(date);
  return new Date(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
};

/**
 * Format date to DD/MM/YYYY format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date or empty string if invalid
 */
export const formatDate = (date) => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) return '';

    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Parse "H:mm" or "HH:mm" (24h) into a Date on a fixed day (for formatting only).
 */
const clockStringToDate = (str) => {
  const trimmed = String(str).trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) return null;
  const [h, m] = trimmed.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m) || m > 59) return null;
  return new Date(2000, 0, 1, h, m, 0);
};

/**
 * Format time for display as 12-hour with AM/PM (e.g. 5:00 PM).
 * Accepts 24h strings like "17:00" from API/settings or ISO datetimes.
 * Internal logic elsewhere still uses 24h strings; use getCurrentTime() for comparisons.
 */
export const formatTime = (time) => {
  if (!time) return '';

  try {
    if (typeof time === 'string') {
      const fromClock = clockStringToDate(time);
      if (fromClock && isValid(fromClock)) {
        return format(fromClock, 'h:mm a');
      }
    }

    const dateObj = typeof time === 'string' ? parseISO(time) : new Date(time);
    if (!isValid(dateObj)) return '';

    return format(dateObj, 'h:mm a');
  } catch (error) {
    console.error('Time formatting error:', error);
    return '';
  }
};

/**
 * Get current date in YYYY-MM-DD format for database storage
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return format(getIndiaDate(), 'yyyy-MM-dd');
};

/**
 * Calendar date in YYYY-MM-DD using Mumbai timezone.
 */
export const toLocalDateKey = (dateInput) => {
  if (!dateInput) return '';
  try {
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
      const [y, m, d] = dateInput.trim().split('-').map(Number);
      const local = new Date(y, m - 1, d);
      if (!isValid(local)) return '';
      return format(local, 'yyyy-MM-dd');
    }
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (!isValid(d)) return '';
    return format(getIndiaDate(d), 'yyyy-MM-dd');
  } catch {
    return '';
  }
};

/**
 * Current clock time as 24h "HH:mm" for comparisons (isLate, working hours, API payloads).
 */
export const getCurrentTime = () => {
  return format(getIndiaDate(), 'HH:mm');
};

/** Split 24h "HH:mm" into 12h clock parts for pickers */
export const fromHHMM24 = (s) => {
  const trimmed = (s || '09:00').trim();
  if (!/^\d{1,2}:\d{2}$/.test(trimmed)) return { hour12: 9, minute: 0, period: 'AM' };
  const [H, M] = trimmed.split(':').map(Number);
  if (Number.isNaN(H) || Number.isNaN(M)) return { hour12: 9, minute: 0, period: 'AM' };
  const period = H >= 12 ? 'PM' : 'AM';
  const hour12 = H % 12 || 12;
  return { hour12, minute: M, period };
};

/** Build 24h "HH:mm" for API from 12h picker */
export const toHHMM24 = (hour12, minute, period) => {
  let H;
  if (period === 'AM') H = hour12 === 12 ? 0 : hour12;
  else H = hour12 === 12 ? 12 : hour12 + 12;
  return `${String(H).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

/**
 * Parse date from DD/MM/YYYY format to Date object
 * @param {string} dateStr - Date string in DD/MM/YYYY format
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;

  const [day, month, year] = dateStr.split('/');
  const date = new Date(`${year}-${month}-${day}`);

  return isValid(date) ? date : null;
};

/**
 * Check if a time is late based on office start time
 * @param {string} checkInTime - Check-in time in HH:MM format
 * @param {string} officeStart - Office start time in HH:MM format (default: '09:00')
 * @param {number} graceTime - Grace time in minutes (default: 15)
 * @returns {boolean} True if late
 */
export const isLate = (checkInTime, officeStart = '09:00', graceTime = 15) => {
  if (!checkInTime) return false;

  const [checkInHour, checkInMin] = checkInTime.split(':').map(Number);
  const [startHour, startMin] = officeStart.split(':').map(Number);

  const checkInMinutes = checkInHour * 60 + checkInMin;
  const startMinutes = startHour * 60 + startMin + graceTime;

  return checkInMinutes > startMinutes;
};

/**
 * Calculate late duration in minutes
 * @param {string} checkInTime - Check-in time in HH:MM format
 * @param {string} officeStart - Office start time in HH:MM format (default: '09:00')
 * @returns {number} Late duration in minutes
 */
export const getLateDuration = (checkInTime, officeStart = '09:00') => {
  if (!checkInTime) return 0;

  const [checkInHour, checkInMin] = checkInTime.split(':').map(Number);
  const [startHour, startMin] = officeStart.split(':').map(Number);

  const checkInMinutes = checkInHour * 60 + checkInMin;
  const startMinutes = startHour * 60 + startMin;

  return Math.max(0, checkInMinutes - startMinutes);
};

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
};

/**
 * Get current date in DD/MM/YYYY format
 * @returns {string} Current date in DD/MM/YYYY format
 */
export const getTodayDate = () => {
  return format(getIndiaDate(), 'dd/MM/yyyy');
};

/**
 * Get date range for a given month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Object with startDate and endDate in YYYY-MM-DD format
 */
export const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  return format(getIndiaDate(dateObj), 'yyyy-MM-dd') === format(getIndiaDate(), 'yyyy-MM-dd');
};

/**
 * Check if date is within working hours
 * @param {string} currentTime - Current time in HH:MM format
 * @param {string} startTime - Office start time (default: '09:00')
 * @param {string} endTime - Office end time (default: '18:00')
 * @returns {boolean} True if within working hours
 */
export const isWithinWorkingHours = (currentTime, startTime = '09:00', endTime = '18:00') => {
  if (!currentTime) return false;

  const [currentHour, currentMin] = currentTime.split(':').map(Number);
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};