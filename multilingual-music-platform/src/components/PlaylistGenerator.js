import React, { useState } from 'react';
import axios from 'axios';

const PlaylistGenerator = () => {
  const [userId, setUserId] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [playlist, setPlaylist] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/spotify/generate-playlist', {
        userId,
        targetLanguage,
      });
      setPlaylist(response.data);
      setError(''); // Clear error on success
    } catch (error) {
      console.error('Error generating playlist:', error);
      setError('Error generating playlist');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>User ID:</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        </div>
        <button type="submit">Generate Playlist</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <h2>Generated Playlist</h2>
        <ul>
          {playlist.map((track, index) => (
            <li key={index}>
              <p><strong>{track.name}</strong> by {track.artists.map(artists => track.artists).join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlaylistGenerator;