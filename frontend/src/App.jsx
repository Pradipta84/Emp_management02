import { useState, useEffect } from 'react';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import Footer from './components/Footer';
import ActivityFeed from './components/ActivityFeed';
import { getEmployees } from './services/api';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeParts = (date) => {
    const h = (date.getHours() % 12 || 12).toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return { h1: h[0], h2: h[1], m1: m[0], m2: m[1], s1: s[0], s2: s[1], ampm };
  };
  const { h1, h2, m1, m2, s1, s2, ampm } = formatTimeParts(currentTime);

  const handleEdit = (emp) => {
    setEditEmp(emp);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    setEditEmp(null);
    setRefresh(r => r + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditEmp(null);
  };

  const handleExport = async () => {
    try {
      let fileHandle = null;
      // 1. Prompt for save location immediately to capture the synchronous user gesture.
      // This completely bypasses the browser's "Insecure download blocked" warnings.
      if (window.showSaveFilePicker) {
        try {
          fileHandle = await window.showSaveFilePicker({
            suggestedName: 'Employee_Directory.xlsx',
            types: [{
              description: 'Excel Workbook',
              accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
            }],
          });
        } catch (err) {
          // If the user cancelled the save dialog, just abort.
          if (err.name === 'AbortError') return;
          console.warn('showSaveFilePicker failed, falling back to legacy download', err);
        }
      }

      // 2. Fetch all employees for export
      const res = await getEmployees();
      const employees = res.data;

      // Prepare data for Excel
      const exportData = employees.map(emp => {
        let hireDateVal = 'N/A';
        if (emp.hire_date) {
          const dateOnly = emp.hire_date.split('T')[0];
          const parts = dateOnly.split('-');
          if (parts.length === 3) {
            // Use local time to prevent timezone shift issues during Excel export
            hireDateVal = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          } else {
            hireDateVal = dateOnly;
          }
        }

        return {
          ID: emp.id,
          'First Name': emp.first_name,
          'Last Name': emp.last_name,
          Email: emp.email,
          Department: emp.department,
          Position: emp.position,
          Salary: Number(emp.salary) || 0,
          'Hire Date': hireDateVal,
          Status: emp.status
        };
      });

      // Create a new workbook and worksheet
      const wb = window.XLSX.utils.book_new();
      const ws = window.XLSX.utils.json_to_sheet(exportData, { cellDates: true });

      // Add Premium Styling
      const range = window.XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = { c: C, r: R };
          const cell_ref = window.XLSX.utils.encode_cell(cell_address);
          if (!ws[cell_ref]) continue;

          const isHeader = R === 0;
          const isEven = R % 2 === 0;

          // Apply Premium Styling
          ws[cell_ref].s = {
            font: {
              name: 'Segoe UI',
              sz: 12,
              color: { rgb: isHeader ? "FFFFFFFF" : "FF1E293B" }, // White for header, dark slate for data
              bold: isHeader
            },
            fill: {
              // Header: Blue-800. Data: Alternating White and Slate-100
              fgColor: { rgb: isHeader ? "FF1E40AF" : (isEven ? "FFF1F5F9" : "FFFFFFFF") }
            },
            alignment: {
              vertical: "center",
              horizontal: C === 0 || C >= 6 ? "center" : "left",
              wrapText: true
            },
            border: {
              top: { style: "thin", color: { auto: 1 } },
              bottom: { style: isHeader ? "medium" : "thin", color: { auto: 1 } },
              left: { style: "thin", color: { auto: 1 } },
              right: { style: "thin", color: { auto: 1 } }
            }
          };

          // Format Salary column as Currency
          if (R > 0 && C === 6) {
            ws[cell_ref].t = 'n'; // Force number type
            ws[cell_ref].z = '$#,##0.00';
          }

          // Format Hire Date column to exactly dd/mm/yyyy
          if (R > 0 && C === 7 && ws[cell_ref].t === 'd') {
            ws[cell_ref].z = 'dd/mm/yyyy';
          }
        }
      }

      // Add auto-filter for all columns
      ws['!autofilter'] = { ref: ws['!ref'] };

      // Adjust column widths automatically
      const colWidths = [
        { wch: 8 },  // ID
        { wch: 18 }, // First Name
        { wch: 18 }, // Last Name
        { wch: 28 }, // Email
        { wch: 22 }, // Department
        { wch: 22 }, // Position
        { wch: 15 }, // Salary
        { wch: 15 }, // Hire Date
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      // Append the worksheet to the workbook
      window.XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      // 3. Save the file securely
      const excelBuffer = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      if (fileHandle) {
        // Modern approach: write directly to the file the user selected
        const writable = await fileHandle.createWritable();
        await writable.write(data);
        await writable.close();
      } else {
        // Legacy fallback
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Employee_Directory.xlsx');
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          link.remove();
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (err) {
      alert('Error exporting employees to Excel');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="header glass-header">
        <div className="header-content">
          <h1>Employee Management</h1>
          <span className="total-badge">Total Employees: {totalEmployees}</span>
          <span className="time-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: '#818cf8' }}><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M5 3 2 6"></path><path d="m22 6-3-3"></path><path d="M6.38 18.7 4 21"></path><path d="M17.64 18.67 20 21"></path></svg>
            <span key={'h1' + h1} className="flip-time">{h1}</span>
            <span key={'h2' + h2} className="flip-time">{h2}</span>
            <span className="time-sep">:</span>
            <span key={'m1' + m1} className="flip-time">{m1}</span>
            <span key={'m2' + m2} className="flip-time">{m2}</span>
            <span className="time-sep">:</span>
            <span key={'s1' + s1} className="flip-time">{s1}</span>
            <span key={'s2' + s2} className="flip-time">{s2}</span>
            <span key={ampm} className="flip-time ampm-badge">{ampm}</span>
          </span>
        </div>

        <div className="header-actions">
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search employees... or id:1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn btn-premium-export" title="Export to Excel" onClick={handleExport}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export to Excel
          </button>

          <button className="btn btn-green btn-glow" onClick={() => setShowForm(true)}>
            + Add Employee
          </button>

          <button className="btn btn-blue btn-glow" title="Activity History" onClick={() => setIsActivityOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </button>
        </div>
      </div>

      <div className="container">
        <div className="main-content">
          <EmployeeList
            onEdit={handleEdit}
            refresh={refresh}
            onTotalChange={setTotalEmployees}
            searchQuery={searchQuery}
          />
        </div>
        <ActivityFeed isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />

        {showForm && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <EmployeeForm
                employee={editEmp}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;

