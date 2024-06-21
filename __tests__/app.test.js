const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const { generateToken } = require("../utils/utils");

beforeEach(() => {
  return seed(data);
});
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    describe("STATUS 2--", () => {
      test("should respond with a json object listing all endpoints", async () => {
        const apiData = await request(app).get("/api").expect(200);
        const { body } = apiData;

        expect(typeof body).toBe("object");
        expect(body).toEqual(
          expect.objectContaining({
            "GET /api": expect.any(Object),
            "GET /api/genres": expect.any(Object),
            "POST /api/genres": expect.any(Object),
            "GET /api/books": expect.any(Object),
            "POST /api/books": expect.any(Object),
            "GET /api/books/:book_id": expect.any(Object),
            "DELETE /api/books/:book_id": expect.any(Object),
            "GET /api/books/:book_id/reviews": expect.any(Object),
            "POST /api/books/:book_id/reviews": expect.any(Object),
            "PATCH /api/reviews/:review_id": expect.any(Object),
            "DELETE /api/reviews/:review_id": expect.any(Object),
            "GET /api/users": expect.any(Object),
            "POST /api/users": expect.any(Object),
            "GET /api/users/:username": expect.any(Object),
            "POST /api/users/login": expect.any(Object),
            "POST /api/users/logout": expect.any(Object),
          })
        );
      });
    });
  });
});

describe("/api/genres", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should respond with array of genre objects", async () => {
        const genreData = await request(app).get("/api/genres").expect(200);
        const { genres } = genreData.body;

        genres.forEach((genre) => {
          expect(genre).toEqual(
            expect.objectContaining({
              genre: expect.any(String),
            })
          );
        });
      });
    });

    describe("STATUS ERROR 404 ", () => {
      test("should respond with error 404 when invalid endpoint is given", async () => {
        const genreData = await request(app).get("/api/grenes").expect(404);
        const { msg } = genreData.body;

        expect(msg).toEqual(
          "Please enter a valid link. Go back and try again."
        );
      });
    });
  });

  describe("POST", () => {
    describe("STATUS 200", () => {
      test("should return an object with a new genre", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        const genreToPost = {
          genre: "Satire",
        };
        const response = await request(app)
          .post("/api/genres")
          .set("Authorization", `Bearer ${token}`)
          .send(genreToPost)
          .expect(201);
        const { newGenre } = response.body;

        expect(newGenre).toEqual({
          ...genreToPost,
        });
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with an error 401 if the user isn't logged in", async () => {
        const genreToPost = {
          genre: "fadsfasdf",
        };
        const response = await request(app)
          .post("/api/genres")
          .send(genreToPost)
          .expect(401);
        const { msg } = response.body;

        expect(msg).toEqual(
          "No Authorization header or No Authentication Token provided!"
        );
      });
    });

    test("should respond with error 400 when empty object is given", async () => {
      const user = { username: "smithrose" };
      const token = generateToken(user);
      const response = await request(app)
        .post("/api/genres")
        .set("Authorization", `Bearer ${token}`)
        .send({})
        .expect(400);
      const { msg } = response.body;

      expect(msg).toEqual("Missing Required Fields!");
    });

    test("should respond with error 400 when genre already exist in database", async () => {
      const user = { username: "smithrose" };
      const token = generateToken(user);
      const genreToPost = {
        genre: "Drama",
      };
      const response = await request(app)
        .post("/api/genres")
        .set("Authorization", `Bearer ${token}`)
        .send(genreToPost)
        .expect(400);
      const { msg } = response.body;

      expect(msg).toEqual("Genre Already Exists!");
    });

    test("should respond with error 400 when given number as a genre", async () => {
      const user = { username: "smithrose" };
      const token = generateToken(user);
      const genreToPost = {
        genre: 1,
      };
      const response = await request(app)
        .post("/api/genres")
        .set("Authorization", `Bearer ${token}`)
        .send(genreToPost)
        .expect(400);
      const { msg } = response.body;

      expect(msg).toEqual("Genre must not contain numbers!");
    });
  });
});

