const io = require('socket.io')(8000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});   

const users = {};                       

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
     
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
    socket.on('disconnect', message=>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});