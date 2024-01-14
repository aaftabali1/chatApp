const mysql = require("mysql2");

// create a new MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "chat",
});
// connect to the MySQL database
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
  } else {
    console.log("Connected to MySQL database!");
  }
});

async function executeQuery(sql, values) {
  try {
    const [results, fields] = await connection.promise().query(sql, values);
    return results;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

function closeConnection() {
  connection.end((err) => {
    if (err) {
      console.error("Error closing the MySQL connection:", err);
    }
    console.log("MySQL connection closed");
  });
}

module.exports = { connection, closeConnection, executeQuery };
