const db = require("../db/connection");
const format = require("pg-format");

exports.selectReviewsByBookId = async (id, limit = 10, p = 1) => {
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

  let offset = (p - 1) * limit;

  limit = limit == 0 ? `ALL` : limit;

  const queryArr = [id, limit, offset];

  let query = `SELECT * , CAST(reviews.rating AS INT) FROM reviews WHERE book_id=%L ORDER BY created_at DESC LIMIT %s OFFSET %L`;
  let limitlessQuery = `SELECT * , CAST(reviews.rating AS INT) FROM reviews WHERE book_id=$1`;

  const formattedQuery = format(query, ...queryArr);

  const [reviewResult, limitlessQueryResult] = await Promise.all([
    db.query(formattedQuery),
    db.query(limitlessQuery, [id]),
  ]);

  const { rows: reviews } = reviewResult;
  const { rows: limitlessReviews } = limitlessQueryResult;
  const total_count = limitlessReviews.length;

  if (
    Math.ceil(total_count / limit) > 0 &&
    p > Math.ceil(total_count / limit)
  ) {
    return Promise.reject({
      code: 404,
      msg: "Please provide valid values.Limit or p cannot be greater than the total number of reviews for specified book!",
    });
  }

  return { reviews, total_count };
};

exports.insertReview = async ({ body, username, rating }, bookId) => {
  if (!body || !username || !rating) {
    return Promise.reject({ code: 400, msg: "No review submitted" });
  }

  const { rows } = await db.query(
    `INSERT INTO reviews (book_id, body, username, rating) VALUES ($1, $2, $3, $4) RETURNING *`,
    [bookId, body, username, rating]
  );

  return rows[0];
};

exports.updateReviewById = async (updates, id) => {
  const { rating, body } = updates;

  let queryStr = `UPDATE reviews SET `;
  const queryParams = [];
  let setClauses = [];

  if (rating !== undefined) {
    queryParams.push(rating);
    setClauses.push(`rating = $${queryParams.length}`);
  }

  if (body !== undefined) {
    queryParams.push(body);
    setClauses.push(`body = $${queryParams.length}`);
  }

  if (setClauses.length === 0) {
    return Promise.reject({
      code: 400,
      msg: "Missing required fields!",
    });
  }

  queryStr += setClauses.join(", ");
  queryParams.push(id);
  queryStr += ` WHERE review_id = $${queryParams.length} RETURNING *;`;

  const { rows } = await db.query(queryStr, queryParams);

  if (rows.length === 0) {
    return Promise.reject({
      code: 404,
      msg: "Review Not Found!",
    });
  }

  return rows[0];
};

exports.deleteReviewById = async (id) => {
  const { rows } = await db.query(
    `DELETE FROM reviews WHERE review_id=$1 RETURNING *`,
    [id]
  );
  if (rows.length === 0)
    return Promise.reject({
      code: 404,
      msg: "Review doesn't exist!",
    });
};

exports.selectReviewById = async (reviewId) => {
  const { rows } = await db.query(
    `SELECT * FROM reviews WHERE review_id = $1`,
    [reviewId]
  );

  if (rows.length === 0) {
    return Promise.reject({
      code: 404,
      msg: "Review Not Found!",
    });
  }

  return rows[0];
};
