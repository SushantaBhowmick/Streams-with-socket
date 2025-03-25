import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connect once and use everywhere

export default socket;