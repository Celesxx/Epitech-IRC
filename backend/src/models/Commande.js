const mongoose = require('mongoose');


const commandeSchema = new mongoose.Schema({
  commande: String,
  sender: String,
}, {
  timestamps: true,
});

//ajouter a la table message, les messages(name + message + timestamps)
module.exports = mongoose.model('Commande', commandeSchema);
