const {
  selectBooks,
  selectBookById,
  updateBookById,
  checkBookExists,
  insertBook,
  deleteBookById,
} = require("../models/books-models");
const { checkGenreExists } = require("../models/genres-models");

exports.getBooks = async (req, res, next) => {
  try {
    const { genre, sort_by, order, limit, p } = req.query;
    const [, { books, total_count }] = await Promise.all([
      checkGenreExists(genre),
      selectBooks(genre, sort_by, order, limit, p),
    ]);
    res.status(200).send({ books, total_count });
  } catch (err) {
    next(err);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const bookId = req.params.book_id;
    const book = await selectBookById(bookId);
    res.status(200).send({ book });
  } catch (err) {
    next(err);
  }
};

exports.postBook = async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401);
    }

    const book = req.body;
    const newBook = await insertBook(book);
    res.status(201).send({ newBook });
  } catch (err) {
    next(err);
  }
};

exports.deleteBookById = async (req, res, next) => {
  try {
    const deleteId = req.params.book_id;
    const loggedInUsername = req.user.username;

    const deletedBook = await deleteBookById(loggedInUsername, deleteId);

    if (!deletedBook) {
      return res.status(404);
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
