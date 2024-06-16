const { selectBooks, selectBookById } = require("../models/books-models");

exports.getBooks = async (req, res, next) => {
  try {
    const books = await selectBooks();
    res.status(200).send({ books });
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
