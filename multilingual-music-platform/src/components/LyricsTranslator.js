import React, { useState } from 'react';
import axios from 'axios';

const LyricsTranslator = () => {
  const [trackId, setTrackId] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedLyrics, setTranslatedLyrics] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/spotify/translate-lyrics', {
        trackId,
        targetLanguage,
      });
      setTranslatedLyrics(response.data.translatedLyrics);
      setError(''); // Clear error on success
    } catch (error) {
      console.error('Error translating lyrics:', error);
      setError('Error translating lyrics');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Track ID:</label>
          <input type="text" value={trackId} onChange={(e) => setTrackId(e.target.value)} required />
        </div>
        <div>
          <label>Target Language:</label>
          <input type="text" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} required />
        </div>
        <button type="submit">Translate Lyrics</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h2>Translated Lyrics</h2>
        <p>{translatedLyrics}</p>
      </div>
    </div>
  );
};

export default LyricsTranslator;