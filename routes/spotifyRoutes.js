const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const { translateText } = require('../utils/translate');
const UserProfile = require('../models/UserProfile');

const GENIUS_API_URL = 'https://api.genius.com';

// Function to write data to a JSON file
const writeToFile = (filename, data) => {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

// Function to get lyrics from Genius
const GENIUS_BASE_URL = 'https://api.genius.com';

const getLyricsFromGenius = async (trackId) => {
  try {
    const spotifyResponse = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
      }
    });

    const songName = spotifyResponse.data.name;
    const artistName = spotifyResponse.data.artists[0].name;

    const searchResponse = await axios.get(`${GENIUS_BASE_URL}/search?q=${encodeURIComponent(songName + ' ' + artistName)}`, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      }
    });

    if (searchResponse.data.response.hits.length === 0) {
      throw new Error('No lyrics found for this song');
    }

    const songPath = searchResponse.data.response.hits[0].result.path;
    const lyricsPage = await axios.get(`https://genius.com${songPath}`);
    const $ = cheerio.load(lyricsPage.data);
    const lyrics = $('.lyrics').text().trim() || $('[class^="Lyrics__Container"]').text().trim();

    if (lyrics) {
      return lyrics;
    } else {
      throw new Error('Lyrics not found on the page');
    }
  } catch (error) {
    console.error('Error fetching lyrics from Genius:', error.message);
    throw error;
  }
};

module.exports = { getLyricsFromGenius };


// Route to get top tracks
router.get('/top-tracks', async (req, res) => {
    const accessToken = req.query.accessToken;

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const topTracks = response.data.items;

        // Write the top tracks data to a JSON file
        writeToFile('top-tracks.json', topTracks);

        res.json(topTracks);
    } catch (error) {
        console.error(`Error fetching top tracks: ${error}`);
        res.status(500).send('Server error');
    }
});

// Route to translate song lyrics
router.post('/translate-lyrics', async (req, res) => {
    const { trackId, targetLanguage } = req.body;
    try {
        console.log(`Received request to translate lyrics for trackId: ${trackId} to language: ${targetLanguage}`);

        const lyrics = await getLyricsFromGenius(trackId);
        if (!lyrics) {
            throw new Error('Lyrics not found');
        }
        console.log(`Lyrics fetched: ${lyrics}`);

        const translatedLyrics = await translateText(lyrics, targetLanguage);
        console.log(`Translated lyrics: ${translatedLyrics}`);
        writeToFile('trans-lyrics.json', { translatedLyrics });

        res.json({ translatedLyrics });
    } catch (error) {
        console.error('Error translating lyrics:', error.message);
        res.status(500).send(`Server error: ${error.message}`);
    }
});

// Route to save user preferences
router.post('/preferences', async (req, res) => {
    const { userId, language, genres } = req.body;
    try {
        let userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            userProfile = new UserProfile({ userId, preferences: { language, genres } });
        } else {
            userProfile.preferences.language = language;
            userProfile.preferences.genres = genres;
        }
        await userProfile.save();

        // Write the user profile data to a JSON file
        writeToFile('user-preferences.json', userProfile);

        res.json(userProfile);
    } catch (error) {
        console.error('Error saving user preferences:', error);
        res.status(500).send('Server error');
    }
});

// Route to generate playlist

router.post('/generate-playlist', async (req, res) => {
    const { userId, targetLanguage } = req.body;
    try {
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
            return res.status(404).send('User profile not found');
        }

        const preferredGenres = userProfile.preferences.genres;

        const response = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: {
                Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
            },
            params: {
                seed_genres: preferredGenres.join(','),
            },
        });

        const recommendedTracks = response.data.tracks;

        // Remove the lyrics fetching and translation part
        const tracksWithoutLyrics = recommendedTracks.map(track => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map(artist => artist.name),
            preview_url: track.preview_url
        }));
        
        writeToFile('generated-playlist.json', tracksWithoutLyrics)
        res.json(tracksWithoutLyrics);
    } catch (error) {
        console.error('Error generating playlist:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;