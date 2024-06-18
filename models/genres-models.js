const db = require("../db/connection");

exports.selectGenres = async () => {
  const { rows } = await db.query(`SELECT * FROM genres`);
  if (!rows) {
    return Promise.reject({ code: 404, msg: "Genres Not Found!" });
  }
  return rows;
};

exports.checkGenreExists = async (genre) => {
  if (!genre) return Promise.resolve;
  const { rows } = await db.query(`SELECT * FROM genres WHERE genre=$1`, [
    genre,
  ]);
  if (!rows[0]) {
    return Promise.reject({ code: 404, msg: "Genre Not Found!" });
  }
};

exports.insertGenre = async ({ genre }) => {
  if (!genre) {
    return Promise.reject({ code: 400, msg: "Missing Required Fields!" });
  }
  const { rows } = await db.query(
    `INSERT INTO genres (genre) VALUES ($1) RETURNING *`,
    [genre]
  );
  return rows[0];
};
