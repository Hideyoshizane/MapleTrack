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
      required: true,
      editable: false
    },
    code: {
      type: String,
      required: true,
      editable: false
    },
    job: {
      type: String,
      required: true
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
    ArcaneForce: [{
        name:     {type: String, required: true},
        level:    {type: Number, required: true},
        exp:      {type: Number, required: true},
        minLevel: {type: Number, required: true, editable: false},
        content: [{
          contentType: {type: String,required: true, editable: false},
          expGain:     {type: Number,required: true},
          checked:     {type: Boolean, required: true}
        }]
        
    }],
    SacredForce: [{
      name:     {type: String, required: true},
      level:    {type: Number, required: true},
      exp:      {type: Number, required: true},
      minLevel: {type: Number, required: true, editable: false},
      content: [{
        contentType: {type: String,required: true, editable: false},
        expGain:     {type: Number,required: true},
        checked:     {type: Boolean, required: true}
      }]
  }],
})); 

const defaultCharacters = [];

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

async function createDefaultCharacters() {
  const linkSkillId = await initialize('Invincible Belief');
  const legionId = await legionFind('STR+');

  const defaultCharacters = [{
    name: 'Arale',
    level: 0,
    targetLevel: 10,
    class: 'Adele',
    code: 'adele',
    job: '1st Class',
    legion: legionId,
    linkSkill: linkSkillId,
    bossing: false,
    ArcaneForce: [
      {
        name: 'Vanish Journey',
        level: 0,
        exp: 0,
        minLevel: 200,
        content: [
          { contentType: 'Daily Quest', expGain: 8, checked: false },
        ],
      },
    ],
    SacredForce: [
      {
        name: 'Odium',
        level: 0,
        exp: 0,
        minLevel: 270,
        content: [
          { contentType: 'Daily Quest', expGain: 5, checked: false },
        ],
      },
    ],
  }];

  const characterInstances = defaultCharacters.map(char => new Character(char));
  console.log('characterInstances:', characterInstances);
  const savedCharacters = await Promise.all(characterInstances.map(char => char.save()));
  return savedCharacters;
}

        
module.exports = { Character, defaultCharacters, createDefaultCharacters };
