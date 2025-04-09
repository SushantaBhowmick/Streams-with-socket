const express = require('express')
const pool = require('./db');
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
const http = require('http')
const {Server} = require('socket.io')
// const addUser = require('./constant/addUser');
// const createUserTable = require('./constant/createTable');
// addUser(10)
// createUserTable();


const app = express();
const PORT =4000;
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*",
    }
});


//middleware
app.use(express.json())
app.use(
    cors({
      origin: "http://localhost:3000", // Allow requests from this origin
      methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
      allowedHeaders: ["Content-Type"], // Allowed headers
    })
  );

//routes
app.use('/api',userRoutes)


//func



io.on('connection', (socket) => {
  console.log('a user connected');

    let offset = 0;
    const chunkSize = 10000;

     async function streamData() {
      try {
        const query = `SELECT * FROM users LIMIT ${chunkSize} OFFSET ${offset}`;
        const result = await pool.query(query);
        const rows = result.rows;

        if (rows.length > 0) {
          socket.emit("dataChunk", rows);
          offset += chunkSize;
          setTimeout(streamData, 2000);
        } else {
          socket.emit("endOfData");
        }
      } catch (error) {
        console.error("Error while streaming data:", error);
        socket.emit("error", { message: "Failed to load data." });
      }
    };

    streamData();

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT,()=>{
    console.log(`Server is working on port ${PORT}`)
})