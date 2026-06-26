const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all employees
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET one employee
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE employee
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, department, position, salary, hire_date, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO employees (first_name, last_name, email, phone, department, position, salary, hire_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, department, position, salary, hire_date, status || 'active']
        );
        const io = req.app.get('io');
        if (io) {
            const newAct = {
                action: 'Admin hired new employee',
                user: `${first_name} ${last_name}`,
                type: 'hire',
                timestamp: Date.now()
            };
            try {
                const [actResult] = await pool.query(
                    'INSERT INTO activities (action, user, type, timestamp) VALUES (?, ?, ?, ?)',
                    [newAct.action, newAct.user, newAct.type, newAct.timestamp]
                );
                newAct.id = actResult.insertId;
                io.emit('activity', newAct);
            } catch (err) {
                console.error('Error inserting activity:', err);
            }
        }
        res.status(201).json({ id: result.insertId, message: 'Employee created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE employee
router.put('/:id', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, department, position, salary, hire_date, status } = req.body;
        
        const [oldRows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        if (oldRows.length === 0) return res.status(404).json({ message: 'Not found' });
        const oldData = oldRows[0];

        const [result] = await pool.query(
            'UPDATE employees SET first_name=?, last_name=?, email=?, phone=?, department=?, position=?, salary=?, hire_date=?, status=? WHERE id=?',
            [first_name, last_name, email, phone, department, position, salary, hire_date, status, req.params.id]
        );
        
        const io = req.app.get('io');
        if (io) {
            let actionText = 'Admin updated details for';
            const changes = [];
            if (oldData.salary != salary) changes.push('salary');
            if (oldData.position != position) changes.push('position');
            if (oldData.department != department) changes.push('department');
            if (oldData.status != status) changes.push('status');
            
            if (changes.length === 1) {
                actionText = `Admin updated ${changes[0]} for`;
            }

            const newAct = {
                action: actionText,
                user: `"${first_name} ${last_name}"`,
                type: 'update',
                timestamp: Date.now()
            };
            try {
                const [actResult] = await pool.query(
                    'INSERT INTO activities (action, user, type, timestamp) VALUES (?, ?, ?, ?)',
                    [newAct.action, newAct.user, newAct.type, newAct.timestamp]
                );
                newAct.id = actResult.insertId;
                io.emit('activity', newAct);
            } catch (err) {
                console.error('Error inserting activity:', err);
            }
        }
        res.json({ message: 'Employee updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
        
        const io = req.app.get('io');
        if (io) {
            const newAct = {
                action: 'Admin deleted employee',
                user: `ID: ${req.params.id}`,
                type: 'delete',
                timestamp: Date.now()
            };
            try {
                const [actResult] = await pool.query(
                    'INSERT INTO activities (action, user, type, timestamp) VALUES (?, ?, ?, ?)',
                    [newAct.action, newAct.user, newAct.type, newAct.timestamp]
                );
                newAct.id = actResult.insertId;
                io.emit('activity', newAct);
            } catch (err) {
                console.error('Error inserting activity:', err);
            }
        }
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

