const db = require("./db");

const time = new Date();

const getUser = (username) => {
  // Example query
  const sql = "SELECT * FROM users WHERE username = ?";

  // Use the executeQuery function
  db.executeQuery(sql, [username], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      db.closeConnection();
      return error;
      // Handle the error appropriately
    } else {
      db.closeConnection();
      return results;
      // Process the results as needed
    }

    // Don't forget to close the connection when done
  });
};

module.exports = { getUser };
