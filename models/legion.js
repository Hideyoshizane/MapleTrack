const Joi = require('joi');
const mongoose = require('mongoose');
const path = require('path');
const { isEqual } = require('lodash');


const LegionSystem = mongoose.model('LegionSystem', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  class:{
    type: String,
    required: true,
  },
  ranking: [{
    rank: {
      type: String,
      required: true,
    },
    description:{
        type: String,
        required: true,
      }
  }]
})); 

const defaultLegion = [];

async function createDefaultLegion(nametag, classtag) {
  return await new LegionSystem({name: nametag,class: classtag});
}

async function insertRanking(legion, description, value){
  const placeholder = /Z/;
  var ranking =  ["B", "A", "S", "SS", "SSS"];
  for (var i = 0; i < ranking.length; i++) {
    var ranks = ranking[i];
    var currentValue = value[i];
    var updatedDescription = description.replace(placeholder, currentValue);
    const level = {
      rank : ranks,
      description : updatedDescription,
    };
    legion.ranking.push(level);
  }
}

async function createDefaultLegionSystem() {
  var legion = await createDefaultLegion("STR+", 'warrior');
  var description = "STR: +Z";
  var values = ["10", "20", "40", "80", "100"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("MAXHP%", 'warrior');
  description = "Max HP: +Z%";
  values = ["2", "3", "4", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);


  legion = await createDefaultLegion("MAXHP+", 'warrior');
  description = "Max HP: +Z";
  values = ["250", "500", "1000", "2000", "2500"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("RECVRHP+", 'warrior');
  description = "70% chance to recover Z% of Max HP with each attack.";
  values = ["2", "4", "6", "8", "10"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("STATRES+", 'warrior');
  description = "Abnormal Status Resistance: +Z";
  values = ["1", "2", "3", "4", "5"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("BOSSDMG+", 'warrior');
  description = "Boss Damage: +Z%";
  values = ["1", "2", "3", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("IED+", 'warrior');
  description = "Ignore Enemy Defense: +Z%";
  values = ["1", "2", "3", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("CRIT", 'warrior');
  description = "Critical Damage: +Z%";
  values = ["1", "2", "3", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("EXP", 'warrior');
  description = "EXP Obtained: +Z%";
  values = ["4", "6", "8", "10", "12"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("MAXMP%", 'magician');
  description = "Max MP: +Z%";
  values = ["2", "3", "4", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("INT+", 'magician');
  description = "INT: +Z";
  values = ["10", "20", "40", "80", "100"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("RECVRMP", 'magician');
  description = "70% chance to recover Z% of Max MP with each attack.";
  values = ["2", "4", "6", "8", "10"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("BOSSDMGM", 'magician');
  description = "Boss Damage: +Z%";
  values = ["1", "2", "3", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("IEDM", 'magician');
  description = "Ignore Enemy Defense: +Z%";
  values = ["1", "2", "3", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("DEX+", 'bowman');
  description = "DEX: +Z";
  values = ["10", "20", "40", "80", "100"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("CRITRT", 'bowman');
  description = "Critical Rate: +Z%";
  values = ["1", "2", "3", "4", "5"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("SKILLCD", 'bowman');
  description = "Skill Cooldown: -Z%";
  values = ["2", "3", "4", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("%DMGUP", 'bowman');
  description = "20% chance to deal increased damage when attacking: +Z%";
  values = ["4", "8", "12", "16", "20"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  
  legion = await createDefaultLegion("CRITRTT", 'thief');
  description = "Critical Rate: +Z%";
  values = ["1", "2", "3", "4", "5"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("LUK+", 'thief');
  description = "LUK: +Z";
  values = ["10", "20", "40", "80", "100"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("MESO%", 'thief');
  description = "Mesos Obtained: +Z%";
  values = ["1", "2", "3", "4", "5"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("STR+P", 'pirate');
  description = "STR: +Z";
  values = ["10", "20", "40", "80", "100"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("SUMMND", 'pirate');
  description = "Summon Duration: +Z%";
  values = ["4", "6", "8", "10", "12"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("CRTDMG+", 'pirate');
  description = "Critical Damage: +Z%";
  values = ["1", "2", "3", "5", "6"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("BUFFDUR", 'pirate');
  description = "Buff Duration: +Z%";
  values = ["5", "10", "15", "20", "25"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  legion = await createDefaultLegion("DEX+P", 'pirate');
  description = "DEX: +Z";
  values = ["10", "20", "40", "80", "100"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);

  
  legion = await createDefaultLegion("STDELU", 'xenon');
  description = "STR, DEX, and LUK: +Z";
  values = ["5", "10", "20", "40", "50"];
  await insertRanking(legion, description, values);
  defaultLegion.push(legion);


  try {
    // Retrieve the existing default link skills from the database
    const existingDefaultLegion = await LegionSystem.find().lean();

    // Compare the existing and updated default link skills
    const isDifferent = !isEqual(
      existingDefaultLegion.map(system => ({
        name: system.name,
        class: system.class,
        ranking: system.ranking.map(rank => ({
          rank: rank.rank,
          description: rank.description
        }))
      })),
      defaultLegion.map(system => ({
        name: system.name,
        class: system.class,
        ranking: system.ranking.map(rank => ({
          rank: rank.rank,
          description: rank.description
        }))
      }))
    );

    if (isDifferent) {
      // Remove the existing default link skills from the database
      await LegionSystem.deleteMany();

      // Insert the updated default link skills
      await LegionSystem.insertMany(defaultLegion);
      console.log('Default Legion System updated');
    } 
    else {
      console.log('Default Legion System is up to date');
    }
  }
  catch (error) {
    console.error(error);
  }
}
createDefaultLegionSystem();
module.exports = {LegionSystem, createDefaultLegionSystem};