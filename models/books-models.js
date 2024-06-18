const db = require("../db/connection");
const format = require("pg-format");

exports.selectBooks = async (
  genre,
  sort_by = "title",
  order = "DESC",
  limit = 10,
  p = 1
) => {
  const acceptedSortBy = [
    "title",
    "author",
    "genre",
    "avg_rating",
    "review_count",
  ];

  if (!acceptedSortBy.includes(sort_by))
    return Promise.reject({
      code: 400,
      msg: "Please enter a valid sort order!",
    });

  if (order.toLowerCase() !== "desc" && order.toLowerCase() !== "asc")
    return Promise.reject({
      code: 400,
      msg: "Please enter a valid order. Order should be ASC(ascending) or DESC(descending)",
    });

  if (Number.isNaN(Number(limit))) {
    return Promise.reject({
      code: 400,
      msg: "Please enter a valid limit. Limit should be a number!",
    });
  }

  if (Number.isNaN(Number(p))) {
    return Promise.reject({
      code: 400,
      msg: "Please enter a valid p. P should be a number!",
    });
  }

  let query = `SELECT books.*, COUNT(reviews.book_id)::int AS review_count, COALESCE(ROUND(AVG(reviews.rating)::numeric, 2)::float, 0.0) AS avg_rating FROM books LEFT JOIN reviews ON books.book_id=reviews.book_id`;
  let offset = (p - 1) * limit;

  limit = limit == "0" ? `ALL` : limit;

  const queryArr = [sort_by, order.toLowerCase(), limit, offset];

  if (genre) {
    query += ` WHERE books.genre=%L GROUP BY books.book_id ORDER BY %I %s LIMIT %s OFFSET %L`;
    queryArr.unshift(genre);
  } else {
    query += ` GROUP BY books.book_id ORDER BY %I %s LIMIT %s OFFSET %L`;
  }

  const limitlessArr = [];

  let limitlessQuery = "SELECT * FROM books";

  if (genre) {
    limitlessQuery += " WHERE books.genre=$1";
    limitlessArr.push(genre);
  }

  const formattedQuery = format(query, ...queryArr);

  const [booksResult, limitlessBooksResult] = await Promise.all([
    db.query(formattedQuery),
    db.query(limitlessQuery, limitlessArr),
  ]);

  const { rows: books } = booksResult;
  const { rows: limitlessBooks } = limitlessBooksResult;
  const total_count = limitlessBooks.length;

  if (
    Math.ceil(total_count / limit) > 0 &&
    p > Math.ceil(total_count / limit)
  ) {
    return Promise.reject({
      code: 404,
      msg: "Please provide valid values. Page(p) cannot be greater than the total number of books!",
    });
  }

  return { books, total_count };
};

exports.selectBookById = async (id) => {
  const query = format(
    `SELECT books.*, COUNT(reviews.review_id)::int AS review_count, COALESCE(ROUND(AVG(reviews.rating)::numeric, 2)::float, 0.0) AS avg_rating FROM books 
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

exports.insertBook = async ({
  title,
  image_url,
  description,
  author,
  publisher,
  amazon_book_url,
  isbn,
  genre,
}) => {
  if (
    !title ||
    !image_url ||
    !description ||
    !author ||
    !publisher ||
    !amazon_book_url ||
    !isbn ||
    !genre
  ) {
    return Promise.reject({ code: 400, msg: "No Book Submitted!" });
  }
  const { rows } = await db.query(
    `INSERT INTO books (title,
  image_url,
  description,
  author,
  publisher,
  amazon_book_url,
  isbn,
  genre) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      title,
      image_url,
      description,
      author,
      publisher,
      amazon_book_url,
      isbn,
      genre,
    ]
  );
  rows[0].review_count = 0;
  return rows[0];
};

exports.deleteBookById = async (loggedInUsername, id) => {
  if (isNaN(id)) {
    return Promise.reject({
      code: 400,
      msg: "Invalid book id. Must be a  number!",
    });
  }

  if (loggedInUsername !== "Admin") {
    return Promise.reject({
      code: 403,
      msg: "Unauthorized - Only admin can delete books!",
    });
  }

  const { rows } = await db.query(
    `DELETE FROM books WHERE book_id=$1 RETURNING *`,
    [id]
  );

  if (rows.length === 0) {
    return Promise.reject({
      code: 404,
      msg: "Book doesn't exist!",
    });
  }

  return rows[0];
};
