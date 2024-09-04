const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true, unique: true },
  win: { type: Number, required: true, default: 0 }, // Default value set to 0
  loss: { type: Number, required: true, default: 0 }, // Default value set to 0
  resetToken: { type: String, default: null },
  resetTokenExpiration: { type: Date, default: null }
});
  

module.exports = mongoose.model('User', userSchema);
