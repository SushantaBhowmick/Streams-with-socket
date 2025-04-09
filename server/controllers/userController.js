const pool = require("../db");
const QueryStream = require("pg-query-stream");
const Cursor = require("pg-cursor");

// const JSONStream = require('JSONStream')

exports.SimplegetUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    console.log(result.rows);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Catch error:", error);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

exports.getUsers = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const client = await pool.connect();
    const stream = client.query(new QueryStream("SELECT * FROM users"));

    const rowBuffer = [];
    let streamDone = false;

    stream.on("data", (row) => {
      rowBuffer.push(row);
    });

    stream.on("end", () => {
      streamDone = true;
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error" });
      } else {
        res.end(JSON.stringify({ error: "Stream error" }));
      }
      client.release();
    });

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Stream chunks every 100ms
    (async () => {
      const CHUNK_SIZE = 100;
      const INTERVAL = 1000;

      while (!streamDone || rowBuffer.length > 0) {
        if (
          rowBuffer.length >= CHUNK_SIZE ||
          (streamDone && rowBuffer.length > 0)
        ) {
          const chunk = rowBuffer.splice(0, CHUNK_SIZE);
          res.write(JSON.stringify(chunk) + "\n"); // Send as small array
        }
        await sleep(INTERVAL);
      }

      res.end();
      client.release();
    })();
  } catch (error) {
    console.error("Unexpected error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Unexpected server error" });
    } else {
      res.end(JSON.stringify({ error: "Unexpected server error" }));
    }
  }
};

exports.getUsersLimited = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100); // default limit
    const client = await pool.connect();

    const query = new QueryStream("SELECT * FROM users LIMIT $1", [limit]);
    const stream = client.query(query);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    });

    let isFirst = true;
    res.write("[");

    stream.on("data", (row) => {
      res.write((isFirst ? "" : ",") + JSON.stringify(row));
      isFirst = false;
    });

    stream.on("end", () => {
      res.write("]");
      res.end();
      client.release();
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end(JSON.stringify({ error: "Stream error" }));
      client.release();
    });
  } catch (error) {
    console.error("Catch error:", error);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

exports.getUsersStreamAll = async (req, res) => {
  try {
    const client = await pool.connect();

    const query = new QueryStream("SELECT * FROM users");
    const stream = client.query(query);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    });

    res.flushHeaders();

    let isFirst = true;
    res.write("[");

    stream.on("data", (row) => {
      res.write((isFirst ? "" : ",") + JSON.stringify(row));
      isFirst = false;
    });

    stream.on("end", () => {
      res.write("]");
      res.end();
      client.release();
      console.log("✅ Stream finished successfully");
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end(JSON.stringify({ error: "Stream error" }));
      client.release();
    });
  } catch (error) {
    console.error("Catch error:", error);
    res.status(500).json({ error: "Unexpected server error" });
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
    if (!id) {
      return res.status(400).json({ error: "id is  required" });
    }

    const userExists = await pool.query(
      "SELECT * FROM stream_users WHERE id = $1",
      [id]
    );
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
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
      return res
        .status(400)
        .json({
          error: "At least one field (name, email, or password) is required",
        });
    }

    const userExists = await pool.query(
      "SELECT * FROM stream_users WHERE id = $1",
      [id]
    );
    if (userExists.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
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

    res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
};

exports.check = async (req, res) => {
  return res.status(200).json({
    msg: "Welcome User",
  });
};

exports.stream_data = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  const client = await pool.connect();
  const query = "SELECT * FROM users";
  const chunkSize = 100;

  try {
    const cursor = client.query(new Cursor(query));

    function readChunk() {
      cursor.read(chunkSize, (err, rows) => {
        if (err) {
          console.error("Error reading from cursor", err);
          res.status(500).send("Error while streaming data");
          cursor.close(() => client.release());
          return;
        }

        if (rows.length === 0) {
          // No more data
          res.end();
          cursor.close(() => client.release());
          return;
        }

        // Send the chunk
        res.write(JSON.stringify(rows) + "\n");

        // Read next chunk
        setImmediate(readChunk); // Avoid blocking event loop
      });
    }

    readChunk(); // Start reading
  } catch (err) {
    console.error("Unexpected error", err);
    res.status(500).send("Unexpected error");
    client.release();
  }
};

const socketUsers = async (socket,offset,chunkSize) => {
  try {
    const query = `SELECT * FROM users LIMIT ${chunkSize} OFFSET ${offset}`;
    const rows = await pool.query(query);
    // console.log(rows.rows)

    if (rows.length > 0) {
      // Emit the current chunk
      socket.emit("dataChunk", rows);

      // Increase offset for the next batch
      offset += chunkSize;

      // Continue streaming the next chunk
      // Use setImmediate to avoid blocking; setTimeout can also be used
      setImmediate(streamData);
    } else {
      // If no more rows, notify the client
      socket.emit("endOfData");
    }
  } catch (error) {
    console.error("Error while streaming data:", error);
    socket.emit("error", { message: "Failed to load data." });
  }
};