describe("/api/books", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should respond with array book objects", async () => {
        const bookData = await request(app).get("/api/books").expect(200);
        const { books } = bookData.body;

        books.forEach((book) => {
          expect(book).toEqual(
            expect.objectContaining({
              amazon_book_url: expect.any(String),
              author: expect.any(String),
              book_id: expect.any(Number),
              description: expect.any(String),
              genre: expect.any(String),
              image_url: expect.any(String),
              isbn: expect.any(String),
              publisher: expect.any(String),
              avg_rating: expect.any(Number),
              title: expect.any(String),
              review_count: expect.any(Number),
            })
          );
        });
        expect(books).toBeSortedBy("title", { descending: true });
      });

      test("should respond with books of given genre", async () => {
        const bookData = await request(app)
          .get("/api/books?genre=Mystery")
          .expect(200);
        const { books } = bookData.body;

        for (let book of books) {
          expect(book.genre).toEqual("Mystery");
        }
      });

      test("should respond with books in ascending order", async () => {
        const bookData = await request(app)
          .get("/api/books?sort_by=avg_rating&order=asc")
          .expect(200);
        const { books } = bookData.body;

        expect(books).toBeSortedBy("avg_rating");
      });

      test("should respond with books that have most reviews in ascending order", async () => {
        const bookData = await request(app)
          .get("/api/books?sort_by=review_count&order=asc")
          .expect(200);
        const { books } = bookData.body;

        expect(books).toBeSortedBy("review_count");
      });

      test("should respond with a limit of 10 books which is the default value", async () => {
        const bookData = await request(app).get("/api/books").expect(200);
        const { books } = bookData.body;

        expect(books).toHaveLength(10);
      });

      test("should respond with books of the limit provided", async () => {
        const bookData = await request(app)
          .get("/api/books?limit=3")
          .expect(200);
        const { books } = bookData.body;

        expect(books).toHaveLength(3);
      });

      test("should respond with all books if the limit is 0", async () => {
        const bookData = await request(app)
          .get("/api/books?limit=0")
          .expect(200);
        const { books } = bookData.body;

        expect(books).toHaveLength(12);
      });

      test("should respond with number of pages(p) given", async () => {
        const bookData = await request(app).get("/api/books?p=1").expect(200);
        const { books } = bookData.body;

        expect(books).toHaveLength(10);
      });

      test("should contain total_count property", async () => {
        const bookData = await request(app).get("/api/books").expect(200);
        const { total_count } = bookData.body;

        expect(total_count).toBe(12);
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 400 when invalid order is given", async () => {
        const response = await request(app)
          .get("/api/books?order=somethingRandom")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual(
          "Please enter a valid order. Order should be ASC(ascending) or DESC(descending)"
        );
      });

      test("should respond with error 400 when invalid sort_by is given", async () => {
        const response = await request(app)
          .get("/api/books?sort_by=somethingRandom")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Please enter a valid sort order!");
      });

      test("should respond with error 400 if limit query isn't a number", async () => {
        const response = await request(app)
          .get("/api/books?limit=notNumber")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual(
          "Please enter a valid limit. Limit should be a number!"
        );
      });

      test("should respond with error 400 if p query isn't a number", async () => {
        const response = await request(app)
          .get("/api/books?p=notNumber")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Please enter a valid p. P should be a number!");
      });

      test("should respond with error 400 if limit and p queries must be positive integers if given negative integers", async () => {
        const response1 = await request(app)
          .get("/api/books?limit=-5")
          .expect(400);
        expect(response1.body.msg).toEqual(
          "Limit and p must be positive numbers!"
        );

        const response2 = await request(app).get("/api/books?p=-5").expect(400);
        expect(response2.body.msg).toEqual(
          "Limit and p must be positive numbers!"
        );
      });

      test("should respond with error 404 if genre doesn't exist in database", async () => {
        const response = await request(app)
          .get("/api/books?genre=somethingRandom")
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual("Genre Not Found!");
      });

      test("should respond with error 404 if page query number exceeds the total number of books in our database", async () => {
        const response2 = await request(app)
          .get("/api/books?p=100")
          .expect(404);

        expect(response2.body.msg).toEqual(
          "Please provide valid values. Page(p) cannot be greater than the total number of books!"
        );
      });
    });
  });

  describe("POST", () => {
    describe("STATUS 201", () => {
      test("should return an object with a new book", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        const bookToPost = {
          title: "CAMINO GHOSTS 2",
          image_url:
            "https://storage.googleapis.com/du-prd/books/images/9780385545990.jpg",
          description:
            "The fourth book in the Camino series. The last living inhabitant of a deserted island gets in the way of a resort developer.",
          author: "John Grisham",
          publisher: "Doubleday",
          amazon_book_url:
            "https://www.amazon.com/dp/0365545991?tag=thenewyorktim-20",
          isbn: "0365545991",
          genre: "Romance",
        };
        const response = await request(app)
          .post("/api/books")
          .set("Authorization", `Bearer ${token}`)
          .send(bookToPost)
          .expect(201);
        const { newBook } = response.body;

        expect(newBook).toEqual({
          ...bookToPost,
          book_id: 13,
          review_count: 0,
        });
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with an error 401 if the user isn't logged in", async () => {
        const bookToPost = {
          title: "CAMINO GHOSTS 2",
          image_url:
            "https://storage.googleapis.com/du-prd/books/images/9780385545990.jpg",
          description:
            "The fourth book in the Camino series. The last living inhabitant of a deserted island gets in the way of a resort developer.",
          author: "John Grisham",
          publisher: "Doubleday",
          amazon_book_url:
            "https://www.amazon.com/dp/0365545991?tag=thenewyorktim-20",
          isbn: "0365545991",
          genre: "Romance",
        };
        const response = await request(app)
          .post("/api/books")
          .send(bookToPost)
          .expect(401);
        const { msg } = response.body;

        expect(msg).toEqual(
          "No Authorization header or No Authentication Token provided!"
        );
      });

      test("should respond with error 400 when empty object is given", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);
        const response = await request(app)
          .post("/api/books")
          .set("Authorization", `Bearer ${token}`)
          .send({})
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("No Book Submitted!");
      });

      test("should respond with error 400 when not all required properties are given", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);
        const response = await request(app)
          .post("/api/books")
          .set("Authorization", `Bearer ${token}`)
          .send({
            author: "J.K Rowling",
            title: "Fantastic Beasts",
            description: "An awesome book",
          })
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("No Book Submitted!");
      });

      test("should respond with error 400 when genre doesn't exist in genres tables", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);
        const bookToPost = {
          title: "CAMINO GHOSTS 2",
          image_url:
            "https://storage.googleapis.com/du-prd/books/images/9780385545990.jpg",
          description:
            "The fourth book in the Camino series. The last living inhabitant of a deserted island gets in the way of a resort developer.",
          author: "John Grisham",
          publisher: "Doubleday",
          amazon_book_url:
            "https://www.amazon.com/dp/0365545991?tag=thenewyorktim-20",
          isbn: "0365545991",
          genre: "Doesn't Exist",
        };
        const response = await request(app)
          .post("/api/books")
          .set("Authorization", `Bearer ${token}`)
          .send(bookToPost)
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Bad Request!");
      });
    });
  });
});

