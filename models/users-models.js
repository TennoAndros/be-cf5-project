const db = require("../db/connection");

exports.selectUsers = async () => {
  const { rows } = await db.query(`SELECT * FROM users`);
  return rows;
};

exports.selectUserByUsername = async (username) => {
  const { rows } = await db.query(`SELECT * FROM users WHERE username=$1`, [
    username,
  ]);
  if (!rows[0]) {
    return Promise.reject({
      code: 404,
      msg: "User either doesn't exist or you don't have access to their profile",
    });
  }
  return rows[0];
};

exports.insertUser = async ({
  email,
  username,
  password,
  first_name,
  last_name,
  avatar_url,
}) => {
  if (!email || !username || !password || !first_name || !last_name) {
    return Promise.reject({ code: 400, msg: "Missing Required Fields!" });
  }
  const { rows } = await db.query(
    `INSERT INTO users (email, username, password, first_name, last_name, avatar_url) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *`,
    [email, username, password, first_name, last_name, avatar_url]
  );
  return rows[0];
};

exports.deleteUserByUsername = async (username) => {
  const { rows } = await db.query(
    `DELETE FROM users WHERE username=$1 RETURNING *`,
    [username]
  );
  if (rows.length === 0)
    return Promise.reject({
      code: 404,
      msg: "User doesn't exist!",
    });
};

exports.checkUserExists = async (username) => {
  const { rows } = await db.query(
    `SELECT username FROM users WHERE username=$1`,
    [username]
  );
  if (rows[0]) {
    return Promise.reject({ code: 409, msg: "User Already Exists!" });
  }
};
