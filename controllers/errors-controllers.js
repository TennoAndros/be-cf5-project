exports.handleInvalidEndpoint = (req, res, next) => {
  res
    .status(404)
    .send({ msg: "Please enter a valid link. Go back and try again." });
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (
    err.code === 404 ||
    err.code === 400 ||
    err.code === 409 ||
    err.code === 403 ||
    err.code === 500
  ) {
    res.status(err.code).send({ msg: err.msg });
  } else if (
    err.msg === "Username required!" ||
    err.msg === "Password required!"
  ) {
    res.status(400).send({ msg: err.msg });
  } else if (
    err.msg === "Invalid password!" ||
    err.msg === "UnauthorizedError"
  ) {
    res.status(401).send({ msg: "Invalid credentials!" });
  } else if (
    err.msg === "No Authorization header provided!" ||
    err.msg === "No Authentication Token provided!"
  ) {
    res.status(401).send({ msg: "Authentication failed!" });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23503") {
    res.status(400).send({ msg: "Bad Request!" });
  } else if (err.code === "2201W" || err.code === "2201X") {
    res.status(400).send({ msg: "Limit and p must be positive numbers!" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Missing Required Fields!" });
  } else if (err.code === "23505") {
    res.status(400).send({ msg: "Genre Already Exists!" });
  } else if (err.code === "23514") {
    res.status(400).send({ msg: "Rating cannot be negative number!" });
  } else next(err);
};
