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

  let currentTimeout = null;
  let isStreaming = false;
  let offset = 0;
  const chunkSize = 10;

  async function streamData(id=null) {
    if (!isStreaming) return; // exit if stream was stopped

    try {
      let query = `SELECT * FROM users LIMIT ${chunkSize} OFFSET ${offset}`;
      if(id){

        query = `SELECT * FROM users where id>0 AND id<100 LIMIT ${chunkSize} OFFSET ${offset}`
      }
      const result = await pool.query(query);
      const rows = result.rows;

      if (rows.length > 0) {
        socket.emit("dataChunk", rows);
        offset += chunkSize;
        currentTimeout = setTimeout(()=>streamData(id), 2000); // Save timeout ID
      } else {
        socket.emit("endOfData");
        isStreaming = false;
      }
    } catch (error) {
      console.error("Error while streaming data:", error);
      socket.emit("error", { message: "Failed to load data." });
      isStreaming = false;
    }
  }

  // Start streaming immediately when connected
  isStreaming = true;
  offset = 0;
  streamData();

  // Handle client-triggered stop
  socket.on("trigger", (id) => {
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    isStreaming = false;
    socket.emit("streamStopped");
    console.log("Stream stopped by client.");
    
    // Step 2: Reset and restart with new filter
    offset = 0;
    isStreaming = true;
    streamData(id); // e.g., id = 100 for `id < 100`

    
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    // isStreaming = false;
  });
});


server.listen(PORT,()=>{
    console.log(`Server is working on port ${PORT}`)
})