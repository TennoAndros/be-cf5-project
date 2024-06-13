const bcrypt = require("bcrypt");

exports.hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatReviews = (reviews, idLookup) => {
  return reviews.map(({ created_by, belongs_to, ...restOfReview }) => {
    const book_id = idLookup[belongs_to];
    return {
      book_id,
      username: created_by,
      ...this.convertTimestampToDate(restOfReview),
    };
  });
};