describe("/api/books/:book_id", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should return a book object based on the id", async () => {
        const bookData = await request(app).get("/api/books/1").expect(200);
        const { book } = bookData.body;

        expect(book).toEqual({
          title: "CAMINO GHOSTS",
          image_url:
            "https://storage.googleapis.com/du-prd/books/images/9780385545990.jpg",
          description:
            "The third book in the Camino series. The last living inhabitant of a deserted island gets in the way of a resort developer.",
          author: "John Grisham",
          book_id: 1,
          publisher: "Doubleday",
          amazon_book_url:
            "https://www.amazon.com/dp/0385545991?tag=thenewyorktim-20",
          isbn: "0385545991",
          genre: "Mystery",
          review_count: 2,
          avg_rating: expect.any(Number),
        });
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 400 when invalid book_id 'not a number' is given", async () => {
        const response = await request(app).get("/api/books/das").expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Bad Request!");
      });

      test("should respond with error 404 when valid book_id is given but book doesn't exist", async () => {
        const response = await request(app).get("/api/books/500").expect(404);
        const { msg } = response.body;

        expect(msg).toEqual("Book Not Found!");
      });
    });
  });

  describe("DELETE", () => {
    describe("STATUS 204", () => {
      test("should delete book when authenticated user is admin", async () => {
        const user = { username: "Admin" };
        const token = generateToken(user);
        const initialBooksResponse = await request(app)
          .get("/api/books")
          .set("Authorization", `Bearer ${token}`);
        const initialBookCount = initialBooksResponse.body.total_count;
        await request(app)
          .delete("/api/books/1")
          .set("Authorization", `Bearer ${token}`)
          .expect(204);

        const booksAfterDeletionResponse = await request(app)
          .get("/api/books")
          .set("Authorization", `Bearer ${token}`);
        const booksAfterDeletionCount =
          booksAfterDeletionResponse.body.total_count;

        expect(booksAfterDeletionCount).toBe(initialBookCount - 1);
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 403 not allow users whose username isn't 'Admin' to delete books.", async () => {
        const user = { username: "Mat" };
        const token = generateToken(user);

        const response = await request(app)
          .delete("/api/books/1")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);
        const { msg } = response.body;

        expect(msg).toEqual("Unauthorized - Only admin can delete books!");
      });

      test("should respond with error 404 when valid book id is given but book doesn't exist in database", async () => {
        const user = { username: "Admin" };
        const token = generateToken(user);

        const response = await request(app)
          .delete("/api/books/500")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual("Book doesn't exist!");
      });

      test("should respond with error 404 when invalid book id is given 'not a number", async () => {
        const user = { username: "Admin" };
        const token = generateToken(user);

        const response = await request(app)
          .delete("/api/books/notNumber")
          .set("Authorization", `Bearer ${token}`)
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Invalid book id. Must be a  number!");
      });
    });
  });
});

