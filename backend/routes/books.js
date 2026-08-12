const express = require('express');

function createBooksRouter({ booksFile, readJSON, writeJSON, authenticateToken }) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const books = readJSON(booksFile);
    res.json(books);
  });

  router.get('/:bookId', (req, res) => {
    const books = readJSON(booksFile);
    const book = books.find(b => b.id === req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  });

  // POST /books removed: adding books is not allowed

  return router;
}

module.exports = createBooksRouter;
