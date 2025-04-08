const pool = require('../db');

const getRandomName = () => {
  const firstNames = [
    "John",
    "Jane",
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Emma",
    "Frank",
  ];
  const lastNames = [
    "Smith",
    "Doe",
    "Johnson",
    "Brown",
    "Taylor",
    "Anderson",
    "Wilson",
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
    lastNames[Math.floor(Math.random() * lastNames.length)]
  }`;
};

// Function to generate a random email
const getRandomEmail = (name) => {
  const domains = ["gmail.com", "yahoo.com", "hotmail.com", "example.com"];
  return `${name.toLowerCase().replace(" ", "")}${Math.floor(
    Math.random() * 1000
  )}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const addUser = async (count) => {
  try {
    for (let i = 0; i < count; i++) {
      const name = getRandomName();
      const email = getRandomEmail(name+i);
      const password = "password";

      const query = `insert into stream_users (name,email,password) values ($1,$2,$3) returning *`;
      const values = [name, email, password];

      const res = await pool.query(query, values);
      // console.log(`✅ User added:`, res.rows[0]);
    }
    return {
      message: `${count} users added successfully`,
    };
  } catch (err) {
    console.error("❌ Error inserting users:", err);
  } finally {
    pool.end();
  }
};
module.exports = addUser;
