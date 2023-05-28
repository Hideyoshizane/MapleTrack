const Joi = require('joi');
const mongoose = require('mongoose');
const {LinkSkill } = require('./linkSkill');
const { LegionSystem } = require('./legion');



const Character = mongoose.model('Character', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    level:{
        type: Number,
        required: true
    },
    targetLevel:{
      type: Number,
      required: true
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
    legion: {
      type: mongoose.Schema.Types.ObjectId, ref: 'LegionSystem' 
    },
    linkSkill: { 
      type: mongoose.Schema.Types.ObjectId, ref: 'LinkSkill' 
    },
    bossing: {
      type: Boolean,
      default: false
    },
    server:{
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
          checked:     {type: Boolean}
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
        checked:     {type: Boolean}
      }]
  }],
})); 

const defaultCharacters = [];
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
        expGain: 8,
        checked: false,
        },
        {
          contentType: "Erda Spectrum",
          checked: false,
        },
        {
          contentType: "Reverse City",
          checked: false,
        }
      ]
    },
    {
      name: "Chuchu Island",
      level: 0,
      exp: 0,
      minLevel: 210,
      content:[
        {
        contentType: "Daily Quest",
        expGain: 4,
        checked: false,
        },
        {
          contentType: "Hungry Muto",
          checked: false,
        },
        {
          contentType: "Yum Yum Island",
          checked: false,
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
        expGain: 8,
        checked: false,
        },
        {
          contentType: "Dream Defender",
          checked: false,
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
        expGain: 8,
        checked: false,
        },
        {
          contentType: "Spirit Savior",
          checked: false,
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
          expGain: 6,
          checked: false,
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
          expGain: 6,
          checked: false,
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
          expGain: 5,
          checked: false,
        },
        {
          contentType: "Burning Cernium",
          expGain: 5,
          checked: false,
        },
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
    }
  ]
}

async function initialize(linkSkillName){
  var linkSkillSearch = await LinkSkill.findOne({ name: linkSkillName }).populate('linkSkill');
  var linkSkillId = linkSkillSearch.id;
  return linkSkillId;
}

async function legionFind(legionCode){
  var legionSearch = await LegionSystem.findOne({ name: legionCode }).populate('LegionSystem');
  var legionSearchID = legionSearch.id;
  return legionSearchID;
}

async function createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName) {
  const character = {
  name:         templateCharacter.name,
  level:        templateCharacter.level,
  targetLevel:  templateCharacter.targetLevel,
  class:        classParameter,
  code:         codeParameter,
  job:          templateCharacter.job,
  legion:       legionId,
  linkSkill:    linkSkillId,
  bossing:      templateCharacter.bossing,
  server:       serverName,
  ArcaneForce:  [...templateCharacter.ArcaneForce],
  SacredForce:  [...templateCharacter.SacredForce],
  }
  return new Character(character);
}

async function createDefaultCharacters(serverName) {
  var linkSkillId = await initialize('Invincible Belief');
  var legionId = await legionFind('STR+');
  classParameter = "Adele";
  codeParameter = "adele";
  var placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  linkSkillId = await initialize('Invincible Belief');
  legionId = await legionFind('STR+');
  classParameter = "Blaster";
  codeParameter = "blaster";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);












  const characters = [...defaultCharacters];
  defaultCharacters.length = 0;
  return characters;
}


        
module.exports = { Character, defaultCharacters, createDefaultCharacters };
