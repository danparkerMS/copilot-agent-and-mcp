import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const BookDetail = () => {
  const { bookId } = useParams();
  const token = useAppSelector(state => state.user.token);
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isActive = true;

    async function loadBook() {
      setStatus('loading');
      try {
        const res = await fetch(`http://localhost:4000/api/books/${encodeURIComponent(bookId)}`);
        if (!res.ok) {
          throw new Error('Book not found');
        }
        const data = await res.json();
        if (isActive) {
          setBook(data);
          setStatus('succeeded');
        }
      } catch {
        if (isActive) {
          setBook(null);
          setStatus('failed');
        }
      }
    }

    loadBook();

    return () => {
      isActive = false;
    };
  }, [bookId]);

  if (status === 'loading') return <div>Loading book...</div>;
  if (status === 'failed') return <div>Book not found.</div>;

  return (
    <div>
      <h2>{book.title}</h2>
      <p>by {book.author}</p>
      {token ? (
        <p><Link to="/favorites">Back to favorites</Link></p>
      ) : (
        <p><Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to save this book to your favorites.</p>
      )}
    </div>
  );
};

export default BookDetail;
