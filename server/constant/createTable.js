const pool = require("../db");

const createUserTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS stream_users(
    id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    try {
        await pool.query(query);
        console.log('✅ Stream Users table created successfully');
        
    } catch (error) {
        console.error('❌ Error creating users table:', err);
    }
    finally{
        pool.end()
    }
};


module.exports = createUserTable;