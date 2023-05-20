const Joi = require('joi');
const mongoose = require('mongoose');
const { isEqual } = require('lodash');
const path = require('path');


const LinkSkill = mongoose.model('LinkSkill', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    editable: false
  },
  image: {
    type: String,
    required: true,
    unique: true,
    editable: false
  },
  levels: [{
    level: {
      type: Number,
      required: true,
      editable: false
    },
    description:{
        type: String,
        required: true,
        editable: false
      }
  }]
})); 

const defaultLinkSkill = [];

async function createLinkSkill(nametag, imgSource) {
  return await new LinkSkill({name: nametag, image: imgSource});
}

async function insertLevels(linkSkill, description, values) {
  const levels = [];
  const placeholderRegex = /Z+/g;
  const matches = description.match(placeholderRegex);

  for (let i = 0; i < values.length; i++) {
    const level = i + 1;
    let levelDescription = description;

    for (let j = 0; j < matches.length; j++) {
      levelDescription = levelDescription.replace(matches[j], values[i][j]);
    }

    levels.push({ level: level, description: levelDescription });
  }
  linkSkill.levels = levels;

}

async function createDefaultLinkSkill() {
  var linkSkillName = "Invincible Belief";
  var imagesource = "../../public/assets/link_skill/warrior.webp";
  var description = "Automatically activates when your health falls to 15% of your Max HP or below. Restores Z% of Max HP every 1 sec for 3 sec. Cooldown: ZZ sec.";
  var values = [ [20, 410], [23, 370] ];
  var linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Empirical Knowledge";
  imagesource = "../../public/assets/link_skill/mage.webp";
  description = "When attacking, has a Z% chance to identify the weakness of the enemy with the highest Max HP among those struck, granting you the following bonuses against them: Damage per Stack: +1%, Enemy DEF Ignored per Stack: +1%, Effect Duration: 10 sec, Stacks up to 3 times.";
  values = [ [15], [17] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);

  
  linkSkillName = "Adventurer's Curiosity";
  imagesource = "../../public/assets/link_skill/bowman.webp";
  description = "Chance to add monsters to Monster Collection: +Z%, Critical Rate: +ZZ%.";
  values = [ [10, 3], [15,4] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Thief's Cunning";
  imagesource = "../../public/assets/link_skill/thief.webp";
  description = "Upon debuffing an enemy, Damage: +Z%. Duration: 10 sec. Cooldown: 20 sec.";
  values = [ [3], [6] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Pirate Blessing";
  imagesource = "../../public/assets/link_skill/pirate.webp";
  description = "STR: +Z, DEX: +ZZ, INT: +ZZZ, LUK: +ZZZZ, Max HP: +ZZZZZ, Max MP: +ZZZZZZ, Damage Taken: -ZZZZZZZ%.";
  values = [ [20, 20, 20, 20, 350, 350, 5], [30, 30, 30, 30, 525, 525, 7] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Cygnus Blessing";
  imagesource = "../../public/assets/link_skill/cygnus.webp";
  description = "Attack Power and Magic ATT: +Z, Abnormal Status Resistance: +ZZ, All Elemental Resistance: +ZZZ%.";
  values = [ [7, 2, 1], [9,3,3] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Knight's Watch";
  imagesource = "../../public/assets/link_skill/mihile.webp";
  description = "Temporarily increases Status Resistance.Duration: Z sec, Status Resistance: +100. Cooldown: 120 sec.";
  values = [ [10], [15], [20]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);

  
  linkSkillName = "Combo Kill Blessing";
  imagesource = "../../public/assets/link_skill/aran.webp";
  description = "Combo Kill Marble EXP: +Z% (permanently).";
  values = [ [400], [650], [900]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Rune Persistence";
  imagesource = "../../public/assets/link_skill/evan.webp";
  description = "Rune Duration: +Z%.";
  values = [ [30], [50], [70]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);

  
  linkSkillName = "Elven Blessing";
  imagesource = "../../public/assets/link_skill/mercedes.webp";
  description = "Returns you to Elluel (Cooldown: 1800 sec). Additional Effect: Permanently receive Z% additional EXP.";
  values = [ [10], [15], [20]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Phantom Instinct";
  imagesource = "../../public/assets/link_skill/phantom.webp";
  description = "Critical Rate +Z%.";
  values = [ [10], [15], [20]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Light Wash";
  imagesource = "../../public/assets/link_skill/luminous.webp";
  description = "Z% of enemy DEF ignored.";
  values = [ [10], [15], [20]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Close Call";
  imagesource = "../../public/assets/link_skill/shade.webp";
  description = "Fatal Attack Survival Chance: Z%.";
  values = [ [5], [10] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Spirit of Freedom";
  imagesource = "../../public/assets/link_skill/resistance.webp";
  description = "Grants Z seconds of invincibility after being revived. Removed upon moving to another map.";
  values = [ [1], [2] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Wild Rage";
  imagesource = "../../public/assets/link_skill/demon_avenger.webp";
  description = "Damage: +Z%";
  values = [ [5], [10], [15] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Fury Unleashed";
  imagesource = "../../public/assets/link_skill/demon_slayer.webp";
  description = "When attacking Boss Monster- Damage: +Z%, Additional Fury Absorption: 10.";
  values = [ [10], [15], [20] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Hybrid Logic";
  imagesource = "../../public/assets/link_skill/xenon.webp";
  description = "All Stats: +Z%";
  values = [ [5], [10] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Iron Will";
  imagesource = "../../public/assets/link_skill/kaiser.webp";
  description = "Max HP: +Z%";
  values = [ [10], [15], [20] ];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Time to Prepare";
  imagesource = "../../public/assets/link_skill/kain.webp";
  description = "After completing Time to Prepare at least 1 time, then upon either defeating 8 enemies or attacking a boss 5 times, damage increases by Z% for 20 sec, for every 5 times you've stacked Time to Prepare. Cooldown: 40 sec";
  values = [ [9], [17]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Unfair Advantage";
  imagesource = "../../public/assets/link_skill/cadena.webp";
  description = "Attacks against weaker opponents deal +Z% damage. Attacks against monsters afflicted by Abnormal Statuses deal +ZZ% damage.";
  values = [ [3,3], [6,6]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Terms and Conditions";
  imagesource = "../../public/assets/link_skill/angelic_buster.webp";
  description = "+Z% skill damage for 10 sec when active. Cooldown: 90 sec. Skill effects reduced to half when used with link skill.";
  values = [ [60], [90], [120]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Noble Fire";
  imagesource = "../../public/assets/link_skill/adele.webp";
  description = "Boss Damage: +Z%. Increases damage by ZZ% up to ZZZ% for each party member, including yourself, on the same map. If you are not in a party, you will be considered to be in your own party.";
  values = [ [2, 1, 4], [4, 2, 8 ]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Tide of Battle";
  imagesource = "../../public/assets/link_skill/illium.webp";
  description = "Activated when moving a certain distance. Max number of stacks: 6 times, Duration: 5 sec, Damage per stack: +Z%.";
  values = [ [1], [2]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Solus";
  imagesource = "../../public/assets/link_skill/ark.webp";
  description = "Activates when the combat state continues for 5 sec. Can be stacked a max of 5 times. Duration: 5 sec. When activated, damage increases by 1%, and damage increases an extra Z% per stack.";
  values = [ [1], [2], [3]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Keen Edge";
  imagesource = "../../public/assets/link_skill/hayato.webp";
  description = "All Stats: Z, Attack Power Increase: ZZ, Magic Attack Power Increase: ZZZ.";
  values = [ [15, 10, 10], [25, 15, 15]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Elementalism";
  imagesource = "../../public/assets/link_skill/kanna.webp";
  description = "Permanent Damage Increase: Z%.";
  values = [ [5], [10]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Nature's Friend";
  imagesource = "../../public/assets/link_skill/lara.webp";
  description = "Damage: +Z%. Activate nature's help upon defeating 20 normal monsters. Increases Damage Against Normal Monsters by ZZ% for 30 sec. when nature's help is active.Cooldown: 30 sec.";
  values = [ [3, 5], [7, 11]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);

  
  linkSkillName = "Bravado";
  imagesource = "../../public/assets/link_skill/hoyoung.webp";
  description = "Enemy DEF Ignored: +Z%, Damage: +ZZ% against enemies with 100% HP.";
  values = [ [5,10], [9, 14]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Focus Spirit";
  imagesource = "../../public/assets/link_skill/beast_tamer.webp";
  description = "Boss Damage: +Z%. Critical Rate: +ZZ%. Max HP +ZZZ%. Max MP: +ZZZZ%.";
  values = [ [4,4,3,3], [7, 7,4,4], [10, 10, 5, 5]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Rhinne's Blessing";
  imagesource = "../../public/assets/link_skill/zero.webp";
  description = "Incoming damage reduced: Z%, defense ignored: ZZ%.";
  values = [ [3,2], [6,4], [9,6], [12,8], [15,10]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  linkSkillName = "Judgment";
  imagesource = "../../public/assets/link_skill/kinesis.webp";
  description = "Critical Damage: +Z%.";
  values = [ [2], [4]];
  linkSkill = await createLinkSkill(linkSkillName, imagesource);
  insertLevels(linkSkill, description, values);
  defaultLinkSkill.push(linkSkill);


  try {

    const existingDefaultLinkSkills = await LinkSkill.find().lean();

    const isDifferent = !isEqual(
      existingDefaultLinkSkills.map(skill => ({
        name: skill.name,
        image: skill.image,
        levels: skill.levels.map(level => ({
          level: level.level,
          description: level.description
        }))
      })),
      defaultLinkSkill.map(skill => ({
        name: skill.name,
        image: skill.image,
        levels: skill.levels.map(level => ({
          level: level.level,
          description: level.description
        }))
      }))
    );

   if (isDifferent) {
      await LinkSkill.deleteMany();
      await LinkSkill.insertMany(defaultLinkSkill);
      console.log('Default Link Skill updated');
    } 
    else {
      console.log('Default Link Skill is up to date');
    }
  } catch (error) {
    console.error(error);
  }
}

createDefaultLinkSkill();
module.exports = {LinkSkill, createDefaultLinkSkill};
