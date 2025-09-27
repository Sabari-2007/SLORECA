const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 8200;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session storage (in production, use proper session management)
const sessions = new Map();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/scheduling', require('./routes/scheduling'));
app.use('/api/agenda', require('./routes/agenda'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/followups', require('./routes/followups'));
app.use('/api/summaries', require('./routes/summaries'));

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Socket.io for real-time features
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-meeting', (meetingId) => {
        socket.join(meetingId);
        console.log(`User ${socket.id} joined meeting ${meetingId}`);
    });
    
    socket.on('meeting-update', (data) => {
        socket.to(data.meetingId).emit('meeting-update', data);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Sloreca AI Meeting Buddy running on http://localhost:${PORT}`);
});

module.exports = { app, io, sessions };
