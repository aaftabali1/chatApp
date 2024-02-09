const { chatsTable } = require("../config/constants");

async function getUserChats({ sender, receiver }) {
  try {
    const response = await new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${chatsTable} WHERE senderId = ? OR receiverId = ?`;
      connection.query(query, [sender, receiver], (err, results) => {
        if (err) reject(new Error(err.message));
        resolve(results);
      });
    });
    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getUserChats,
};