describe("/api/books/:book_id/reviews", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should return a review array base on book_id", async () => {
        const bookReviewData = await request(app).get("/api/books/3/reviews");
        const { reviews } = bookReviewData.body;

        expect(reviews).toHaveLength(10);
        reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              body: expect.any(String),
              username: expect.any(String),
              created_at: expect.any(String),
              rating: expect.any(Number),
              review_id: expect.any(Number),
              book_id: expect.any(Number),
            })
          );
        });
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });

      test("should respond with a maximum of 10 reviews for the specified book, which is the default value", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews")
          .expect(200);
        const { reviews } = reviewData.body;

        expect(reviews).toHaveLength(10);
      });

      test("should respond with reviews of specified book with provided limit", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews?limit=3")
          .expect(200);
        const { reviews } = reviewData.body;

        expect(reviews).toHaveLength(3);
      });

      test("should respond with all reviews of specified book if limit is 0", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews?limit=0")
          .expect(200);
        const { reviews } = reviewData.body;

        expect(reviews).toHaveLength(10);
      });

      test("should respond with the number of pages given", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews?p=1")
          .expect(200);
        const { reviews } = reviewData.body;

        expect(reviews).toHaveLength(10);
      });

      test("should contain a total count property", async () => {
        const reviewData = await request(app)
          .get("/api/books/3/reviews")
          .expect(200);
        const { total_count } = reviewData.body;

        expect(total_count).toBe(10);
      });
    });
    describe("STATUS ERROR 400", () => {
      test("should respond with error 400 when invalid book_id 'not a number' is given", async () => {
        const response = await request(app)
          .get("/api/books/das/reviews")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Bad Request!");
      });

      test("should respond with error 404 when invalid endpoint is given", async () => {
        const response = await request(app)
          .get("/api/books/3/notvalidendpoint")
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual(
          "Please enter a valid link. Go back and try again."
        );
      });

      test("should respond with error 400 if limit query isn't a number", async () => {
        const response = await request(app)
          .get("/api/books/3/reviews?limit=notNumber")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual(
          "Please enter a valid limit. Limit should be a number!"
        );
      });

      test("should respond with error 400 if p query isn't a number", async () => {
        const response = await request(app)
          .get("/api/books/3/reviews?p=notNumber")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Please enter a valid p. P should be a number!");
      });

      test("should respond with error 400 limit and p queries must be positive integers if given negative integers", async () => {
        const response = await request(app)
          .get("/api/books/3/reviews?limit=-5")
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Limit and p must be positive numbers!");
      });

      test("should respond with error 404 when valid book_id is given but book doesn't exist in database", async () => {
        const response = await request(app)
          .get("/api/books/500/reviews")
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual("Book Not Found!");
      });

      test("should respond with error 404 if limit or p query number exceeds the total number of reviews in our database for the specified book", async () => {
        const response = await request(app)
          .get("/api/books/3/reviews?p=45")
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual(
          "Please provide valid values.Limit or p cannot be greater than the total number of reviews for specified book!"
        );
      });
    });
  });

  describe("POST", () => {
    describe("STATUS 201", () => {
      test("should add a review to a book if you are logged in", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        const reviewToPost = {
          body: "Maecenas faucibus mollis interdum. Donec id elit non mi porta gravida at eget metus. Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
          rating: 1,
        };

        const response = await request(app)
          .post("/api/books/1/reviews")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewToPost)
          .expect(201);

        const { newReview } = response.body;
        expect(newReview).toEqual({
          ...reviewToPost,
          review_id: expect.any(Number),
          created_at: expect.any(String),
          book_id: 1,
          username: "smithrose",
        });
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 401 if the user isn't logged in", async () => {
        const reviewToPost = {
          body: "lorem ipsum",
          rating: 3,
        };
        const response = await request(app)
          .post("/api/books/1/reviews")
          .send(reviewToPost)
          .expect(401);
        const { msg } = response.body;

        expect(msg).toEqual(
          "No Authorization header or No Authentication Token provided!"
        );
      });

      test("should respond with error 404 when valid book id is given but book doesn't exist in database", async () => {
        const user = { userId: 1, username: "smithrose" };
        const token = generateToken(user);

        const reviewToPost = {
          body: "Maecenas faucibus mollis interdum. Donec id elit non mi porta gravida at eget metus. Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
          rating: 1,
        };

        const response = await request(app)
          .post("/api/books/500/reviews")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewToPost)
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual("Book Not Found!");
      });

      test("should respond with error 404 when invalid 'not a number' book id is given", async () => {
        const user = { userId: 1, username: "smithrose" };
        const token = generateToken(user);

        const reviewToPost = {
          body: "Maecenas faucibus mollis interdum. Donec id elit non mi porta gravida at eget metus. Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
          rating: 1,
        };

        const response = await request(app)
          .post("/api/books/ads/reviews")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewToPost)
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Bad Request!");
      });
    });
  });
});

