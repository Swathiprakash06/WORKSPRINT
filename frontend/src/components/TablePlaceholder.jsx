import React from 'react';

const TablePlaceholder = ({ columns = 4, rows = 3, showMessage = false, message = 'No entries', useTbody = false }) => {
  const cols = Array.from({ length: columns });
  const r = Array.from({ length: rows });

  if (showMessage) {
    if (useTbody) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
              {message}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tr>
        <td colSpan={columns} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
          {message}
        </td>
      </tr>
    );
  }

  const rowsContent = r.map((_, ri) => (
    <tr key={ri}>
      {cols.map((__, ci) => (
        <td key={ci} style={{ padding: '12px' }}>
          <div style={{ height: 14, width: '60%', background: 'linear-gradient(90deg,#eee,#f5f5f5)', borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  ));

  if (useTbody) {
    return <tbody>{rowsContent}</tbody>;
  }

  return <>{rowsContent}</>; 
};

export default TablePlaceholder;
