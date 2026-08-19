// admin/HolidayManagement.jsx
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { eachDayOfInterval, format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';
import { employeeStyles } from '../../styles';
import { formatDate, toLocalDateKey } from '../../utils/dateUtils';
import TablePlaceholder from '../../components/TablePlaceholder';
import Pagination from '../../components/Pagination';

const HolidayDateMode = {
  SINGLE: 'single',
  RANGE: 'range',
  MULTI: 'multi',
};

const HolidayManagement = ({ holidays, setHolidays, addHoliday, deleteHoliday }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [formData, setFormData] = useState({
    name: '',
    singleDate: '',
    rangeStart: '',
    rangeEnd: '',
  });
  const [holidayDateMode, setHolidayDateMode] = useState(HolidayDateMode.SINGLE);
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

  const collectHolidayDates = () => {
    if (holidayDateMode === HolidayDateMode.SINGLE) {
      if (!formData.singleDate) return [];
      return [formData.singleDate];
    }
    if (holidayDateMode === HolidayDateMode.RANGE) {
      const expanded = expandRangeInclusive(formData.rangeStart, formData.rangeEnd);
      if (expanded.length === 0) {
        toast.error('Choose a valid date range (start on or before end)');
        return null;
      }
      return expanded;
    }
    if (multiDates.length === 0) {
      toast.error('Add at least one holiday date');
      return null;
    }
    return [...multiDates];
  };

  const resetHolidayFields = () => {
    setFormData({
      name: '',
      singleDate: '',
      rangeStart: '',
      rangeEnd: '',
    });
    setHolidayDateMode(HolidayDateMode.SINGLE);
    setMultiPickDate('');
    setMultiDates([]);
  };

  const handleAddHoliday = async () => {
    if (!formData.name || formData.name.trim() === '') {
      toast.error('Please provide a holiday name');
      return;
    }

    const dates = collectHolidayDates();
    if (dates === null) return;
    if (dates.length === 0) {
      toast.error('Please select at least one holiday date');
      return;
    }

    if (addHoliday) {
      await addHoliday({ name: formData.name.trim(), dates });
      resetHolidayFields();
      return;
    }

    // Fallback for local state management
    const newHolidays = dates.map(date => ({
      id: Date.now() + Math.random(),
      name: formData.name.trim(),
      date
    }));
    setHolidays([...holidays, ...newHolidays]);
    resetHolidayFields();
    toast.success(`${dates.length} holiday${dates.length > 1 ? 's' : ''} added`);
  };

  const handleDeleteHoliday = async (id) => {
    if (deleteHoliday) {
      await deleteHoliday(id);
      return;
    }

    setHolidays(holidays.filter(h => h.id !== id));
    toast.success('Holiday removed');
  };

  const groupedHolidays = useMemo(() => {
    const map = new Map();
    (holidays || []).forEach((h) => {
      const dateKey = toLocalDateKey(h.date);
      if (!dateKey) return;
      const list = map.get(h.name) || [];
      list.push({ date: dateKey, id: h.id });
      map.set(h.name, list);
    });

    const groups = [];
    for (const [name, items] of map.entries()) {
      const sorted = items.slice().sort((a, b) => a.date.localeCompare(b.date));
      // build consecutive ranges
      const ranges = [];
      let curStart = null;
      let curEnd = null;
      let curIds = [];

      const pushRange = () => {
        if (!curStart) return;
        ranges.push({ start: curStart, end: curEnd, ids: [...curIds] });
        curStart = null; curEnd = null; curIds = [];
      };

      sorted.forEach((it) => {
        const d = it.date;
        if (!curStart) {
          curStart = d; curEnd = d; curIds = [it.id];
          return;
        }
        const prev = parseISO(`${curEnd}T12:00:00`);
        const cur = parseISO(`${d}T12:00:00`);
        const diff = differenceInCalendarDays(cur, prev);
        if (diff === 1) {
          curEnd = d; curIds.push(it.id);
        } else {
          pushRange();
          curStart = d; curEnd = d; curIds = [it.id];
        }
      });
      pushRange();

      const summary = ranges.map((r) => {
        const startDate = parseISO(`${r.start}T12:00:00`);
        const endDate = parseISO(`${r.end}T12:00:00`);
        if (!isValid(startDate) || !isValid(endDate)) {
          return r.start === r.end ? r.start : `${r.start} — ${r.end}`;
        }
        if (r.start === r.end) return format(startDate, 'dd/MM/yyyy');
        return `${format(startDate, 'dd/MM/yyyy')} — ${format(endDate, 'dd/MM/yyyy')}`;
      }).join(', ');

      groups.push({ name, ranges, summary });
    }

    return groups.sort((a, b) => a.name.localeCompare(b.name));
  }, [holidays]);
  const pagedHolidays = groupedHolidays.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Holiday Management</h1>
      
      <div className={employeeStyles.requests.form}>
        <h2 className="text-lg font-semibold mb-4">Add New Holiday</h2>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Holiday Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Diwali, Christmas"
            className={employeeStyles.requests.input}
          />
        </div>

        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Holiday dates *</label>
          <select
            value={holidayDateMode}
            onChange={(e) => setHolidayDateMode(e.target.value)}
            className={employeeStyles.requests.select}
          >
            <option value={HolidayDateMode.SINGLE}>Single day</option>
            <option value={HolidayDateMode.RANGE}>Date range (inclusive)</option>
            <option value={HolidayDateMode.MULTI}>Multiple specific days</option>
          </select>
        </div>

        {holidayDateMode === HolidayDateMode.SINGLE && (
          <div className={employeeStyles.requests.formGroup}>
            <label className={employeeStyles.requests.label}>Holiday date</label>
            <input
              type="date"
              value={formData.singleDate}
              onChange={(e) => setFormData({ ...formData, singleDate: e.target.value })}
              className={employeeStyles.requests.input}
            />
          </div>
        )}

        {holidayDateMode === HolidayDateMode.RANGE && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={employeeStyles.requests.formGroup}>
              <label className={employeeStyles.requests.label}>From</label>
              <input
                type="date"
                value={formData.rangeStart}
                onChange={(e) => setFormData({ ...formData, rangeStart: e.target.value })}
                className={employeeStyles.requests.input}
                aria-required
              />
            </div>
            <div className={employeeStyles.requests.formGroup}>
              <label className={employeeStyles.requests.label}>To</label>
              <input
                type="date"
                value={formData.rangeEnd}
                onChange={(e) => setFormData({ ...formData, rangeEnd: e.target.value })}
                className={employeeStyles.requests.input}
                aria-required
              />
            </div>
          </div>
        )}

        {holidayDateMode === HolidayDateMode.MULTI && (
          <div className={employeeStyles.requests.formGroup}>
            <label className={employeeStyles.requests.label}>Add dates</label>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={multiPickDate}
                onChange={(e) => setMultiPickDate(e.target.value)}
                className={`${employeeStyles.requests.input} flex-1 min-w-[140px]`}
                aria-required
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

        <button onClick={handleAddHoliday} className={employeeStyles.requests.submitBtn}>
          <Plus size={18} className="inline mr-2" />
          Add Holiday
        </button>
      </div>

      <div className={employeeStyles.table.container}>
        <h2 className={employeeStyles.table.title}>All Holidays</h2>
        <div className={employeeStyles.table.tableWrapper}>
          <table className={employeeStyles.table.table}>
            <thead>
              <tr>
                <th className={employeeStyles.table.th}>Holiday Name</th>
                <th className={employeeStyles.table.th}>Date</th>
                <th className={employeeStyles.table.th}>Actions</th>
              </tr>
            </thead>
            {groupedHolidays.length > 0 ? (
              <tbody>
                {pagedHolidays.map((group) => (
                  <tr key={group.name}>
                    <td className={employeeStyles.table.td}>{group.name}</td>
                    <td className={employeeStyles.table.td}>{group.summary}</td>
                    <td className={employeeStyles.table.td}>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete all dates for "${group.name}"?`)) return;
                          // delete all ids in the ranges
                          for (const r of group.ranges) {
                            for (const id of r.ids) {
                              try {
                                await handleDeleteHoliday(id);
                              } catch (err) {
                                console.error('Failed to delete holiday id', id, err);
                              }
                            }
                          }
                        }}
                        className={employeeStyles.requests.deleteBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <TablePlaceholder columns={3} rows={3} showMessage={true} message="No entries" useTbody={true} />
            )}
          </table>
          <Pagination page={page} pageSize={pageSize} total={groupedHolidays.length} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default HolidayManagement;