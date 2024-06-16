const db = require("../db/connection");

exports.selectGenres = async () => {
  const { rows } = await db.query(`SELECT * FROM genres`);
  if (!rows) {
    return Promise.reject({ code: 404, msg: "Genres Not Found!" });
  }
  return rows;
};
