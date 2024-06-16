exports.handleInvalidEndpoint = (req, res, next) => {
  res
    .status(404)
    .send({ msg: "Please enter a valid link. Go back and try again." });
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.code === 404 || err.code === 400 || err.code === 409) {
    res.status(err.code).send({ msg: err.msg });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: "Bad Request!" });
  } else next(err);
};
