const booksRouter = require("express").Router();

const { getBooks, getBookById } = require("../controllers/books-controllers");

const { getReviewsByBookId } = require("../controllers/reviews-controllers");

booksRouter.route("/").get(getBooks);
booksRouter.route("/:book_id").get(getBookById);
booksRouter.route("/:book_id/reviews").get(getReviewsByBookId);

module.exports = booksRouter;
