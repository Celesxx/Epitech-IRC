const mongoose = require('mongoose');


const channelSchema = new mongoose.Schema({
  channel: String,
  creator: String
}, {
  timestamps: true,
});

//ajouter a la table message, les messages(name + message + timestamps)
module.exports = mongoose.model('Channel', channelSchema);
