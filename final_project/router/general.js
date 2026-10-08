const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => Promise.resolve(books);
    const data = await getBooks();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const getBook = (id) =>
      new Promise((resolve, reject) => {
        const book = books[id];
        if (book) resolve(book);
        else reject(new Error("Book not found"));
      });

    const book = await getBook(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/author/:author', async function (req, res) {
  const authorName = req.params.author;
  try {
    const getByAuthor = (author) =>
      new Promise((resolve, reject) => {
        const matching = [];
        Object.keys(books).forEach((key) => {
          if (books[key].author === author) {
            matching.push({ [key]: books[key] });
          }
        });
        if (matching.length > 0) resolve(matching);
        else reject(new Error("No books found for this author"));
      });

    const result = await getByAuthor(authorName);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/title/:title', async function (req, res) {
  const titleName = req.params.title;
  try {
    const getByTitle = (title) =>
      new Promise((resolve, reject) => {
        const matching = [];
        Object.keys(books).forEach((key) => {
          if (books[key].title === title) {
            matching.push({ [key]: books[key] });
          }
        });
        if (matching.length > 0) resolve(matching);
        else reject(new Error("No books found for this title"));
      });

    const result = await getByTitle(titleName);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;