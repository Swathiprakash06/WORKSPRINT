import React, { useEffect } from "react";
import { employeeStyles } from "../../styles";
import { formatDate, formatTime } from "../../utils/dateUtils";
import Pagination from '../../components/Pagination';

const MyHistory = ({ attendanceLogs = [], requests = [] }) => {
  const [attendancePage, setAttendancePage] = React.useState(1);
  const [requestsPage, setRequestsPage] = React.useState(1);
  const pageSize = 10;
  const pagedAttendanceLogs = [...attendanceLogs].reverse().slice((attendancePage - 1) * pageSize, attendancePage * pageSize);
  const pagedRequests = [...requests].reverse().slice((requestsPage - 1) * pageSize, requestsPage * pageSize);
  
  // Debug: Log when props change
  useEffect(() => {
    console.log('Attendance Logs updated:', attendanceLogs);
    console.log('Requests updated:', requests);
  }, [attendanceLogs, requests]);

  return (
    <div className={employeeStyles.history.container}>
      <h1 className={employeeStyles.history.title}>My History</h1>

      {/* Attendance Logs */}
      <div className={employeeStyles.history.section}>
        <h2 className={employeeStyles.history.sectionTitle}>
          Attendance Logs ({attendanceLogs.length})
        </h2>

        <div className={employeeStyles.history.tableContainer}>
          <table className={employeeStyles.history.table}>
            <thead>
              <tr>
                <th className={employeeStyles.history.th}>Date</th>
                <th className={employeeStyles.history.th}>Status</th>
                <th className={employeeStyles.history.th}>Hours</th>
                <th className={employeeStyles.history.th}>Check-in</th>
                <th className={employeeStyles.history.th}>Check-out</th>
                <th className={employeeStyles.history.th}>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.length > 0 ? (
                pagedAttendanceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className={employeeStyles.history.td}>{formatDate(log.date)}</td>
                    <td className={employeeStyles.history.statusCell(log.status)}>
                      {log.status || (log.checkInTime ? "present" : "absent")}
                      {log.markedByHr && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">HR Verified</span>
                      )}
                    </td>
                    <td className={employeeStyles.history.td}>{log.totalHours != null ? `${log.totalHours}h` : '—'}</td>
                    <td className={employeeStyles.history.td}>{formatTime(log.checkInTime || log.checkIn) || "-"}</td>
                    <td className={employeeStyles.history.td}>{formatTime(log.checkOutTime || log.checkOut) || "-"}</td>
                    <td className={employeeStyles.history.td}>{log.hrNote?.trim() || (log.markedByHr ? 'Marked by HR' : '—')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    No attendance data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={attendancePage} pageSize={pageSize} total={attendanceLogs.length} onPageChange={setAttendancePage} />
        </div>
      </div>

      {/* Requests */}
      <div className={employeeStyles.history.section}>
        <h2 className={employeeStyles.history.sectionTitle}>
          Requests Status ({requests.length})
        </h2>

        <div className={employeeStyles.history.tableContainer}>
          <table className={employeeStyles.history.table}>
            <thead>
              <tr>
                <th className={employeeStyles.history.th}>Date</th>
                <th className={employeeStyles.history.th}>Type</th>
                <th className={employeeStyles.history.th}>Reason</th>
                <th className={employeeStyles.history.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                pagedRequests.map((req) => (
                  <tr key={req.id}>
                    <td className={employeeStyles.history.td}>{formatDate(req.date)}</td>
                    <td className={employeeStyles.history.td}>{req.type}</td>
                    <td className={employeeStyles.history.td}>{req.reason}</td>
                    <td className={employeeStyles.history.statusCell(req.status)}>
                      {req.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={requestsPage} pageSize={pageSize} total={requests.length} onPageChange={setRequestsPage} />
        </div>
      </div>
    </div>
  );
};

export default MyHistory;