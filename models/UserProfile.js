const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    genres: [String],
  },
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