describe("/api/reviews/:review_id", () => {
  describe("PATCH", () => {
    describe("STATUS 200", () => {
      test("should update rating and body of review if you are the owner", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        const reviewUpdate = {
          body: "Test",
          rating: 3,
        };

        const response = await request(app)
          .patch("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewUpdate)
          .expect(200);

        const { updatedReview } = response.body;
        expect(updatedReview).toEqual({
          ...reviewUpdate,
          review_id: 2,
          username: "smithrose",
          created_at: expect.any(String),
          book_id: 1,
        });
      });
    });
    describe("STATUS ERROR 400", () => {
      test("should respond with error 403 if you are not the owner of the review", async () => {
        const user = { username: "notOwner" };
        const token = generateToken(user);

        const reviewUpdate = {
          body: "Test",
          rating: 3,
        };

        const response = await request(app)
          .patch("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewUpdate)
          .expect(403);

        const { msg } = response.body;
        expect(msg).toEqual("Forbidden - You can only edit your own reviews");
      });

      test("should respond with error 400 if an empty object is given ", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);
        const response = await request(app)
          .patch("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .send({})
          .expect(400);

        const { msg } = response.body;
        expect(msg).toEqual("Missing required fields!");
      });

      test("should respond with error 400 if rating is negative number", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        const reviewUpdate = {
          body: "Test",
          rating: -3,
        };

        const response = await request(app)
          .patch("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewUpdate)
          .expect(400);

        const { msg } = response.body;
        expect(msg).toEqual("Rating cannot be negative number!");
      });

      test("should respond with error 400 if rating is not a number", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        const reviewUpdate = {
          body: "Test",
          rating: "sdfs",
        };

        const response = await request(app)
          .patch("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .send(reviewUpdate)
          .expect(400);

        const { msg } = response.body;
        expect(msg).toEqual("Bad Request!");
      });
    });
  });

  describe("DELETE", () => {
    describe("STATUS 204", () => {
      test("should delete a review if you are owner of review", async () => {
        const user = { username: "smithrose" };
        const token = generateToken(user);

        return request(app)
          .delete("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .expect(204);
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 403 if logged in user is not the review owner", async () => {
        const user = { username: "notOwner" };
        const token = generateToken(user);

        const response = await request(app)
          .delete("/api/reviews/2")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);

        const { msg } = response.body;

        expect(msg).toEqual("Forbidden - You can only delete your own reviews");
      });

      test("should respond with error 401 if user is not logged in", async () => {
        const response = await request(app)
          .delete("/api/reviews/2")
          .expect(401);

        const { msg } = response.body;

        expect(msg).toEqual(
          "No Authorization header or No Authentication Token provided!"
        );
      });

      test("should respond with error 400 if invalid 'not a number' review id is given", async () => {
        const user = { username: "notOwner" };
        const token = generateToken(user);

        const response = await request(app)
          .delete("/api/reviews/adad")
          .set("Authorization", `Bearer ${token}`)
          .expect(400);

        const { msg } = response.body;

        expect(msg).toEqual("Bad Request!");
      });

      test("should respond with error 400 if valid review id is given but review doesn't exist in database", async () => {
        const user = { username: "notOwner" };
        const token = generateToken(user);

        const response = await request(app)
          .delete("/api/reviews/300")
          .set("Authorization", `Bearer ${token}`)
          .expect(404);

        const { msg } = response.body;

        expect(msg).toEqual("Review Not Found!");
      });
    });
  });
});

