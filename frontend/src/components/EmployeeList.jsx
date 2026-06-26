import { useState, useEffect, useRef } from 'react';
import { getEmployees, deleteEmployee } from '../services/api';

function EmployeeList({ onEdit, refresh, onTotalChange, searchQuery }) {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [deleteCountdown, setDeleteCountdown] = useState(0);
    const tableRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!tableRef.current) return;
        const rect = tableRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Tilt amount: max 3 degrees
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;

        tableRef.current.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        tableRef.current.style.boxShadow = `0 15px 40px rgba(32, 32, 32, 0.6)`;
    };

    const handleMouseLeave = () => {
        if (!tableRef.current) return;
        tableRef.current.style.transform = `perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        tableRef.current.style.boxShadow = `0 8px 32px rgba(32, 32, 32, 0.4)`;
    };

    const handleMouseDown = () => {
        if (!tableRef.current) return;
        const currentTransform = tableRef.current.style.transform;
        if (currentTransform.includes('scale3d')) {
            tableRef.current.style.transform = currentTransform.replace('scale3d(1.01, 1.01, 1.01)', 'scale3d(0.99, 0.99, 0.99)');
        }
    };

    const handleMouseUp = (e) => {
        handleMouseMove(e);
    };

    useEffect(() => {
        let timer;
        if (employeeToDelete && deleteCountdown > 0) {
            timer = setTimeout(() => {
                setDeleteCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [employeeToDelete, deleteCountdown]);

    useEffect(() => {
        loadEmployees();
    }, [refresh]);

    const loadEmployees = async () => {
        try {
            const res = await getEmployees();
            setEmployees(res.data);
            if (onTotalChange) {
                onTotalChange(res.data.length);
            }
        } catch (err) {
            alert('Error loading employees');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (emp) => {
        setEmployeeToDelete(emp);
        setDeleteCountdown(10);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;
        try {
            await deleteEmployee(employeeToDelete.id);
            loadEmployees();
        } catch (err) {
            alert('Error deleting employee');
        } finally {
            setEmployeeToDelete(null);
            setDeleteCountdown(0);
        }
    };

    const cancelDelete = () => {
        setEmployeeToDelete(null);
        setDeleteCountdown(0);
    };

    if (loading) return <div className="loading">Loading employees...</div>;

    const filteredEmployees = employees.filter(emp => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase().trim();

        if (query.startsWith('id:')) {
            const searchId = query.substring(3).trim();
            if (searchId) {
                return String(emp.id) === searchId;
            }
        }

        return (
            (emp.first_name && emp.first_name.toLowerCase().includes(query)) ||
            (emp.last_name && emp.last_name.toLowerCase().includes(query)) ||
            (emp.email && emp.email.toLowerCase().includes(query)) ||
            (emp.department && emp.department.toLowerCase().includes(query)) ||
            (emp.position && emp.position.toLowerCase().includes(query))
        );
    });

    return (
        <>
            <table
                className="table"
                ref={tableRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Salary</th>
                        <th>Hire Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmployees.map((emp) => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.first_name} {emp.last_name}</td>
                            <td>{emp.email}</td>
                            <td>{emp.department}</td>
                            <td>{emp.position}</td>
                            <td>${emp.salary}</td>
                            <td>{emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</td>
                            <td>
                                <span className={emp.status === 'active' ? 'status-active' : 'status-inactive'}>
                                    {emp.status}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                                    <button className="btn btn-blue" onClick={() => onEdit(emp)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                    <button className="btn btn-red" onClick={() => handleDeleteClick(emp)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {employeeToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content glass-modal" style={{ maxWidth: '400px', textAlign: 'center', margin: 'auto' }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>Confirm Deletion</h3>
                        <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                            Employee: <strong>{employeeToDelete.first_name} {employeeToDelete.last_name}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                className={`btn ${deleteCountdown === 0 ? 'btn-red' : 'btn-gray'}`}
                                disabled={deleteCountdown > 0}
                                onClick={confirmDelete}
                            >
                                {deleteCountdown > 0 ? `Ok (${deleteCountdown})` : 'Ok'}
                            </button>
                            <button className="btn btn-blue" onClick={cancelDelete}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EmployeeList;

