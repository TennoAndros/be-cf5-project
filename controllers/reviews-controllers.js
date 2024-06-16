const { checkBookExists } = require("../models/books-models");
const { selectReviewsByBookId } = require("../models/reviews-models");

exports.getReviewsByBookId = async (req, res, next) => {
  try {
    const { limit, p } = req.query;
    const bookId = req.params.book_id;
    
    const [, { reviews, total_count }] = await Promise.all([
      checkBookExists(bookId),
      selectReviewsByBookId(bookId, limit, p),
    ]);
    res.status(200).send({ reviews, total_count });
  } catch (err) {
    next(err);
  }
};
