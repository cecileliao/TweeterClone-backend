const mongoose = require('mongoose');

const trendSchema = mongoose.Schema({
  hashtag: String,
  count: { type: Number, default: 1 },
});

const Trend = mongoose.model('trend', trendSchema);

module.exports = Trend;