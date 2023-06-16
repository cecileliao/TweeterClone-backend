const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname: String,
  username: String,
  password: String,
  avatar: String,
  token: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;