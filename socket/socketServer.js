const express = require('express');
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io')

const app= express()
const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors());
app.use(express.json());

let connectedClients = 0;

io.on('connection', (socket) => {
    connectedClients++;
    console.log('A user connected');
    io.emit('clientsCount', connectedClients);

    socket.on('disconnect', () => {
        connectedClients--;
        console.log('A user disconnected');
        io.emit('clientsCount', connectedClients);
    });

    socket.on('createUser', (user) => {
        // Handle user creation logic here
        console.log('User created:', user);
        io.emit('userCreated', user);
    });

    socket.on('updateUser', (user) => {
        // Handle user update logic here
        console.log('User updated:', user);
        io.emit('userUpdated', user);
    });

    socket.on('deleteUser', (userId) => {
        // Handle user deletion logic here
        console.log('User deleted:', userId);
        io.emit('userDeleted', userId);
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});