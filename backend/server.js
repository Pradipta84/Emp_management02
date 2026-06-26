const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
const PORT = process.env.PORT || 5000;

const pool = require('./config/db');

// Ensure activities table exists
pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        user VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        timestamp BIGINT NOT NULL
    )
`).catch(console.error);

// Clean up specific test activity requested by user
pool.query(`DELETE FROM activities WHERE action = 'Admin updated details for' AND user = '"Test User2"'`).catch(console.error);

// Set io in app so routes can access it
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', require('./routes/employees'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Employee API is running' });
});

// Removed one-time mock events


io.on('connection', async (socket) => {
    console.log('A client connected:', socket.id);
    
    try {
        const [rows] = await pool.query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 10');
        socket.emit('initial_activities', rows);
        
        // Emit one-time real-time sync success message directly to the client
        setTimeout(() => {
            const syncAct = {
                id: 'sync-' + Date.now(),
                action: 'Database sync',
                user: 'successful',
                type: 'system',
                timestamp: Date.now()
            };
            socket.emit('activity', syncAct);
        }, 500);

    } catch (error) {
        console.error('Error fetching activities:', error);
        socket.emit('initial_activities', []);
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

