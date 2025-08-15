const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

const PORT = process.env.PORT || 8000;

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        console.log(`${name} joined the chat`);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        const otherUsers = Object.values(users).filter(n => n !== name);
        socket.emit('currently-online', otherUsers);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id],
        });
    });

    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
