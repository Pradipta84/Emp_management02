import { useState, useEffect } from 'react';
import { addEmployee, updateEmployee } from '../services/api';

function EmployeeForm({ employee, onSave, onCancel }) {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: '',
        hire_date: '',
        status: 'active'
    });

    // If editing, fill the form
    useEffect(() => {
        if (employee) {
            setForm({
                ...employee,
                hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : ''
            });
        }
    }, [employee]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (employee) {
                await updateEmployee(employee.id, form);
            } else {
                await addEmployee(form);
            }
            onSave();
        } catch (err) {
            alert('Error saving employee');
        }
    };

    return (
        <div className="form-container">
            <h2 style={{ marginBottom: '20px' }}>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>First Name *</label>
                        <input name="first_name" value={form.first_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Last Name *</label>
                        <input name="last_name" value={form.last_name} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Department *</label>
                        <input name="department" value={form.department} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Position *</label>
                        <input name="position" value={form.position} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Salary *</label>
                        <input type="number" name="salary" value={form.salary} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Hire Date *</label>
                        {/*<input type="date" name="hire_date" value={form.hire_date} onChange={handleChange} required /> */}
                        <input type="date" name="hire_date" value={form.hire_date} onChange={handleChange} required disabled={!!employee} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-green">
                        {employee ? 'Update' : 'Create'}
                    </button>
                    <button type="button" className="btn btn-gray" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EmployeeForm;

