// Connect to the same origin where the page is served
const socket = io();

// DOM elements
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
var audio = new Audio('ting.mp3');

// Function to append messages to the container
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);

    if (position === 'left') {
        audio.play();
    }
};

// Form submit listener
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
});

// Prompt user for name
const name = prompt("Enter your Name to Join");

// Handle currently online users
socket.on('currently-online', (onlineUsers) => {
    onlineUsers.forEach(user => {
        append(`${user} is already online`, 'center');
    });
});

// Emit new user join event
socket.emit('new-user-joined', name);

// Handle user join
socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'center');
});

// Handle receiving messages
socket.on('receive', (data) => {
    append(`${data.name} : ${data.message}`, 'left');
});

// Handle user leave
socket.on('left', (name) => {
    append(`${name} left the chat`, 'center');
});
