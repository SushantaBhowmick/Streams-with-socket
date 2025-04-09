import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Connect once and use everywhere

export default socket;