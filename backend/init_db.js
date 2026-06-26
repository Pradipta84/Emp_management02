const pool = require('./config/db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action VARCHAR(255) NOT NULL,
                user VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                timestamp BIGINT NOT NULL
            );
        `);
        console.log("Table 'activities' created or already exists.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
}
createTable();
