import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFavorites, removeFavorite } from '../store/favoritesSlice';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.favorites.items);
  const status = useAppSelector(state => state.favorites.status);
  const token = useAppSelector(state => state.user.token);
  const navigate = useNavigate();
  const [shareFeedback, setShareFeedback] = useState({});
  const handleRemoveFavorite = bookId => {
    dispatch(removeFavorite({ token, bookId }));
  };

  const copyShareLink = async shareUrl => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (!copied) {
      throw new Error('Copy failed');
    }
  };

  const handleShareFavorite = async book => {
    const shareUrl = new URL(`/books/${encodeURIComponent(book.id)}`, window.location.origin).toString();
    const shareData = {
      title: book.title,
      text: `Check out "${book.title}" by ${book.author}.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareFeedback({ [book.id]: { type: 'success', message: 'Share sheet opened.' } });
      } else {
        await copyShareLink(shareUrl);
        setShareFeedback({ [book.id]: { type: 'success', message: 'Share link copied.' } });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      setShareFeedback({ [book.id]: { type: 'error', message: 'Unable to share this book.' } });
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    dispatch(fetchFavorites(token));
  }, [dispatch, token, navigate]);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Failed to load favorites.</div>;

  return (
    <div>
      <h2>My Favorite Books</h2>
      {favorites.length === 0 ? (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '2rem auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
          color: '#888',
        }}>
          <p>No favorite books yet.</p>
          <p>
            Go to the <a href="/books" onClick={e => { e.preventDefault(); navigate('/books'); }}>book list</a> to add some!
          </p>
        </div>
      ) : (
        <ul>
          {favorites.map(book => (
            <li key={book.id}>
              <strong>{book.title}</strong> by {book.author}
              <button type="button" onClick={() => handleShareFavorite(book)} aria-label={`Share ${book.title}`}>
                Share
              </button>
              <button type="button" onClick={() => handleRemoveFavorite(book.id)}>
                Remove from Favorites
              </button>
              {shareFeedback[book.id] && (
                <span role="status" style={{ marginLeft: '0.5rem' }}>
                  {shareFeedback[book.id].message}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
