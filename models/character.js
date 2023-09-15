const mongoose = require('mongoose');
const path = require('path');
const jsonData = require('../public/data/classes.json');
const { User } = require('./user');
const { template } = require('lodash');

const Character = mongoose.model('Character', new mongoose.Schema({
    name: {
        type: String,
    },
    level:{
        type: Number,
    },
    targetLevel:{
      type: Number,
    },
    class: {
      type: String,
    },
    code: {
      type: String,
    },
    job: {
      type: String,
    },
    jobType:{
      type: String,
    },
    legion: {
      type: String,
    },
    linkSkill: { 
      type: String 
    },
    bossing: {
      type: Boolean,
      default: false
    },
    server:{
      type: String,
    },
    userOrigin:{
      type: String,
    },
    ArcaneForce: [{
        name:     {type: String, required: true},
        level:    {type: Number, required: true},
        exp:      {type: Number, required: true},
        minLevel: {type: Number, required: true, editable: false},
        content: [{
          contentType: {type: String,required: true, editable: false},
          expGain:     {type: Number},
          checked:     {type: Boolean},
          minLevel:    {type: Number},
          tries:       {type: Number},
          maxTries:    {type: Number}
        }]
        
    }],
    SacredForce: [{
      name:     {type: String, required: true},
      level:    {type: Number, required: true},
      exp:      {type: Number, required: true},
      minLevel: {type: Number, required: true, editable: false},
      content: [{
        contentType: {type: String,required: true, editable: false},
        expGain:     {type: Number},
        checked:     {type: Boolean},
        minLevel:    {type: Number}
      }]
  }],
}, { strictPopulate: false })); 

const templateCharacter = {
  name: 'Character Name',
  level: 0,
  targetLevel: 10,
  bossing: false,
  job: "1st Class",
  ArcaneForce:[
    {
      name: "Vanish Journey",
      level: 0,
      exp: 0,
      minLevel: 200,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 9,
        checked: false,
        },
        {
          contentType: "Erda Spectrum",
          checked: false,
          tries: 3,
          maxTries: 3
        },
        {
          contentType: "Reverse City",
          checked: false,
          minLevel: 205
        },
      ]
    },
    {
      name: "Chu chu Island",
      level: 0,
      exp: 0,
      minLevel: 210,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 8,
        checked: false,
        },
        {
          contentType: "Hungry Muto",
          checked: false,
          tries: 3,
          maxTries: 3
        },
        {
          contentType: "Yum Yum Island",
          checked: false,
          minLevel: 215
        }
      ]
    },
    {
      name: "Lachelein",
      level: 0,
      exp: 0,
      minLevel: 220,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 11,
        checked: false,
        },
        {
          contentType: "Dream Defender",
          checked: false,
          tries: 3,
          maxTries: 3
        }
      ]
    },
    {
      name: "Arcana",
      level: 0,
      exp: 0,
      minLevel: 225,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 9,
        checked: false,
        },
        {
          contentType: "Spirit Savior",
          checked: false,
          tries: 3,
          maxTries: 3
        }
      ]
    },
    {
      name: "Morass",
      level: 0,
      exp: 0,
      minLevel: 230,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 8,
        checked: false,
        },
        {
          contentType: "Ranheim Defense",
          checked: false,
          tries: 3,
          maxTries: 3
        }
      ]
    },
    {
      name: "Esfera",
      level: 0,
      exp: 0,
      minLevel: 235,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 8,
        checked: false,
        },
        {
          contentType: "Esfera Guardian",
          checked: false,
          tries: 3,
          maxTries: 3
        }
      ]
    },
  ],
  SacredForce: 
  [
    {
    name: "Cernium",
    level: 0,
    exp: 0,
    minLevel: 260,
      content: [{
          contentType: "Cernium",
          expGain: 10,
          checked: false,
        },
        {
          contentType: "Burning Cernium",
          expGain: 5,
          checked: false,
          minLevel: 265
        }
      ]
    },
    {
      name: "Arcus",
      level: 0,
      exp: 0,
      minLevel: 270,
        content: [{
            contentType: "Daily Quest",
            expGain: 5,
            checked: false,
          },
        ]
    },
    {
      name: "Odium",
      level: 0,
      exp: 0,
      minLevel: 275,
        content: [{
            contentType: "Daily Quest",
            expGain: 5,
            checked: false,
          },
        ]
    },
    
  ]
}

var defaultCharacters = [];

async function createDefaultCharacters(serverName, username) {
  for (const jsonDataIndex of jsonData) {
    
    const createdCharacter = await createCharacter(jsonDataIndex, serverName, username);
    defaultCharacters.push(createdCharacter);
  }
  const exportCharacters = [...defaultCharacters];
  defaultCharacters.length = 0;
  return exportCharacters;
}

