// admin/HolidayManagement.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { employeeStyles } from '../../styles';
const HolidayManagement = ({ holidays, setHolidays }) => {
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error('Please fill both fields');
      return;
    }
    setHolidays([...holidays, { id: Date.now(), ...newHoliday }]);
    setNewHoliday({ name: '', date: '' });
    toast.success('Holiday added');
  };

  const handleDeleteHoliday = (id) => {
    setHolidays(holidays.filter(h => h.id !== id));
    toast.success('Holiday removed');
  };

  return (
    <div className={employeeStyles.requests.container}>
      <h1 className={employeeStyles.requests.title}>Holiday Management</h1>
      
      <div className={employeeStyles.requests.form}>
        <h2 className="text-lg font-semibold mb-4">Add New Holiday</h2>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Holiday Name</label>
          <input
            type="text"
            value={newHoliday.name}
            onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
            placeholder="e.g., Diwali, Christmas"
            className={employeeStyles.requests.input}
          />
        </div>
        <div className={employeeStyles.requests.formGroup}>
          <label className={employeeStyles.requests.label}>Date</label>
          <input
            type="date"
            value={newHoliday.date}
            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
            className={employeeStyles.requests.input}
          />
        </div>
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
            <tbody>
              {holidays.map(holiday => (
                <tr key={holiday.id}>
                  <td className={employeeStyles.table.td}>{holiday.name}</td>
                  <td className={employeeStyles.table.td}>{holiday.date}</td>
                  <td className={employeeStyles.table.td}>
                    <button onClick={() => handleDeleteHoliday(holiday.id)} className={employeeStyles.requests.deleteBtn}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HolidayManagement;