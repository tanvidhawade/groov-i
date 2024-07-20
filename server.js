const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const spotifyRoutes = require('./routes/spotifyRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000'
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Use Spotify routes
app.use('/api/spotify', spotifyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});