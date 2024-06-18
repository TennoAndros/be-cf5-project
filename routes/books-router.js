const booksRouter = require("express").Router();
const authenticateToken = require("../middleware/auth-middleware");

const {
  getBooks,
  getBookById,
  patchBookById,
  postBook,
  deleteBookById,
} = require("../controllers/books-controllers");

const { getReviewsByBookId } = require("../controllers/reviews-controllers");

booksRouter.route("/").get(getBooks).post(postBook);

booksRouter
  .route("/:book_id")
  .get(getBookById)
  .patch(patchBookById)
  .delete(authenticateToken, deleteBookById);

booksRouter.route("/:book_id/reviews").get(getReviewsByBookId);

module.exports = booksRouter;
