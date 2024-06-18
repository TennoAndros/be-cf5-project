const db = require("../db/connection");
const { selectGenres, insertGenre } = require("../models/genres-models");

exports.getGenres = async (req, res, next) => {
  try {
    const genres = await selectGenres();
    res.status(200).send({ genres });
  } catch (err) {
    next(err);
  }
};

exports.postGenre = async (req, res, next) => {
  try {
    const genre = req.body;
    console.log("newGenre1", genre);
    const newGenre = await insertGenre(genre);
    res.status(201).send({ newGenre });
  } catch (err) {
    next(err);
  }
};
