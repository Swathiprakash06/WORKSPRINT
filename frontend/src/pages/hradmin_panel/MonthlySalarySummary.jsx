import React, { useEffect, useState } from 'react';
import { CalendarDays, Download, IndianRupee, Timer, UserCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeStyles } from '../../styles';
import { getCurrentDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/salaryUtils';
import { apiGet } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MonthlySalarySummary = ({ employees = [] }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [summaryMonth, setSummaryMonth] = useState(getCurrentDate().slice(0, 7));
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!selectedEmployeeId || !summaryMonth) return undefined;

    let cancelled = false;
    const timeout = setTimeout(() => {
      const loadSummary = async () => {
        setLoading(true);
        try {
          const [year, month] = summaryMonth.split('-');
          const response = await apiGet(`/api/v1/hr-admin/reports/monthly-salary?employeeId=${selectedEmployeeId}&month=${Number(month)}&year=${year}`);
          if (!response.ok) throw new Error('Failed to load monthly salary summary');
          const data = await response.json();
          if (!cancelled) setSummary(data.summary);
        } catch (error) {
          if (!cancelled) {
            setSummary(null);
            toast.error(error.message || 'Could not load monthly salary summary');
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      loadSummary();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [selectedEmployeeId, summaryMonth]);

  const handleEmployeeChange = (event) => {
    setSelectedEmployeeId(event.target.value);
    setSummary(null);
  };

  const handleExport = async () => {
    if (!selectedEmployeeId || !summaryMonth) return;
    setExporting(true);
    try {
      const [year, month] = summaryMonth.split('-');
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/api/v1/hr-admin/reports/monthly-salary/export?employeeId=${selectedEmployeeId}&month=${Number(month)}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `monthly-salary-summary-${summaryMonth}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Monthly summary exported successfully');
    } catch (error) {
      console.error('Monthly salary summary export failed:', error);
      toast.error('Failed to export monthly summary');
    } finally {
      setExporting(false);
    }
  };

  const metrics = summary ? [
    { label: 'Days Present', value: summary.daysPresent, icon: UserCheck, color: 'text-emerald-600', background: 'bg-emerald-50' },
    { label: 'Absent / Leave', value: summary.daysAbsentOrLeave, icon: CalendarDays, color: 'text-amber-600', background: 'bg-amber-50' },
    { label: 'Total Hours', value: `${Number(summary.totalHours || 0).toFixed(2)}h`, icon: Timer, color: 'text-blue-600', background: 'bg-blue-50' },
    { label: 'Credited Days', value: summary.salaryCreditedDays, icon: Users, color: 'text-violet-600', background: 'bg-violet-50' },
  ] : [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className={employeeStyles.table.title}>Payroll Summary</h1>
          <p className="mt-1 text-sm text-gray-500">Review an employee’s real attendance and accrued daily salary for a selected month.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!selectedEmployeeId || !summary || exporting}
          className="flex w-fit items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          {exporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Employee</span>
            <select
              value={selectedEmployeeId}
              onChange={handleEmployeeChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} {employee.employeeId ? `(${employee.employeeId})` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Month</span>
            <input
              type="month"
              value={summaryMonth}
              onChange={(event) => setSummaryMonth(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-gray-500">Test records and incomplete attendance entries do not add any salary credit.</p>
      </section>

      {!selectedEmployeeId ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-500">
          Select an employee and month to view their payroll summary.
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500">Loading summary...</div>
      ) : summary ? (
        <>
          <section className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] p-5 text-white shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-violet-100">Total Salary Obtained</p>
                <p className="mt-1 text-4xl font-bold">{formatCurrency(summary.totalSalary)}</p>
                <p className="mt-3 text-sm text-violet-100">{summary.employee.name} · Salary assigned: {formatCurrency(summary.salaryAssigned)}</p>
              </div>
              <div className="rounded-xl bg-white/15 p-3">
                <IndianRupee size={30} aria-hidden="true" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-800">{metric.value}</p>
                    </div>
                    <span className={`rounded-xl p-2 ${metric.background} ${metric.color}`}><Icon size={20} /></span>
                  </div>
                </div>
              );
            })}
          </section>

          {summary.daysPresent === 0 && summary.daysAbsentOrLeave === 0 && (
            <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">No attendance or approved leave records were found for this month.</p>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">Unable to load the monthly summary.</div>
      )}
    </div>
  );
};

export default MonthlySalarySummary;
