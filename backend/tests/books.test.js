const request = require('supertest');
const express = require('express');
const createApiRouter = require('../routes');
const path = require('path');

const app = express();
app.use(express.json());
app.use('/api', createApiRouter({
  usersFile: path.join(__dirname, '../data/test-users.json'),
  booksFile: path.join(__dirname, '../data/test-books.json'),
  readJSON: (file) => require('fs').existsSync(file) ? JSON.parse(require('fs').readFileSync(file, 'utf-8')) : [],
  writeJSON: (file, data) => require('fs').writeFileSync(file, JSON.stringify(data, null, 2)),
  authenticateToken: (req, res, next) => next(), // No auth for books
  SECRET_KEY: 'test_secret',
}));

describe('Books API', () => {
  it('GET /api/books should return a list of books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/books/:bookId should return a single public book', async () => {
    const listRes = await request(app).get('/api/books');
    const [book] = listRes.body;

    const res = await request(app).get(`/api/books/${book.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(book);
    expect(res.body.favorites).toBeUndefined();
  });

  it('GET /api/books/:bookId should return 404 for unknown books', async () => {
    const res = await request(app).get('/api/books/not-a-book');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Book not found' });
  });

  it('POST /api/books should not be allowed', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ title: 'Test Book', author: 'Test Author' });
    expect([404, 405]).toContain(res.statusCode);
  });
});
