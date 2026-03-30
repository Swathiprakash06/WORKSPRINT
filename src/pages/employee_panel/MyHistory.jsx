import React from "react";
import { employeeStyles } from "../../styles";

const MyHistory = ({ attendanceLogs = [], requests = [] }) => {
  return (
    <div className={employeeStyles.history.container}>
      <h1 className={employeeStyles.history.title}>My History</h1>

      {/* Attendance Logs */}
      <div className={employeeStyles.history.section}>
        <h2 className={employeeStyles.history.sectionTitle}>
          Attendance Logs
        </h2>

        <div className={employeeStyles.history.tableContainer}>
          <table className={employeeStyles.history.table}>
            <thead>
              <tr>
                <th className={employeeStyles.history.th}>Date</th>
                <th className={employeeStyles.history.th}>Status</th>
                <th className={employeeStyles.history.th}>Check-in</th>
                <th className={employeeStyles.history.th}>Check-out</th>
              </tr>
            </thead>

            <tbody>
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className={employeeStyles.history.td}>
                      {log.date}
                    </td>

                    <td
                      className={employeeStyles.history.statusCell(
                        log.status
                      )}
                    >
                      {log.status}
                    </td>

                    <td className={employeeStyles.history.td}>
                      {log.checkIn || "-"}
                    </td>

                    <td className={employeeStyles.history.td}>
                      {log.checkOut || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No attendance data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requests */}
      <div className={employeeStyles.history.section}>
        <h2 className={employeeStyles.history.sectionTitle}>
          Requests Status
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
                requests.map((req) => (
                  <tr key={req.id}>
                    <td className={employeeStyles.history.td}>
                      {req.date}
                    </td>

                    <td className={employeeStyles.history.td}>
                      {req.type}
                    </td>

                    <td className={employeeStyles.history.td}>
                      {req.reason}
                    </td>

                    <td
                      className={employeeStyles.history.statusCell(
                        req.status
                      )}
                    >
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
        </div>
      </div>
    </div>
  );
};

export default MyHistory;