describe("/api/users", () => {
  describe("POST", () => {
    describe("STATUS 201", () => {
      test("should return an object with a new user", async () => {
        const userToPost = {
          email: "somethinggg1@outlook.com",
          username: "mariakalas",
          password: "your_password_here123",
          first_name: "Maria",
          last_name: "Kalas",
          avatar_url: "https://randomuser.me/api/portraits/women/14.jpg",
        };
        const response = await request(app)
          .post("/api/users")
          .send(userToPost)
          .expect(201);
        const { newUser } = response.body;
        expect(newUser).toEqual({
          ...userToPost,
          user_id: expect.any(Number),
        });
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 400 when empty object is given", async () => {
        const response = await request(app).post("/api/users").expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Missing Required Fields!");
      });

      test("should first", async () => {
        const postUser = {
          email: expect.any(String),
          username: expect.any(String),
          password: expect.any(String),
        };
        const response = await request(app)
          .post("/api/users")
          .send(postUser)
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Missing Required Fields!");
      });

      test("should respond with error 400 if user already exists", async () => {
        const postUser = {
          email: "something8@outlook.com",
          username: "johnsonthomas",
          password: "your_password_here105",
          first_name: "Thomas",
          last_name: "Johnson",
          avatar_url: "https://randomuser.me/api/portraits/men/8.jpg",
        };
        const response = await request(app)
          .post("/api/users")
          .send(postUser)
          .expect(409);
        const { msg } = response.body;

        expect(msg).toBe("User Already Exists!");
      });
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    describe("STATUS 200", () => {
      test("should return a user object based on username", async () => {
        const userData = await request(app)
          .get("/api/users/smithrose")
          .expect(200);
        const { user } = userData.body;

        expect(user).toEqual({
          user_id: expect.any(Number),
          email: "something1@outlook.com",
          username: "smithrose",
          password: expect.any(String),
          first_name: "Rose",
          last_name: "Smith",
          avatar_url: "https://randomuser.me/api/portraits/women/1.jpg",
        });
      });
    });
  });

  describe("STATUS ERROR 400", () => {
    test("should respond with error 404 when username is valid but doesn't exist in database", async () => {
      const response = await request(app)
        .get("/api/users/validUsername")
        .expect(404);
      const { msg } = response.body;

      expect(msg).toEqual("User Not Found!");
    });
  });

  describe("DELETE", () => {
    test("should delete user when authenticated and authorized", async () => {
      const loginResponse = await request(app)
        .post("/api/users/login")
        .send({ username: "scotts", password: "your_password_here102" });
      const token = loginResponse.body.token;
      const response = await request(app)
        .delete("/api/users/scotts")
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 401 when no Authorization header or Authentication token is provided", async () => {
        const response = await request(app)
          .delete("/api/users/scotts")
          .expect(401);
        const { msg } = response.body;

        expect(msg).toEqual(
          "No Authorization header or No Authentication Token provided!"
        );
      });

      test("should respond with error 401 when Authorization header is malformed", async () => {
        const response = await request(app)
          .delete("/api/users/scotts")
          .set("Authorization", "Bearer invalid token format")
          .expect(401);
        const { msg } = response.body;

        expect(msg).toEqual("Malformed Authorization header!");
      });

      test("should respond with error 403 when attempting to delete another user's account", async () => {
        const loginResponse = await request(app)
          .post("/api/users/login")
          .send({ username: "scotts", password: "your_password_here102" });
        const token = loginResponse.body.token;
        const response = await request(app)
          .delete("/api/users/smithrose")
          .set("Authorization", `Bearer ${token}`)
          .expect(403);
        const { msg } = response.body;

        expect(msg).toEqual("You can only delete your own account!");
      });
    });
  });
});

