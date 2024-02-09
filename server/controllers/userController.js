const db = require("../config/db");

exports.getAllUsers = (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
};

// Implement other controller methods for CRUD operations
