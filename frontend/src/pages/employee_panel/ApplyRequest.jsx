import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { eachDayOfInterval, format, parseISO, isValid } from 'date-fns';
import { employeeStyles } from '../../styles';

const LeaveDateMode = {
  SINGLE: 'single',
  RANGE: 'range',
  MULTI: 'multi',
};

const ApplyRequest = ({ addRequest }) => {
  const [formData, setFormData] = useState({
    type: 'Leave',
    reason: '',
    singleDate: '',
    rangeStart: '',
    rangeEnd: '',
  });
  const [leaveDateMode, setLeaveDateMode] = useState(LeaveDateMode.SINGLE);
  const [multiPickDate, setMultiPickDate] = useState('');
  const [multiDates, setMultiDates] = useState([]);

  const sortedMultiDates = useMemo(() => [...multiDates].sort(), [multiDates]);

  const expandRangeInclusive = (startStr, endStr) => {
    if (!startStr || !endStr) return [];
    const start = parseISO(`${startStr}T12:00:00`);
    const end = parseISO(`${endStr}T12:00:00`);
    if (!isValid(start) || !isValid(end)) return [];
    if (end < start) return [];
    return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
  };

  const addMultiDate = () => {
    const d = multiPickDate.trim();
    if (!d) {
      toast.error('Pick a date to add');
      return;
    }
    if (multiDates.includes(d)) {
      toast.error('That date is already in the list');
      return;
    }
    setMultiDates((prev) => [...prev, d].sort());
    setMultiPickDate('');
  };

  const removeMultiDate = (d) => {
    setMultiDates((prev) => prev.filter((x) => x !== d));
  };

  const collectLeaveDates = () => {
    if (leaveDateMode === LeaveDateMode.SINGLE) {
      if (!formData.singleDate) return [];
      return [formData.singleDate];
    }
    if (leaveDateMode === LeaveDateMode.RANGE) {
      const expanded = expandRangeInclusive(formData.rangeStart, formData.rangeEnd);
      if (expanded.length === 0) {
        toast.error('Choose a valid date range (start on or before end)');
        return null;
      }
      return expanded;
    }
    if (multiDates.length === 0) {
      toast.error('Add at least one leave date');
      return null;
    }
    return [...multiDates];
  };

  const resetLeaveFields = () => {
    setFormData({
      type: 'Leave',
      reason: '',
      singleDate: '',
      rangeStart: '',
      rangeEnd: '',
    });
    setLeaveDateMode(LeaveDateMode.SINGLE);
    setMultiPickDate('');
    setMultiDates([]);
  };

  const handleSubmitRequest = () => {
    if (!formData.reason || formData.reason.trim() === '') {
      toast.error('Please provide a reason');
      return;
    }

    if (formData.type === 'Late Regularization') {
      if (!formData.singleDate) {
        toast.error('Please select the date for this request');
        return;
      }
      const newRequest = {
        type: formData.type,
        date: formData.singleDate,
        reason: formData.reason.trim(),
        status: 'pending',
      };
      if (addRequest && typeof addRequest === 'function') {
        addRequest(newRequest);
        toast.success('Request submitted successfully!');
        resetLeaveFields();
      } else {
        toast.error('Unable to submit request. Please try again.');
      }
      return;
    }

    const dates = collectLeaveDates();
    if (dates === null) return;
    if (dates.length === 0) {
      toast.error('Please select at least one leave date');
      return;
    }

    const newRequest = {
      type: 'Leave',
      reason: formData.reason.trim(),
      dates,
      status: 'pending',
    };

    if (addRequest && typeof addRequest === 'function') {
      addRequest(newRequest);
      toast.success(
        dates.length === 1
          ? 'Leave request submitted successfully!'
          : `${dates.length} leave day requests submitted successfully!`
      );
      resetLeaveFields();
    } else {
      toast.error('Unable to submit request. Please try again.');
    }
  };

  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Apply Request</h1>
      <div className={employeeStyles.requests.form}>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Request Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={employeeStyles.requests.select}
          >
            <option>Leave</option>
            <option>Late Regularization</option>
          </select>
        </div>

        {formData.type === 'Leave' && (
          <>
            <div className={employeeStyles.requests.formGroup}>
              <label className={employeeStyles.requests.label}>Leave dates</label>
              <select
                value={leaveDateMode}
                onChange={(e) => setLeaveDateMode(e.target.value)}
                className={employeeStyles.requests.select}
              >
                <option value={LeaveDateMode.SINGLE}>Single day</option>
                <option value={LeaveDateMode.RANGE}>Date range (inclusive)</option>
                <option value={LeaveDateMode.MULTI}>Multiple specific days</option>
              </select>
            </div>

            {leaveDateMode === LeaveDateMode.SINGLE && (
              <div className={employeeStyles.requests.formGroup}>
                <label className={employeeStyles.requests.label}>Leave date</label>
                <input
                  type="date"
                  value={formData.singleDate}
                  onChange={(e) => setFormData({ ...formData, singleDate: e.target.value })}
                  className={employeeStyles.requests.input}
                />
              </div>
            )}

            {leaveDateMode === LeaveDateMode.RANGE && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={employeeStyles.requests.formGroup}>
                  <label className={employeeStyles.requests.label}>From</label>
                  <input
                    type="date"
                    value={formData.rangeStart}
                    onChange={(e) => setFormData({ ...formData, rangeStart: e.target.value })}
                    className={employeeStyles.requests.input}
                  />
                </div>
                <div className={employeeStyles.requests.formGroup}>
                  <label className={employeeStyles.requests.label}>To</label>
                  <input
                    type="date"
                    value={formData.rangeEnd}
                    onChange={(e) => setFormData({ ...formData, rangeEnd: e.target.value })}
                    className={employeeStyles.requests.input}
                  />
                </div>
              </div>
            )}

            {leaveDateMode === LeaveDateMode.MULTI && (
              <div className={employeeStyles.requests.formGroup}>
                <label className={employeeStyles.requests.label}>Add dates</label>
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="date"
                    value={multiPickDate}
                    onChange={(e) => setMultiPickDate(e.target.value)}
                    className={`${employeeStyles.requests.input} flex-1 min-w-[140px]`}
                  />
                  <button
                    type="button"
                    onClick={addMultiDate}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Add date
                  </button>
                </div>
                {sortedMultiDates.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {sortedMultiDates.map((d) => (
                      <li
                        key={d}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-800 rounded-full text-xs"
                      >
                        {d}
                        <button
                          type="button"
                          className="ml-1 text-purple-600 hover:text-purple-900"
                          onClick={() => removeMultiDate(d)}
                          aria-label={`Remove ${d}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {formData.type === 'Late Regularization' && (
          <div className={employeeStyles.requests.formGroup}>
            <label className={employeeStyles.requests.label}>Date</label>
            <input
              type="date"
              value={formData.singleDate}
              onChange={(e) => setFormData({ ...formData, singleDate: e.target.value })}
              className={employeeStyles.requests.input}
            />
          </div>
        )}

        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Reason</label>
          <textarea
            rows="4"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Please provide a detailed reason for your request..."
            className={employeeStyles.requests.textarea}
          />
        </div>

        <button type="button" onClick={handleSubmitRequest} className={employeeStyles.requests.submitBtn}>
          Submit Request
        </button>
      </div>
    </div>
  );
};

export default ApplyRequest;
