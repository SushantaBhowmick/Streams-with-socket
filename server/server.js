const express = require('express')
const pool = require('./db');
const addUser = require('./constant/addUser');
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
// const createUserTable = require('./constant/createTable');
// addUser(50000)

const app = express();
const PORT =4000;


//middleware
app.use(express.json())
app.use(cors())

//routes
app.use('/api',userRoutes)

app.listen(PORT,()=>{
    console.log(`Server is working on port ${PORT}`)
})