const pool = require('./config/db');

async function createEmployeesTable() {
    try {
        console.log("Connecting to the database...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(100),
                phone VARCHAR(20),
                department VARCHAR(100),
                position VARCHAR(100),
                salary DECIMAL(10,2),
                hire_date DATE,
                status VARCHAR(20) DEFAULT 'active'
            );
        `);
        console.log("SUCCESS! Table 'employees' has been created in your Aiven database.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table. Check your connection details:", err);
        process.exit(1);
    }
}

createEmployeesTable();
