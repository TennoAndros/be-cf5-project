const booksRouter = require("express").Router();
const authenticateToken = require("../middleware/auth-middleware");

const {
  getBooks,
  getBookById,
  patchBookById,
  postBook,
  deleteBookById,
} = require("../controllers/books-controllers");

const {
  getReviewsByBookId,
  postReviewByBookId,
} = require("../controllers/reviews-controllers");

booksRouter.route("/").get(getBooks).post(authenticateToken, postBook);

booksRouter
  .route("/:book_id")
  .get(getBookById)
  .patch(patchBookById)
  .delete(authenticateToken, deleteBookById);

booksRouter
  .route("/:book_id/reviews")
  .get(getReviewsByBookId)
  .post(authenticateToken, postReviewByBookId);

module.exports = booksRouter;
