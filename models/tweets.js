const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  tweet: String,
  date: { type: Date, default: Date.now() },
  likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
});

const Tweet = mongoose.model('tweet', tweetSchema);

module.exports = Tweet;