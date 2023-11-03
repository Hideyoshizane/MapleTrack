const mongoose = require('mongoose');
const path = require('path');
const jsonData = require('../public/data/classes.json');
const { User } = require('./user');
const { template } = require('lodash');
const {DateTime} = require('luxon');

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
        content: [{
          contentType: {type: String,required: true, editable: false},
          checked:     {type: Boolean},
          date:        {type: Date},
          tries:       {type: Number},
          maxTries:    {type: Number},
        }]
        
    }],
    SacredForce: [{
      name:     {type: String, required: true},
      level:    {type: Number, required: true},
      exp:      {type: Number, required: true},
      content: [{
        contentType: {type: String,required: true, editable: false},
        checked:     {type: Boolean},
        date:        {type: Date}
      }]
  }],
}, { strictPopulate: false })); 

const templateCharacter = {
  name: 'Character Name',
  level: 0,
  targetLevel: 10,
  bossing: false,
  ArcaneForce:[
    {
      name: "Vanish Journey",
      level: 1,
      exp: 1,
      content:[
        {
        contentType: "Daily Quest",
        checked: false,
        date: null
        },
        {
          contentType: "Erda Spectrum",
          checked: false,
          tries: 3,
          maxTries: 3,
          date: null
        },
        {
          contentType: "Reverse City",
          checked: false,
        },
      ]
    },
    {
      name: "Chu Chu Island",
      level: 1,
      exp: 1,
      content:[
        {
        contentType: "Daily Quest",
        checked: false,
        date: null
        },
        {
          contentType: "Hungry Muto",
          checked: false,
          tries: 3,
          maxTries: 3,
          date: null
        },
        {
          contentType: "Yum Yum Island",
          checked: false,
        }
      ]
    },
    {
      name: "Lachelein",
      level: 1,
      exp: 1,
      content:[
        {
        contentType: "Daily Quest",
        checked: false,
        date: null
        },
        {
          contentType: "Dream Defender",
          checked: false,
          tries: 3,
          maxTries: 3,
          date: null
        }
      ]
    },
    {
      name: "Arcana",
      level: 1,
      exp: 1,
      content:[
        {
        contentType: "Daily Quest",
        checked: false,
        date: null
        },
        {
          contentType: "Spirit Savior",
          checked: false,
          tries: 3,
          maxTries: 3,
          date: null
        }
      ]
    },
    {
      name: "Morass",
      level: 1,
      exp: 1,
      content:[
        {
        contentType: "Daily Quest",
        checked: false,
        date: null
        },
        {
          contentType: "Ranheim Defense",
          checked: false,
          tries: 3,
          maxTries: 3,
          date: null
        }
      ]
    },
    {
      name: "Esfera",
      level: 1,
      exp: 1,
      content:[
        {
        contentType: "Daily Quest",
        checked: false,
        date: null
        },
        {
          contentType: "Esfera Guardian",
          checked: false,
          tries: 3,
          maxTries: 3,
          date: null
        }
      ]
    },
  ],
  SacredForce: 
  [
    {
    name: "Cernium",
    level: 1,
    exp: 1,
      content: [{
          contentType: "Daily Quest",
          checked: false,
          date: null
        },
        {
          contentType: "Burning Cernium",
          checked: false,
        }
      ]
    },
    {
      name: "Arcus",
      level: 1,
      exp: 1,
        content: [{
            contentType: "Daily Quest",
            checked: false,
            date: null
          },
        ]
    },
    {
      name: "Odium",
      level: 1,
      exp: 1,
        content: [{
            contentType: "Daily Quest",
            checked: false,
            date: null
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
    const serverCharacterCodes = server.characters.map((character) => character.class);
    const serverMissingCharacters = jsonData.filter(
      (character) => !serverCharacterCodes.includes(character.class)
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

async function updateCharactersWeekly(userID) {
  try {
    const userData = await User.findById(userID)
      .populate({
        path: 'servers',
        populate: {
          path: 'characters',
          model: Character,
          populate: [
            { path: 'ArcaneForce' },
          ],
        },
      })
      .exec();

    const timeNow = DateTime.utc();
    const userLastLogin = DateTime.fromJSDate(userData.date);
    const nextMonday = userLastLogin.plus({ days: 1 }).set({ weekday: 2, hour: 0, minute: 0, second: 0, millisecond: 0 });
    // Check if the last login date is before the most recent Monday midnight (UTC)
    if (timeNow >= nextMonday) {
      for (const server of userData.servers) {
        for (const character of server.characters) {
          for (const force of character.ArcaneForce) {
            force.content[1].tries = Number(3);
          }
          await character.save();
        }   
      }
      userData.date = timeNow;
      await userData.save();
      console.log('Weekly update performed.');
    } else {
      console.log('Weekly update not needed.');
    }
  } catch (error) {
    console.error('Error updating characters weekly:', error);
  }
}

async function updateBossses(){}

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
        const tries = content.tries !== undefined ? content.tries : templateContent.tries;
        const updatedContentEntry = { ...templateContent, checked: content.checked, date: content.date, tries };
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


module.exports = { Character, createDefaultCharacters, createMissingCharacters, updateCharacters, updateCharactersWeekly };
