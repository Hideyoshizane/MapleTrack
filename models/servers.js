const Joi = require('joi');
const mongoose = require('mongoose');
const { Character, createDefaultCharacters, defaultCharacters, updateCharacters } = require('./character');
const { User } = require('./user');



const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img:{
    type: String,
    required: true
  },
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
});

const defaultServers = [
  { name: 'Scania' ,img:  '../../assets/icons/servers/scania'  },
  { name: 'Bera'   ,img:  '../../assets/icons/servers/bera'    },
  { name: 'Aurora' ,img:  '../../assets/icons/servers/aurora'  },
  { name: 'Elysium',img:  '../../assets/icons/servers/elysium' },
  { name: 'Reboot' ,img:  '../../assets/icons/servers/reboot'  },
];

async function createDefaultServers() {
   
    const savedServers = await Server.insertMany(defaultServers);
    const savedCharacters = [];

    for (const server of savedServers) {
      const characters = await createDefaultCharacters(server.name);
      savedCharacters.push(...characters);
      server.characters = characters.map(char => char._id); // Store character ObjectId in the server's characters array
    }
  
    await Promise.all(savedServers.map(server => server.save())); // Save the servers with the updated characters array
  
    // Save the default characters in the Character database
    await Character.insertMany(savedCharacters);
  
    return savedServers;
  } 



    const changeIds = async (characterData, serverName) => {
      const updatedID = new Character();
      updatedID._id = mongoose.Types.ObjectId();
      updatedID.name = characterData.name;
      updatedID.level = characterData.level;
      updatedID.targetLevel = characterData.targetLevel;
      updatedID.class = characterData.class;
      updatedID.code = characterData.code;
      updatedID.job = characterData.job;
      updatedID.legion = characterData.legion;
      updatedID.linkSkill = characterData.linkSkill;
      updatedID.bossing = characterData.bossing;
      updatedID.server = serverName;
      updatedID.ArcaneForce = await characterData.ArcaneForce.map(arcaneForce => {
        const updatedArcaneForce = { ...arcaneForce.toObject() };
        updatedArcaneForce._id = new mongoose.Types.ObjectId();
        return updatedArcaneForce;
      });
      updatedID.SacredForce = await characterData.SacredForce.map(SacredForce => {
        const updatedSacredForce = { ...SacredForce.toObject() };
        updatedSacredForce._id = new mongoose.Types.ObjectId();
        return updatedSacredForce;
      });
      return updatedID;
    };

    serverSchema.statics.createMissingCharacters = async function(userData) {
      const user = await User.findById(userData._id).populate({
        path: 'servers',
        populate: {
          path: 'characters',
          model: 'Character'
        }
      });
    
      for (const server of user.servers) {
        const characterCodes = server.characters.map(character => character.code);
        const characters = await createDefaultCharacters(server.name);
        const missingCharacters = characters.filter(character => !characterCodes.includes(character.code));
    
        for (const character of missingCharacters) {
          const modifiedCharacterData = await changeIds(character, server.name);
          const newCharacter = new Character(modifiedCharacterData);
          await newCharacter.save();
    
          server.characters.push(newCharacter); // Add the new character object directly
          characterCodes.push(character.code);
    
          console.log(`Added character '${character.code}' to server '${server.name}'.`);
        }
    
        await server.save();
      }
    
      console.log("Default Characters created/updated successfully");
    
      await updateCharacters(defaultCharacters);
    
      console.log("Character updates checked successfully");
    
      await user.save();
    
      return user;
    };
       
    serverSchema.statics.updateServers = async function (userData) {
      const user = await User.findById(userData._id).populate('servers');
      const defaultServerNames = defaultServers.map(server => server.name);
    
      for (const defaultServer of defaultServers) {
        const server = user.servers.find(server => server.name === defaultServer.name);
    
        if (!server) {
          const newServer = new Server(defaultServer);
          await newServer.save();
    
          user.servers.push(newServer._id);
          console.log(`Added server '${newServer.name}'.`);
        }
      }
    
      await user.save();
    
      return user;
    };



const Server = mongoose.model('Server', serverSchema);
module.exports = {Server, serverSchema , createDefaultServers, createMissingCharacters: Server.createMissingCharacters, updateServers: Server.updateServers};

