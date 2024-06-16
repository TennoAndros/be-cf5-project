const db = require("../db/connection");
const format = require("pg-format");

exports.selectBooks = async () => {
  const { rows } = await db.query(
    `SELECT * , CAST(books.rating AS FLOAT) FROM books`
  );
  if (!rows) {
    return Promise.reject({ code: 404, msg: "Books Not Found!" });
  }
  return rows;
};

exports.selectBookById = async (id) => {
  const query = format(
    `SELECT books.*, COUNT(reviews.review_id)::int AS review_count, COALESCE(CAST(books.rating AS FLOAT), 0.0) AS rating FROM books 
     LEFT JOIN reviews ON books.book_id = reviews.book_id WHERE books.book_id = %L GROUP BY books.book_id`,
    id
  );

  const { rows } = await db.query(query);

  if (rows.length === 0) {
    return Promise.reject({
      code: 404,
      msg: "Book Not Found!",
    });
  }

  return rows[0];
};

exports.checkBookExists = async (bookId) => {
  const { rows } = await db.query(
    `SELECT book_id FROM books WHERE book_id=$1`,
    [bookId]
  );
  if (!rows[0]) {
    return Promise.reject({ code: 404, msg: "Book Not Found!" });
  }
};