const {
  selectReviewsByBookId,
  insertReview,
  updateReviewById,
  selectReviewById,
  deleteReviewById,
} = require("../models/reviews-models");
const { checkBookExists } = require("../models/books-models");

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

exports.postReviewByBookId = async (req, res, next) => {
  try {
    const { body, rating } = req.body;
    const bookId = req.params.book_id;
    const loggedInUsername = req.user ? req.user.username : null;

    if (!loggedInUsername) {
      return res.status(401);
    }
    const review = { body, username: loggedInUsername, rating };
    const [, newReview] = await Promise.all([
      checkBookExists(bookId),
      insertReview(review, bookId),
    ]);
    res.status(201).send({ newReview });
  } catch (err) {
    next(err);
  }
};

exports.patchReviewById = async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).send({ msg: "Unauthorized" });
    }

    const reviewId = req.params.review_id;

    const review = await selectReviewById(reviewId);

    if (review.username !== loggedInUser.username) {
      return res
        .status(403)
        .send({ msg: "Forbidden - You can only edit your own reviews" });
    }

    const updates = req.body;
    const updatedReview = await updateReviewById(updates, reviewId);

    res.status(200).send({ updatedReview });
  } catch (err) {
    next(err);
  }
};

exports.deleteReviewById = async (req, res, next) => {
  try {
    const deleteId = req.params.review_id;
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401);
    }

    const review = await selectReviewById(deleteId);

    if (!review) {
      return res.status(404);
    }

    if (
      review.username !== loggedInUser.username &&
      loggedInUser.username !== "Admin"
    ) {
      return res
        .status(403)
        .send({ msg: "Forbidden - You can only delete your own reviews" });
    }

    await deleteReviewById(deleteId);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
