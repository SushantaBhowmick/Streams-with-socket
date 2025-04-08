const pool = require("../db");
const QueryStream = require('pg-query-stream')
// const JSONStream = require('JSONStream')

exports.getUsers = async (req, res) => {
  try {
  const query = new QueryStream('SELECT * FROM stream_users');
    const stream = await pool.query(query);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Connection', 'keep-alive');
    res.write('[');
    let isFirst = true;

    stream.on('data',(row)=>{
      if(!isFirst){
        res.write(',');
      }else{
        isFirst = false;
      }
      res.write(JSON.stringify(row))
    });

    stream.on('end',()=>{
      res.write(']');
      res.end();
      pool.release();
    })

    stream.on('error',(err)=>{
      console.log('Stream error:',err);
      res.status(500).json({error:'Error fetching data from database'})
      pool.release();
    })

    res.status(200).json({
      result: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

exports.createUsers = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = `INSERT INTO stream_users (name,email,password) VALUES ($1,$2,$3) RETURNING *`;
    const values = [name, email, password];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id ) {
      return res.status(400).json({ error: "id is  required" });
    }

    const userExists = await pool.query('SELECT * FROM stream_users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }


    res.status(201).json({
      message: "User created successfully",
      user: userExists.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

// Good way
// exports.updateUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const { id } = req.params;

//     // Validate input
//     if (!name && !email && !password)
//       return res.status(400).json({ error: "At least one field is required" });

//     const userExists = await pool.query(`SELECT * FROM users WHERE id=$1`, [
//       id,
//     ]);

//     if (userExists.rows.lengh === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const fields = [];
//     const values = [];
//     let queryIndex = 1;

//     if (name) {
//       fields.push(`name=$${queryIndex}`);
//       values.push(name);
//       queryIndex++;
//     }
//     if (email) {
//       fields.push(`email = $${queryIndex}`);
//       values.push(email);
//       queryIndex++;
//     }
//     if (password) {
//       fields.push(`password = $${queryIndex}`);
//       values.push(password);
//       queryIndex++;
//     }
//     // Ensure there is something to update
//     if (fields.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "No valid fields provided for update" });
//     }

//     // Final update query
//     const query = `UPDATE users SET ${fields.join(
//       ", "
//     )} WHERE id = $${queryIndex} RETURNING *`;
//     values.push(id);

//     // Execute update query
//     const result = await pool.query(query, values);

//     res.status(201).json({
//       message: "User updated successfully",
//       user: result.rows[0],
//     });
//   } catch (error) {
//     res.status(500).json({
//       error,
//     });
//   }
// };


exports.updateUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        // Ensure at least one field is provided
        if (!name && !email && !password) {
            return res.status(400).json({ error: 'At least one field (name, email, or password) is required' });
        }

        const userExists = await pool.query('SELECT * FROM stream_users WHERE id = $1', [id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update only provided fields
        const result = await pool.query(
            `UPDATE stream_users SET 
                name = COALESCE($1, name), 
                email = COALESCE($2, email), 
                password = COALESCE($3, password) 
             WHERE id = $4 RETURNING *`,
            [name || null, email || null, password || null, id]
        );

        res.json({ message: 'User updated successfully', user: result.rows[0] });
      
    } catch (error) {
      res.status(500).json({
        error,
      });
    }
  };