const format = require("pg-format");
const db = require("../connection");
const { hashPassword, createRef, formatReviews } = require("./utils");

const seed = async ({ reviewData, genreData, bookData, userData }) => {
  await db.query(`DROP TABLE IF EXISTS reviews;`);
  await db.query(`DROP TABLE IF EXISTS books;`);
  await db.query(`DROP TABLE IF EXISTS users;`);
  await db.query(`DROP TABLE IF EXISTS genres;`);

  await Promise.all([
    db.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(255)
      );`),
    db.query(`
      CREATE TABLE genres (
        genre_id SERIAL PRIMARY KEY,
        genre VARCHAR(50) UNIQUE NOT NULL
      );`),
  ]);

  await db.query(`
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

  await db.query(`
    CREATE TABLE reviews (
      review_id SERIAL PRIMARY KEY,
      body TEXT NOT NULL,
      username VARCHAR REFERENCES users(username) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      rating DECIMAL(3, 2) DEFAULT 0.0 NOT NULL,
      book_id INT REFERENCES books(book_id) ON DELETE CASCADE NOT NULL
    );`);

  const insertGenresQueryStr = format(
    "INSERT INTO genres (genre) VALUES %L;",
    genreData.map(({ genre }) => [genre])
  );
  await db.query(insertGenresQueryStr);

  const usersWithHashedPasswords = await Promise.all(
    userData.map(async (user) => {
      const hashedPassword = await hashPassword(user.password);
      return { ...user, password: hashedPassword };
    })
  );
  const insertUsersQueryStr = format(
    "INSERT INTO users (username, email, password, first_name, last_name, avatar_url) VALUES %L;",
    usersWithHashedPasswords.map(
      ({ username, email, password, first_name, last_name, avatar_url }) => [
        username,
        email,
        password,
        first_name,
        last_name,
        avatar_url,
      ]
    )
  );
  await db.query(insertUsersQueryStr);

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
  const { rows: bookRows } = await db.query(insertBooksQueryStr);

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
  await db.query(insertReviewsQueryStr);
};

module.exports = seed;
