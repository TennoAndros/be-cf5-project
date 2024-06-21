const {
  selectUsers,
  selectUserByUsername,
  insertUser,
  checkUserExists,
  deleteUserByUsername,
} = require("../models/users-models");

exports.getUserByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await selectUserByUsername(username);
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};

exports.postUser = async (req, res, next) => {
  try {
    const userObj = req.body;
    const userExists = await checkUserExists(userObj.username);
    const newUser = !userExists && (await insertUser(userObj));
    res.status(201).send({ newUser });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserByUsername = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.userId;
    const deleteUsername = req.params.username;
    const deletedUser = await deleteUserByUsername(
      loggedInUserId,
      deleteUsername
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