async function createMissingCharacters(userID, username){
  const userData = await User.findById(userID)
  .populate({
    path: 'servers',
    populate: {
      path: 'characters',
      model: Character,
      select: 'code'
    }
  }).exec();
  
  for(server of userData.servers){
    const serverCharacterCodes = server.characters.map((character) => character.code);
    const serverMissingCharacters = jsonData.filter(
      (character) => !serverCharacterCodes.includes(character.code)
    );
    for(missingCharacter  of serverMissingCharacters){
      createdCharacter = await createCharacter(missingCharacter , server.name, username);
      server.characters.push(createdCharacter._id);
      await createdCharacter.save();
      await server.save();
      console.log(`${createdCharacter.class} created on ${server.name} server`);
    }
  }
}

async function createCharacter(jsonData, serverName, username){
  var character = {
    name: templateCharacter.name,
    level: templateCharacter.level,
    targetLevel: templateCharacter.targetLevel,
    class: jsonData.className,
    code: jsonData.code,
    job: templateCharacter.job,
    jobType: jsonData.jobType,
    legion: jsonData.legionType  ,
    linkSkill: jsonData.linkSkill,
    bossing: templateCharacter.bossing,
    server: serverName,
    userOrigin: username,
    ArcaneForce: [...templateCharacter.ArcaneForce],
    SacredForce: [...templateCharacter.SacredForce],
  }
  return new Character(character);
}

async function updateCharacters(userID) {
  const userData = await User.findById(userID)
    .populate({
      path: 'servers',
      populate: {
        path: 'characters',
        model: Character,
        populate: [
          { path: 'ArcaneForce' },
          { path: 'SacredForce' },
        ],
      },
    })
    .exec();

  for (const server of userData.servers) {
    for (const character of server.characters) {
      await updateForceData(character, 'ArcaneForce', templateCharacter.ArcaneForce);
      await updateForceData(character, 'SacredForce', templateCharacter.SacredForce);

      await character.save();
    }
  }
}



async function updateForceData(updatingCharacter, forceType, templateForce) {
  const templateContentMap = new Map();
  const usedKeys = new Set();

  for (const templateEntry of templateForce) {
    for (const content of templateEntry.content) {
      var key = `${templateEntry.name}-${content.contentType}`;
      templateContentMap.set(key, content);
    }
  }

  var updatedForce = [];
  const updatingForce = updatingCharacter[forceType] || [];

  //update Existing contentType within Force objects
  for (const updatingEntry of updatingForce) {
    const updatedContent = [];
    for (const content of updatingEntry.content) {
      var key = `${updatingEntry.name}-${content.contentType}`;
      usedKeys.add(key);
      const templateContent = templateContentMap.get(key);
      if (templateContent) {
        const updatedContentEntry = { ...templateContent, checked: content.checked };
        updatedContent.push(updatedContentEntry);
      }
    }
    const updatedEntry = { ...updatingEntry, content: updatedContent };
    updatedForce.push(updatedEntry);
  }
  
  //Insert missing content of contentType array
  for (const [key, value] of templateContentMap.entries()) {
    if (!usedKeys.has(key)) {
      const [name, contentType] = key.split('-');
      const missingContent = templateContentMap.get(key);
      const existingEntryIndex = updatingForce.findIndex((entry) => entry.name === name);
      if (existingEntryIndex !== -1) { 
      const updatingEntry = updatingForce[existingEntryIndex];
      const updatedContent = [...updatingEntry.content, missingContent];
      updatingEntry.content.push(missingContent);
      updatedForce[existingEntryIndex] = updatingEntry;
      }
    }
  }

 //Insert missing object from Force array
  for (const templateEntry of templateForce) {
    const existingEntry = updatingForce.find((entry) => entry.name === templateEntry.name);
    if (!existingEntry) {
      const newEntry = {
        level: templateEntry.level,
        exp: templateEntry.exp,
        minLevel: templateEntry.minLevel,
        name: templateEntry.name,
        content: templateEntry.content.map((content) => ({ ...content })),
      };
      updatedForce.push(newEntry);
    }
  }

  //Remove objects from Force array that are not present in the Template
  const missingEntries = updatingForce.filter((updatingEntry) =>
    !templateForce.some((templateEntry) => templateEntry.name === updatingEntry.name)
  );
  updatingCharacter[forceType] = updatedForce;
  const missingNames = missingEntries.map((missingEntry) => missingEntry.name);
  updatingCharacter[forceType] = updatingCharacter[forceType].filter((updatingEntry) => !missingNames.includes(updatingEntry.name));

}


module.exports = { Character, createDefaultCharacters, createMissingCharacters, updateCharacters };
