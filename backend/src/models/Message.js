const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  content: String,
  name: String,
}, {
  timestamps: true,
});

//ajouter a la table message, les messages(name + message + timestamps)
module.exports = mongoose.model('Message', messageSchema);
