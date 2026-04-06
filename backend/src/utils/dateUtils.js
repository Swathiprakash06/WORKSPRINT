// utils/dateUtils.js
const { format, parseISO, isValid } = require('date-fns');

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

const getIndiaNow = () => {
  const parts = getTimeZoneDateParts(new Date());
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
 * Create a date-only Date object (without time/timezone) for database storage
 * @param {string|Date} date - Date to convert
 * @returns {Date} Date object set to start of day in UTC
 */
const createDateOnly = (date) => {
  if (!date) return null;

  let dateObj;
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format, parse it directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = parseISO(date);
    }
  } else {
    dateObj = new Date(date);
  }

  if (!isValid(dateObj)) return null;

  const parts = getTimeZoneDateParts(dateObj);
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date string
 */
const getCurrentDateString = () => {
  return format(getIndiaNow(), 'yyyy-MM-dd');
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time string
 */
const getCurrentTimeString = () => {
  return format(getIndiaNow(), 'HH:mm');
};

/**
 * Check if current time is late based on office start time
 * @param {string} checkInTime - Check-in time in HH:MM format
 * @param {string} officeStart - Office start time in HH:MM format (default: '09:00')
 * @param {number} graceTime - Grace time in minutes (default: 15)
 * @returns {boolean} True if late
 */
const isLate = (checkInTime, officeStart = '09:00', graceTime = 15) => {
  if (!checkInTime) return false;

  const [checkInHour, checkInMin] = checkInTime.split(':').map(Number);
  const [startHour, startMin] = officeStart.split(':').map(Number);

  const checkInMinutes = checkInHour * 60 + checkInMin;
  const startMinutes = startHour * 60 + startMin + graceTime;

  return checkInMinutes > startMinutes;
};

/**
 * Get date range for a month
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Object with startDate and endDate as Date objects
 */
const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return {
    startDate: createDateOnly(startDate),
    endDate: createDateOnly(endDate)
  };
};

/**
 * Format date for API response (ISO string without time)
 * @param {Date} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
const formatDateForAPI = (date) => {
  if (!date) return null;
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse date from frontend (DD/MM/YYYY or YYYY-MM-DD)
 * @param {string} dateStr - Date string
 * @returns {Date|null} Parsed date or null if invalid
 */
const parseDateFromFrontend = (dateStr) => {
  if (!dateStr) return null;

  // Handle DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return createDateOnly(new Date(year, month - 1, day));
  }

  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return createDateOnly(dateStr);
  }

  return null;
};

module.exports = {
  createDateOnly,
  getCurrentDateString,
  getCurrentTimeString,
  isLate,
  getMonthDateRange,
  formatDateForAPI,
  parseDateFromFrontend,
  getIndiaNow
};