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
  var linkSkillId = await initialize('Spirit of Freedom');
  var legionId = await legionFind('INT+');
  classParameter = "Battle Mage";
  codeParameter = "battle_mage";
  var placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize('Focus Spirit');
  legionId = await legionFind('IEDM');
  classParameter = "Beast Tamer";
  codeParameter = "beast_tamer";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize('Cygnus Blessing');
  legionId = await legionFind('INT+');
  classParameter = "Blaze Wizard";
  codeParameter = "blaze_wizard";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize('Rune Persistence');
  legionId = await legionFind('RECVRMP');
  classParameter = "Evan";
  codeParameter = "evan";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize('Tide of Battle');
  legionId = await legionFind('INT+');
  classParameter = "Illium";
  codeParameter = "illium";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  
  linkSkillId = await initialize('Elementalism');
  legionId = await legionFind('BOSSDMGM');
  classParameter = "Kanna";
  codeParameter = "kanna";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize('Judgment');
  legionId = await legionFind('INT+');
  classParameter = "Kinesis";
  codeParameter = "kinesis";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  
  linkSkillId = await initialize("Nature's Friend");
  legionId = await legionFind('INT+');
  classParameter = "Lara";
  codeParameter = "lara";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  
  linkSkillId = await initialize("Light Wash");
  legionId = await legionFind('INT+');
  classParameter = "Luminous";
  codeParameter = "luminous";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Empirical Knowledge");
  legionId = await legionFind('MAXMP%');
  classParameter = "Fire & Poison";
  codeParameter = "fire_poison";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Empirical Knowledge");
  legionId = await legionFind('INT+');
  classParameter = "Ice & Lightning";
  codeParameter = "ice_lightning";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  
  linkSkillId = await initialize("Empirical Knowledge");
  legionId = await legionFind('INT+');
  classParameter = "Bishop";
  codeParameter = "bishop";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Thief's Cunning");
  legionId = await legionFind('LUK+');
  classParameter = "Dual Blade";
  codeParameter = "dual_blade";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Cygnus Blessing");
  legionId = await legionFind('LUK+');
  classParameter = "Night Walker";
  codeParameter = "night_walker";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  
  linkSkillId = await initialize("Phantom Instinct");
  legionId = await legionFind('MESO%');
  classParameter = "Phantom";
  codeParameter = "phantom";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Thief's Cunning");
  legionId = await legionFind('CRITRTT');
  classParameter = "Night Lord";
  codeParameter = "night_lord";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Thief's Cunning");
  legionId = await legionFind('LUK+');
  classParameter = "Shadower";
  codeParameter = "shadower";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Hybrid Logic");
  legionId = await legionFind('STDELU');
  classParameter = "Xenon";
  codeParameter = "xenon";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Unfair Advantage");
  legionId = await legionFind('LUK+');
  classParameter = "Cadena";
  codeParameter = "cadena";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  linkSkillId = await initialize("Bravado");
  legionId = await legionFind('LUK+');
  classParameter = "Hoyoung";
  codeParameter = "hoyoung";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Combo Kill Blessing");
  legionId = await legionFind('RECVRHP+');
  classParameter = "Aran";
  codeParameter = "aran";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Noble Fire");
  legionId = await legionFind('STR+');
  classParameter = "Adele";
  codeParameter = "adele";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Spirit of Freedom");
  legionId = await legionFind('IED+');
  classParameter = "Blaster";
  codeParameter = "blaster";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Cygnus Blessing");
  legionId = await legionFind('MAXHP+');
  classParameter = "Dawn Warrior";
  codeParameter = "dawn_warrior";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Wild Rage");
  legionId = await legionFind('BOSSDMG+');
  classParameter = "Demon Avenger";
  codeParameter = "demon_avenger";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Fury Unleashed");
  legionId = await legionFind('STATRES+');
  classParameter = "Demon Slayer";
  codeParameter = "demon_slayer";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Keen Edge");
  legionId = await legionFind('CRIT');
  classParameter = "Hayato";
  codeParameter = "hayato";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Phantom Instinct");
  legionId = await legionFind('STR+');
  classParameter = "Kaiser";
  codeParameter = "kaiser";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Knight's Watch");
  legionId = await legionFind('MAXHP+');
  classParameter = "Mihile";
  codeParameter = "mihile";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Invincible Belief");
  legionId = await legionFind('STR+');
  classParameter = "Hero";
  codeParameter = "hero";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Invincible Belief");
  legionId = await legionFind('STR+');
  classParameter = "Paladin";
  codeParameter = "paladin";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Invincible Belief");
  legionId = await legionFind('MAXHP%');
  classParameter = "Dark Knight";
  codeParameter = "dark_knight";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Rhinne's Blessing");
  legionId = await legionFind('EXP');
  classParameter = "Zero";
  codeParameter = "zero";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);

  
  linkSkillId = await initialize("Adventurer's Curiosity");
  legionId = await legionFind('DEX+');
  classParameter = "Bowmaster";
  codeParameter = "bowmaster";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Adventurer's Curiosity");
  legionId = await legionFind('CRITRT');
  classParameter = "Marksman";
  codeParameter = "marksman";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Time to Prepare");
  legionId = await legionFind('DEX+');
  classParameter = "Kain";
  codeParameter = "kain";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Elven Blessing");
  legionId = await legionFind('SKILLCD');
  classParameter = "Mercedes";
  codeParameter = "mercedes";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Adventurer's Curiosity");
  legionId = await legionFind('DEX+');
  classParameter = "Pathfinder";
  codeParameter = "pathfinder";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Spirit of Freedom");
  legionId = await legionFind('%DMGUP');
  classParameter = "Wild Hunter";
  codeParameter = "wild_hunter";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Cygnus Blessing");
  legionId = await legionFind('DEX+');
  classParameter = "Wind Archer";
  codeParameter = "wind_archer";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Terms and Conditions");
  legionId = await legionFind('DEX+P');
  classParameter = "Angelic Buster";
  codeParameter = "angelic_buster";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Pirate Blessing");
  legionId = await legionFind('STR+P');
  classParameter = "Cannoneer";
  codeParameter = "cannoneer";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Spirit of Freedom");
  legionId = await legionFind('BUFFDUR');
  classParameter = "Mechanic";
  codeParameter = "mechanic";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Pirate Blessing");
  legionId = await legionFind('STR+P');
  classParameter = "Buccaneer";
  codeParameter = "buccaneer";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Pirate Blessing");
  legionId = await legionFind('SUMMND');
  classParameter = "Corsair";
  codeParameter = "corsair";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Close Call");
  legionId = await legionFind('CRTDMG+');
  classParameter = "Shade";
  codeParameter = "shade";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Cygnus Blessing");
  legionId = await legionFind('STR+P');
  classParameter = "Thuder Breaker";
  codeParameter = "thuder_breaker";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  linkSkillId = await initialize("Solus");
  legionId = await legionFind('STR+P');
  classParameter = "Ark";
  codeParameter = "ark";
  placeholderCharacter = await createFromTemplate(templateCharacter, linkSkillId, legionId, classParameter, codeParameter,serverName);
  defaultCharacters.push(placeholderCharacter);


  const characters = [...defaultCharacters];
  defaultCharacters.length = 0;
  return characters;
}
async function updateCharacters(defaultCharacters) {
  const characters = await Character.find();

  for (const character of characters) {
    let isUpdated = false;

    // Check for any new variables in the schema
    const schemaKeys = Object.keys(Character.schema.paths);
    const characterKeys = Object.keys(character.toObject());

    const newKeys = schemaKeys.filter((key) => !characterKeys.includes(key));
    if (newKeys.length > 0) {
      newKeys.forEach((key) => {
        character[key] = undefined;
        isUpdated = true;
      });
    }

    // Check for any new objects or properties in the defaultCharacters' ArcaneForce and SacredForce
    for (const forceType of ['ArcaneForce', 'SacredForce']) {
      const templateForceArray = defaultCharacters[forceType];
      if (templateForceArray && Array.isArray(templateForceArray)) {
        for (const templateForce of templateForceArray) {
          const characterForce = character[forceType].find(
            (force) => force.name === templateForce.name
          );

          if (!characterForce) {
            character[forceType].push(templateForce);
            isUpdated = true;
          } else {
            const templateContentArray = templateForce.content;
            if (templateContentArray && Array.isArray(templateContentArray)) {
              for (const templateContent of templateContentArray) {
                const characterContent = characterForce.content.find(
                  (content) => content.contentType === templateContent.contentType
                );

                if (!characterContent) {
                  characterForce.content.push(templateContent);
                  isUpdated = true;
                }
              }
            }
          }
        }
      }
    }

    // Save the updated character if any changes were made
    if (isUpdated) {
      await character.save();
    }
  }
}async function updateCharacters(defaultCharacters) {
  const characters = await Character.find();

  for (const character of characters) {
    let isUpdated = false;

    // Check for any new variables in the schema
    const schemaKeys = Object.keys(Character.schema.paths);
    const characterKeys = Object.keys(character.toObject());

    const newKeys = schemaKeys.filter((key) => !characterKeys.includes(key));
    if (newKeys.length > 0) {
      newKeys.forEach((key) => {
        character[key] = undefined;
        isUpdated = true;
      });
    }

    // Check for any new objects or properties in the defaultCharacters' ArcaneForce and SacredForce
    for (const forceType of ['ArcaneForce', 'SacredForce']) {
      const templateForceArray = defaultCharacters[forceType];
      if (templateForceArray && Array.isArray(templateForceArray)) {
        for (const templateForce of templateForceArray) {
          const characterForce = character[forceType].find(
            (force) => force.name === templateForce.name
          );

          if (!characterForce) {
            character[forceType].push(templateForce);
            isUpdated = true;
          } else {
            const templateContentArray = templateForce.content;
            if (templateContentArray && Array.isArray(templateContentArray)) {
              for (const templateContent of templateContentArray) {
                const characterContent = characterForce.content.find(
                  (content) => content.contentType === templateContent.contentType
                );

                if (!characterContent) {
                  characterForce.content.push(templateContent);
                  isUpdated = true;
                }
              }
            }
          }
        }
      }
    }

    // Save the updated character if any changes were made
    if (isUpdated) {
      await character.save();
    }
  }
}

        
module.exports = { Character, defaultCharacters, createDefaultCharacters, updateCharacters };
