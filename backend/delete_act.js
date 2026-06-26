const pool = require('./config/db');

async function deleteActivity() {
    try {
        const [result] = await pool.query(
            `DELETE FROM activities WHERE action = 'Admin updated details for' AND user = '"Test User2"'`
        );
        console.log(`Deleted ${result.affectedRows} row(s)`);
        
        // Also delete if user was stored without quotes just in case
        const [result2] = await pool.query(
            `DELETE FROM activities WHERE action = 'Admin updated details for' AND user = 'Test User2'`
        );
        console.log(`Deleted ${result2.affectedRows} row(s) without quotes`);
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
deleteActivity();
