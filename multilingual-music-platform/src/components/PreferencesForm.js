import React, { useState } from 'react';
import axios from 'axios';

const PreferencesForm = () => {
  const [userId, setUserId] = useState('');
  const [language, setLanguage] = useState('');
  const [genres, setGenres] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const genresArray = genres.split(',').map(genre => genre.trim());
    try {
      const response = await axios.post('http://localhost:5000/api/spotify/preferences', {
        userId,
        language,
        genres: genresArray,
      });
      console.log('User preferences saved:', response.data);
      setError(''); // Clear error on success
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Error saving preferences');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>User ID:</label>
        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />
      </div>
      <div>
        <label>Preferred Language:</label>
        <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} required />
      </div>
      <div>
        <label>Preferred Genres (comma-separated):</label>
        <input type="text" value={genres} onChange={(e) => setGenres(e.target.value)} required />
      </div>
      <button type="submit">Save Preferences</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default PreferencesForm;