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
