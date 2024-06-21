# 📖 CF5 project API

---

## 🔗 link to Hosted version

To host the database i used [Supabase](https://supabase.com/) and the live version of the API was hosted on [Render](https://dashboard.render.com/).

Live version can be found hosted [here](https://be-cf5-project.onrender.com/api).

### 📘 Swagger Documentation

Swagger documentation is automatically generated and available to view with the API. You can access the Swagger UI for interactive documentation by visiting:

[Swagger UI](https://be-cf5-project.onrender.com/api-docs/)

**_It might take some time for the server to "wake-up"._**

---

## 📋 PROJECT SUMMARY

This project is a Node.js and Express application using a RESTful API and MVC architecture, written in JavaScript to serve data from a PostgreSQL (PSQL) database. The API is designed to manage a collection of books, users, genres, and reviews. This project can be adapted to other projects such as blogs, forums, and social media platforms. Its functionality covers managing books, users, genres, and reviews. Users can post, update, and delete books and reviews. The user authentication ensures that only authorized users can perform certain actions.

### Available endpoints

- `GET /api` ➡️ GET a list of all of the available endpoints.

- `GET /api/genres` ➡️ GET a list of genres for the books

- `POST /api/genres` ➡️ POST a new genre.

- `GET /api/books` ➡️ GET a list of books. The users can filter by genre, author, title, rating or review count. They can also choose a sort order and decide on the pagination limits or view specific pages of results.

- `POST /api/books` ➡️ POST a new book.

- `GET /api/books/:book_id` ➡️ GET a specific book using an book_id parameter.

- `DELETE /api/books/:book_id` ➡️ DELETE a specific book along with its reviews.

- `GET /api/books/:book_id/reviews` ➡️ GET a list of the reviews associated with a specific book.

- `POST /api/books/:book_id/reviews` ➡️ POST a new review to a specific book.

- `PATCH /api/reviews/:review_id` ➡️ PATCH a specific review by changing its rating and body.

- `DELETE /api/reviews/:review_id` ➡️ DELETE a specific review using its review_id as parameter.

- `GET /api/users` ➡️ GET a list of the registered users.

- `POST /api/users` ➡️ POST a new user.

- `GET /api/users/:username` ➡️ GET a specific user using a username parameter.

- `DELETE /api/reviews/:username` ➡️ DELETE a user if you are the owen .

- `POST /api/users/login` ➡️ POST Logs in a user and responds with a JWT token if successful.

- `POST /api/users/logout` ➡️ POST Logs out a user and invalidates the JWT token.

---

## 🛠️ How to clone repo, install dependencies, seed local databases and run tests

### 1. Clone the repo

HTTP link to clone the repository:

```
https://github.com/TennoAndros/be-cf5-project
```

After clone is finished follow the next step.

### 2. Install dependencies 📦

Navigate to that directory in your terminal and run the below command to install all of the dependencies needed as found in the package.json file.
The install command is: `npm i` .

This repo was created using:

**-Production dependencies-**

| Package                 | Version   | Usage                                         |
| :---------------------- | :-------- | :-------------------------------------------- |
| <sub>dotenv</sub>       | `^16.4.5` | _Handles environment variable files_          |
| <sub>express</sub>      | `^4.19.2` | _Routes API requests_                         |
| <sub>pg-format</sub>    | `^1.0.4`  | _Formats PostgreSQL to prevent SQL injection_ |
| <sub>pg</sub>           | `^8.12.0` | _Queries PostgreSQL database_                 |
| <sub>jsonwebtoken</sub> | `^9.0.2`  | _Creates and verifies JSON Web Tokens_        |
| <sub>bcrypt</sub>       | `^5.1.1`  | _Hashes passwords for secure storage_         |

**-Development dependencies-**

| Package                  | Version   | Usage                                                  |
| :----------------------- | :-------- | :----------------------------------------------------- |
| <sub>jest</sub>          | `^29.7.0` | _Provides framework for testing functionality_         |
| <sub>jest-extended</sub> | `^4.0.2`  | _Adds additional jest testing identifiers_             |
| <sub>jest-sorted</sub>   | `^1.0.15` | _Adds sort testing for jest_                           |
| <sub>supertest</sub>     | `^7.0.0`  | _Adds simplified web request testing_                  |
| <sub>cross-env</sub>     | `^7.0.3`  | _Sets and uses environment variables across platforms_ |
| swagger-jsdoc            | `^6.2.8`  | _Generates Swagger/OpenAPI specification from JSDoc_   |
| swagger-themes           | `^1.4.3`  | _Themes for Swagger UI_                                |
| swagger-ui-express       | `^5.0.1`  | _Middleware to serve Swagger UI with Express_          |

### 3. Seed local databases

In order to seed the local database with both the development and test databases you need to run a script.
The command is: `npm run setup-dbs` .
Then to populate them with placeholder data run: `npm run seed` .

### 4. Run tests 🧪

The script command to run the tests is: `npm t` .

---

## 🗒️ Creating the environment variables

To connect in database locally you will need to create two files in your root directory:

- .env.development
- .env.test

Both of which will need to include PGDATABASE=<database_name_here>
Database name can be found in `./db/seeds/setup.sql` . You can amend the name of your database with something of your own choice.

**_THIS IS VITAL FOR CONNECTING THE TWO DATABASES LOCALLY._**

---

## ⚙️ System Setup

The project was created using the listed versions of Node, PostgreSQL and npm:

- [Node](https://nodejs.org/en/) (version v20.14.0)
- [PostgreSQL](https://www.postgresql.org/) (version 16.3)
- [npm](https://www.npmjs.com/) (version 10.7.0)

It might work with other versions but they haven't been tested.