describe("/api/users/login", () => {
  describe("POST", () => {
    describe("STATUS 200", () => {
      test("should log in user and return token and user info", async () => {
        const userData = {
          username: "scotts",
          password: "your_password_here102",
        };
        const loginResponse = await request(app)
          .post("/api/users/login")
          .send(userData)
          .expect(200);
        const { token, user } = loginResponse.body;

        expect(token).toBeTruthy();
        expect(user).toEqual({
          id: expect.any(Number),
          username: "scotts",
        });

        global.authToken = token;
      });
    });

    describe("STATUS ERROR 400", () => {
      test("should respond with error 404 when username is valid but doesn't exist in database", async () => {
        const userData = {
          username: "nonexistentuser",
          password: "somepassword",
        };
        const response = await request(app)
          .post("/api/users/login")
          .send(userData)
          .expect(404);
        const { msg } = response.body;

        expect(msg).toEqual("User Not Found!");
      });

      test("should respond with error 401 for wrong password", async () => {
        const userData = {
          username: "scotts",
          password: "wrongpassword",
        };
        const response = await request(app)
          .post("/api/users/login")
          .send(userData)
          .expect(401);
        const { msg } = response.body;

        expect(msg).toEqual("Invalid credentials!");
      });

      test("should respond with error 400 for missing username", async () => {
        const userData = {
          password: "your_password_here102",
        };
        const response = await request(app)
          .post("/api/users/login")
          .send(userData)
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Username required!");
      });

      test("should respond with error 400 for missing password", async () => {
        const userData = {
          username: "scotts",
        };
        const response = await request(app)
          .post("/api/users/login")
          .send(userData)
          .expect(400);
        const { msg } = response.body;

        expect(msg).toEqual("Password required!");
      });
    });
  });
});

describe("/api/users/logout", () => {
  describe("POST", () => {
    describe("STATUS 200", () => {
      test("should log out user successfully", async () => {
        const response = await request(app)
          .post("/api/users/logout")
          .set("Authorization", `Bearer ${global.authToken}`)
          .expect(200);
        const { msg } = response.body;

        expect(msg).toEqual("Logged out successfully");
        global.authToken = null;
      });
    });

    describe("STATUS 401", () => {
      test("should respond with 401 when no authentication header or token is provided", async () => {
        const response = await request(app)
          .post("/api/users/logout")
          .expect(401);

        const { msg } = response.body;
        expect(msg).toEqual(
          "No Authorization header or No Authentication Token provided!"
        );
      });

      test("should respond with 401 when authentication token is malformed", async () => {
        const response = await request(app)
          .post("/api/users/logout")
          .set("Authorization", "Bearer malformedToken")
          .expect(401);

        const { msg } = response.body;
        expect(msg).toEqual("Invalid token! Authentication Failed");
      });
    });
  });
});
