const Joi = require('joi');
const mongoose = require('mongoose');
const { Character, defaultCharacters, createDefaultCharacters  } = require('./character');


const servers = mongoose.model('Server', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
}));



async function createDefaultServers() {
    const defaultServers = [
      { name: 'Scania' },
      { name: 'Bera' },
      { name: 'Aurora' },
      { name: 'Elysium' },
      { name: 'Reboot' },
    ];
  
    const savedServers = await servers.insertMany(defaultServers);
  
    // Assign default characters to each server
    for (const server of savedServers) {
      server.characters = (await createDefaultCharacters()).map((char) => char._id);
      await server.save();
    }
  
    return savedServers;
  }


module.exports = {servers, createDefaultServers};
