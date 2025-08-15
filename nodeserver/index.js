const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Create Socket.IO server with CORS enabled
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {};

// Serve all frontend files (index.html, css, js, images)
app.use(express.static(__dirname));

// Handle Socket.IO connections
io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        console.log(`${name} joined the chat`);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);

        // Send list of currently online users (excluding the new one)
        const otherUsers = Object.values(users).filter(n => n !== name);
        socket.emit('currently-online', otherUsers);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id]
        });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

// Use Render's provided port or default to 8000 locally
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
