const mongoose = require('mongoose');
const path = require('path');
const { defaultServers } = require('./servers');
const {DateTime} = require('luxon');

const bossList = mongoose.model('bossList', new mongoose.Schema({
    userOrigin:{
      type: String,
    },
    weeklyBosses:{
      type: Number,
    },
    totalGains:{
      type: Number,
    },
    server:[{
      name: String,
      characters: [{
        id:       {type: String},
        name:     {type: String},
        code:     {type: String},
        level:    {type: Number, required: true},
        bosses: [{
          name:      {type: String},
          value:     {type: Number},
          reset:     {type: String},
          date:      {type: Date}
        }]  
      }],
    }],
}, { strictPopulate: false })); 

async function createBossList(username){
  const newBossList = new bossList({
    userOrigin: username,
    weeklyBosses: 0,
    totalGains: 0,
    server: defaultServers.map(server => ({
      name: server.name,
      characters: [],
    })),
  });

  await newBossList.save();
}

async function insertOnBossList(username, characterData, server){
  const bossListDocument  = await bossList.findOne({userOrigin: username });
  const serverToUpdate = bossListDocument.server.find(s => s.name === server);
  const characterIndex = serverToUpdate.characters.findIndex((char) => char.id === characterData.id);

  //if character already exists, update it. Else, insert it on the list.
  if(characterIndex !== -1) {
    serverToUpdate.characters[characterIndex].name = characterData.name;
    serverToUpdate.characters[characterIndex].level = characterData.level;
    await bossListDocument.save();
  }
  else{
    const characterToList = {
      id: characterData.id,
      name: characterData.name,
      code: characterData.code,
      level: characterData.level,
    }
    serverToUpdate.characters.push(characterToList);
    await bossListDocument.save();
  }
}

async function removeFromBossList(username, characterID, server){
  const bossListDocument  = await bossList.findOne({userOrigin: username });
  const serverToUpdate = bossListDocument.server.find(s => s.name === server);
  
  const characterIndex = serverToUpdate.characters.findIndex((char) => char.id === characterID);
  if (characterIndex !== -1) {
    serverToUpdate.characters.splice(characterIndex, 1);
    await bossListDocument.save();
  } 
}

async function removeBossFromList(username, characterID){

}

async function addBossToList(username, characterID){
  
}

module.exports = { bossList, createBossList, insertOnBossList, removeFromBossList};
