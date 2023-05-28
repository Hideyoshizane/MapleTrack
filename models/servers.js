const Joi = require('joi');
const mongoose = require('mongoose');
const { Character, createDefaultCharacters, defaultCharacters  } = require('./character');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
});

async function createDefaultServers() {
    const defaultServers = [
      { name: 'Scania' },
      { name: 'Bera' },
      { name: 'Aurora' },
      { name: 'Elysium' },
      { name: 'Reboot' },
    ];
  
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


  serverSchema.statics.createMissingCharacters = async function() {
    const servers = await this.find().populate({
      path: 'characters',
      model: 'Character',
    });
    const updatedDefaultCharacters = await createDefaultCharacters();

    for (const server of servers) {
      const characterCodes = server.characters.map(character => character.code);
  
      for (const character of updatedDefaultCharacters) {
        if (!characterCodes.includes(character.code)) {
          const modifiedCharacterData = await changeIds(character, server.name);
          await modifiedCharacterData.save();
  
          await this.findOneAndUpdate(
            { _id: server._id },
            { $addToSet: { characters: modifiedCharacterData._id } }
          );
  
          characterCodes.push(character.code); // Update the characterCodes array
          console.log(server.name);
        }
      }
    }
  };
  
  
  
const Server = mongoose.model('Server', serverSchema);

  

module.exports = {Server, serverSchema , createDefaultServers, createMissingCharacters: Server.createMissingCharacters };



  
      /*const existingCharacterCount = serverCharacterCodes.length;
      const missingCharacterCount = Math.max(0, characterCount - existingCharacterCount);
  
      const uniqueMissingCharacters = missingCharacters.filter(character => !serverCharacterCodes.includes(character.code));
  
      const charactersToAdd = uniqueMissingCharacters.slice(0, missingCharacterCount);
  
      for (const missingCharacter of charactersToAdd) {
        console.log(missingCharacter);
        const newCharacter = new Character({
          _id: generateUniqueId(),
          name: missingCharacter.name,
          level: missingCharacter.level,
          targetLevel: missingCharacter.targetLevel,
          class: missingCharacter.class,
          code: missingCharacter.code,
          job: missingCharacter.job,
          legion: missingCharacter.legion,
          linkSkill: missingCharacter.linkSkill,
          bossing: missingCharacter.bossing,
          ArcaneForce: [...missingCharacter.ArcaneForce],
          SacredForce: [...missingCharacter.SacredForce]
        });
  
        server.characters.push(newCharacter);
        await newCharacter.save();
      }
  
      if (missingCharacterCount > 0) {
        await server.save();
        console.log('Server saved successfully.');
      } else {
        console.log('No missing characters. Server not saved.');
      }*/