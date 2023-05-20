const Joi = require('joi');
const mongoose = require('mongoose');
const { isEqual } = require('lodash');


const Boss = mongoose.model('Boss', new mongoose.Schema({

    name: {
        type: String,
        required: true,
        editable: false
    },
    img:{
      type: String,
      required: true,
      editable: false
    },
    difficulties: [{
        name:     {type: String, required: true},
        value:    {type: Number, required: true},
        reset:    {type: String, required: true},
        minLevel: {type: Number, required: true}
    }],
})); 

const defaultBosses = [];


async function createBoss(nametag, imgSource) {
  return await new Boss({name: nametag, img: imgSource});
}

async function insertDifficult(boss, difficultname, resettype, value, minLevel){
  for (var i = 0; i < difficultname.length; i++) {
    var difficultName = difficultname[i];
    var resetType = resettype[i];
    var currentValue = value[i];
    var minimumLevel = minLevel[i];

    const defaultDifficulties = {
      name : difficultName,
      value : currentValue,
      reset : resetType,
      minLevel : minimumLevel,
    };
    boss.difficulties.push(defaultDifficulties);
  }
}


async function createDefaultBosses() {
  var bossName =        "Zakum";
  var imagesource =     "../../assets/boss/zakum.webp";
  var difficulties =    ["Easy", "Normal", "Chaos"];
  var values =          [200000, 612500, 16200000];
  var resetType =       ["Daily", "Daily", "Weekly"];
  var minimumLevel =    [50, 90, 90];
  var boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Magnus";
  imagesource =     "../../assets/boss/magnus.webp";
  difficulties =    ["Easy", "Normal", "Hard"];
  values =          [722000, 2592000, 19012500];
  resetType =       ["Daily", "Daily", "Weekly"];
  minimumLevel =    [115, 155, 175];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Hilla";
  imagesource =     "../../assets/boss/hilla.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [800000, 11250000];
  resetType =       ["Daily", "Weekly"];
  minimumLevel =    [120, 170];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "OMNI-CLN";
  imagesource =     "../../assets/boss/omni_cln.webp";
  difficulties =    ["Normal"];
  values =          [1250000];
  resetType =       ["Daily"];
  minimumLevel =    [180];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Papulatus";
  imagesource =     "../../assets/boss/papulatus.webp";
  difficulties =    ["Easy", "Normal", "Chaos"];
  values =          [684500, 2664500, 26450000];
  resetType =       ["Daily", "Daily", "Weekly"];
  minimumLevel =    [115, 155, 190];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Pierre";
  imagesource =     "../../assets/boss/pierre.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [968000, 16200000];
  resetType =       ["Daily", "Weekly"];
  minimumLevel =    [125, 180];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);
  
  
  bossName =        "Von Bon";
  imagesource =     "../../assets/boss/von_bon.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [968000, 16200000];
  resetType =       ["Daily", "Weekly"];
  minimumLevel =    [125, 180];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Crimsom Queen";
  imagesource =     "../../assets/boss/crimson_queen.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [968000, 16200000];
  resetType =       ["Daily", "Weekly"];
  minimumLevel =    [125, 180];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Vellum";
  imagesource =     "../../assets/boss/vellum.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [968000, 21012500];
  resetType =       ["Daily", "Weekly"];
  minimumLevel =    [125, 180];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);


  bossName =        "Von Leon";
  imagesource =     "../../assets/boss/von_leon.webp";
  difficulties =    ["Easy", "Normal", "Hard"];
  values =          [1058000, 1458000, 2450000];
  resetType =       ["Daily", "Daily", "Daily"];
  minimumLevel =    [125, 125, 125];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Horntail";
  imagesource =     "../../assets/boss/horntail.webp";
  difficulties =    ["Easy", "Normal", "Chaos"];
  values =          [882000, 1012500, 1352000];
  resetType =       ["Daily", "Daily", "Daily"];
  minimumLevel =    [130, 130, 135];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Arkarium";
  imagesource =     "../../assets/boss/arkarium.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [1152000, 2520500];
  resetType =       ["Daily", "Daily"];
  minimumLevel =    [140, 140];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Pink Beam";
  imagesource =     "../../assets/boss/pink_bean.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [1404500, 12800000];
  resetType =       ["Daily", "Weekly"];
  minimumLevel =    [160, 170];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 

  bossName =        "Ranmaru";
  imagesource =     "../../assets/boss/ranmaru.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [840500, 2664500];
  resetType =       ["Daily", "Daily"];
  minimumLevel =    [120, 180];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Cygnus";
  imagesource =     "../../assets/boss/cygnus.webp";
  difficulties =    ["Easy", "Normal"];
  values =          [9112500, 14450000];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [165, 165];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Lotus";
  imagesource =     "../../assets/boss/lotus.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [32512500, 74112500];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [190, 190];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Damien";
  imagesource =     "../../assets/boss/damien.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [33800000, 70312500];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [190, 190];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Guardian Angel Slime";
  imagesource =     "../../assets/boss/angel_smile.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [34322000, 90312500];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [210, 210];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Lucid";
  imagesource =     "../../assets/boss/lucid.webp";
  difficulties =    ["Easy", "Normal", "Hard"];
  values =          [35112500, 40612500, 80000000];
  resetType =       ["Weekly", "Weekly", "Weekly"];
  minimumLevel =    [220, 220, 220];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);
  
  
  bossName =        "Will";
  imagesource =     "../../assets/boss/will.webp";
  difficulties =    ["Easy", "Normal", "Hard"];
  values =          [38255000, 46512500, 88200000];
  resetType =       ["Weekly", "Weekly", "Weekly"];
  minimumLevel =    [235, 235, 235];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Gloom";
  imagesource =     "../../assets/boss/gloom.webp";
  difficulties =    ["Normal", "Chaos"];
  values =          [49612500, 92450000];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [245, 245];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss); 


  bossName =        "Verus Hilla";
  imagesource =     "../../assets/boss/verus_hilla.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [89520000, 110450000];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [250, 250];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);


  bossName =        "Darknell";
  imagesource =     "../../assets/boss/darknell.webp";
  difficulties =    ["Normal", "Hard"];
  values =          [52812500, 96800000];
  resetType =       ["Weekly", "Weekly"];
  minimumLevel =    [255, 255];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);


  bossName =        "Black Mage";
  imagesource =     "../../assets/boss/black_mage.webp";
  difficulties =    ["Hard", "Extreme"];
  values =          [500000000, 2000000000];
  resetType =       ["Monthly", "Monthly"];
  minimumLevel =    [255, 255];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);


  bossName =        "Seren";
  imagesource =     "../../assets/boss/seren.webp";
  difficulties =    ["Normal", "Hard", "Extreme"];
  values =          [133687500, 151250000, 605000000];
  resetType =       ["Weekly", "Weekly", "Weekly"];
  minimumLevel =    [265, 265, 265];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);


  bossName =        "Kalos";
  imagesource =     "../../assets/boss/kalos.webp";
  difficulties =    ["Chaos"];
  values =          [200000000];
  resetType =       ["Weekly"];
  minimumLevel =    [270];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);


  bossName =        "Princess No";
  imagesource =     "../../assets/boss/princess_no.webp";
  difficulties =    ["Normal"];
  values =          [16200000];
  resetType =       ["Weekly"];
  minimumLevel =    [140];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);

  bossName =        "Akechi";
  imagesource =     "../../assets/boss/akechi.webp";
  difficulties =    ["Normal"];
  values =          [28800000];
  resetType =       ["Weekly"];
  minimumLevel =    [200];
  boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);
  defaultBosses.push(boss);

  try {
    // Retrieve the existing default link skills from the database
    const existingDefaultBosses = await Boss.find().lean();

    // Compare the existing and updated default link skills
    const isDifferent = !isEqual(
      existingDefaultBosses.map(boss => ({
        name: boss.name,
        img: boss.img,
        difficulties: boss.difficulties.map(difficulty => ({
          name: difficulty.name,
          value: difficulty.value,
          reset: difficulty.reset,
          minLevel: difficulty.minLevel
        }))
      })),
      defaultBosses.map(boss => ({
        name: boss.name,
        img: boss.img,
        difficulties: boss.difficulties.map(difficulty => ({
          name: difficulty.name,
          value: difficulty.value,
          reset: difficulty.reset,
          minLevel: difficulty.minLevel
        }))
      }))
    );

    if (isDifferent) {
      // Remove the existing default link skills from the database
      await Boss.deleteMany();

      // Insert the updated default link skills
      await Boss.insertMany(defaultBosses);
      console.log('Default Bosses updated');
    } 
    else {
      console.log('Default Bosses is up to date');
    }
  }
  catch (error) {
    console.error(error);
  }
}
createDefaultBosses();
module.exports = {Boss, createDefaultBosses};