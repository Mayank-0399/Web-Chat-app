const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Serve static files from the root directory (parent folder)
app.use(express.static(path.join(__dirname, '../')));

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 8000;

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

io.on('connection', socket => {
    console.log('A user connected');
    
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

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('left', users[socket.id]);
            delete users[socket.id];
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
