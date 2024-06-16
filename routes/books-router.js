const booksRouter = require("express").Router();

const { getBooks,getBookById } = require("../controllers/books-controllers");

booksRouter.route("/").get(getBooks);
booksRouter.route("/:book_id").get(getBookById);

module.exports = booksRouter;
