const reviewsRouter = require("express").Router();
const authenticateToken = require("../middleware/auth-middleware");

const {
  patchReviewById,
  deleteReviewById,
} = require("../controllers/reviews-controllers");

reviewsRouter
  .route("/:review_id")
  .patch(authenticateToken, patchReviewById)
  .delete(authenticateToken, deleteReviewById);

module.exports = reviewsRouter;
