const db = require("../db/connection");
const { selectGenres } = require("../models/genres-models");

exports.getGenres = async (req, res, next) => {
  try {
    const genres = await selectGenres();
    res.status(200).send({ genres });
  } catch (err) {
    next(err);
  }
};
