const format = require("pg-format");
const db = require("../connection");
const { hashPassword, createRef, formatReviews } = require("./utils");

const seed = ({ reviewData, genreData, bookData, userData }) => {
  return db
    .query(`DROP TABLE IF EXISTS reviews;`)
    .then(() => db.query(`DROP TABLE IF EXISTS books;`))
    .then(() => db.query(`DROP TABLE IF EXISTS users;`))
    .then(() => db.query(`DROP TABLE IF EXISTS genres;`))
    .then(() => {
      const usersTablePromise = db.query(`
        CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          avatar_url VARCHAR(255)
        );`);

      const genresTablePromise = db.query(`
        CREATE TABLE genres (
          genre_id SERIAL PRIMARY KEY,
          genre VARCHAR(50) UNIQUE NOT NULL
        );`);

      return Promise.all([usersTablePromise, genresTablePromise]);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE books (
          book_id SERIAL PRIMARY KEY,
          book_title VARCHAR(255) NOT NULL UNIQUE,
          book_author VARCHAR(255) NOT NULL,
          book_description TEXT NOT NULL,
          book_image VARCHAR(255) NOT NULL,
          amazon_book_url VARCHAR(255) NOT NULL UNIQUE,
          book_publisher VARCHAR(255),
          book_isbn VARCHAR(20) NOT NULL UNIQUE,
          genre VARCHAR(50) NOT NULL,
          rating DECIMAL(3, 2) DEFAULT 0.0
        );`);
    })
    .then(() => {
      return db.query(`
        CREATE TABLE reviews (
          review_id SERIAL PRIMARY KEY,
          body TEXT NOT NULL,
          username VARCHAR REFERENCES users(username) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          rating DECIMAL(3, 2) DEFAULT 0.0 NOT NULL,
          book_id INT REFERENCES books(book_id) ON DELETE CASCADE NOT NULL
        );`);
    })
    .then(() => {
      const insertGenresQueryStr = format(
        "INSERT INTO genres (genre) VALUES %L;",
        genreData.map(({ genre }) => [genre])
      );

      return db.query(insertGenresQueryStr);
    })
    .then(async () => {
      const usersWithHashedPasswords = await Promise.all(
        userData.map(async (user) => {
          const hashedPassword = await hashPassword(user.password);
          return {
            ...user,
            password: hashedPassword,
          };
        })
      );

      const insertUsersQueryStr = format(
        "INSERT INTO users (username, email, password, first_name, last_name, avatar_url) VALUES %L;",
        usersWithHashedPasswords.map(
          ({
            username,
            email,
            password,
            first_name,
            last_name,
            avatar_url,
          }) => [username, email, password, first_name, last_name, avatar_url]
        )
      );

      return db.query(insertUsersQueryStr);
    })
    .then(() => {
      const insertBooksQueryStr = format(
        "INSERT INTO books (book_title, book_author, book_description, book_image, amazon_book_url, book_publisher, book_isbn, genre, rating) VALUES %L RETURNING *;",
        bookData.map(
          ({
            book_title,
            book_author,
            book_description,
            book_image,
            amazon_book_url,
            book_publisher,
            book_isbn,
            genre,
            rating,
          }) => [
            book_title,
            book_author,
            book_description,
            book_image,
            amazon_book_url,
            book_publisher,
            book_isbn,
            genre,
            rating,
          ]
        )
      );

      return db.query(insertBooksQueryStr);
    })
    .then(({ rows: bookRows }) => {
      const bookIdLookup = createRef(bookRows, "book_title", "book_id");
      const formattedReviewData = formatReviews(reviewData, bookIdLookup);

      const insertReviewsQueryStr = format(
        "INSERT INTO reviews (body, username, created_at, rating, book_id) VALUES %L;",
        formattedReviewData.map(
          ({ body, username, created_at, rating = 0.0, book_id }) => [
            body,
            username,
            created_at,
            rating,
            book_id,
          ]
        )
      );

      return db.query(insertReviewsQueryStr);
    });
};

module.exports = seed;
