const Joi = require('joi');
const mongoose = require('mongoose');

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

const defaultBosses = [];

async function createDefaultBosses() {
  var bossName =        "Zakum";
  var imagesource =     "../assets/boss/zakum.webp";
  var difficulties =    ["Easy", "Normal", "Chaos"];
  var values =          [200000, 612500, 16200000];
  var resetType =       ["Daily", "Daily", "Weekly"];
  var minimumLevel =    [50, 90, 90];

  var boss = await createBoss(bossName, imagesource);
  await insertDifficult(boss, difficulties, resetType, values, minimumLevel);

  defaultBosses.push(boss);
  Boss.once('index', (err) => {
    if (err) console.error(err);
    Boss.countDocuments((err, count) => {
      if (err) console.error(err);
      if (count === 0) {
        Boss.insertMany(defaultBosses, (err, docs) => {
          if (err) console.error(err);
          console.log('Default Bosses created:', docs);
        });
      }
    });
  });
}

createDefaultBosses();

module.exports = {Boss, createDefaultBosses};

/*
Boss.on('index', (err) => {
    if (err) console.error(err);
    Boss.countDocuments((err, count) => {
      if (err) console.error(err);
      if (count === 0) {
        // Create default bosses
        const defaultBosses = [
          {
            name: 'Zakum',
            difficulties: [
              { name: 'Easy',   value:    200000 , reset:'Daily' , minLevel:  50},
              { name: 'Normal', value:    612500 , reset:'Daily' , minLevel:  90},
              { name: 'Chaos',  value:  16200000 , reset:'Weekly', minLevel:  90},
            ],
          },
          {
            name: 'Magnus',
            difficulties: [
              { name: 'Easy',   value:    722000 , reset:'Daily' , minLevel: 115},
              { name: 'Normal', value:   2592000 , reset:'Daily' , minLevel: 155},
              { name: 'Hard',   value:  19012500 , reset:'Weekly', minLevel: 175},
            ],
          },
          {
            name: 'Hilla',
            difficulties: [
              { name: 'Normal', value:    800000 , reset:'Daily' , minLevel: 120},
              { name: 'Hard',   value:  11250000 , reset:'Weekly', minLevel: 170},
            ],
          },
          {
            name: 'OMNI-CLN',
            difficulties: [
              { name: 'Normal', value:   1250000 , reset:'Daily' , minLevel: 180},
            ],
          },
          {
            name: 'Papulatus',
            difficulties: [
              { name: 'Easy',   value:    684500 , reset:'Daily' , minLevel: 115},
              { name: 'Normal', value:   2664500 , reset:'Daily' , minLevel: 155},
              { name: 'Chaos',  value:  26450000 , reset:'Weekly', minLevel: 190},
            ],
          },
          {
            name: 'Pierre',
            difficulties: [
              { name: 'Normal', value:    968000 , reset:'Daily' , minLevel: 125},
              { name: 'Chaos',  value:  16200000 , reset:'Weekly', minLevel: 180},
            ],
          },
          {
            name: 'Von Bon',
            difficulties: [
              { name: 'Normal', value:    968000 , reset:'Daily' , minLevel: 125},
              { name: 'Chaos',  value:  16200000 , reset:'Weekly', minLevel: 180},
            ],
          },
          {
          name: 'Crimsom Queen',
            difficulties: [
              { name: 'Normal', value:    968000 , reset:'Daily' , minLevel: 125},
              { name: 'Chaos',  value:  16200000 , reset:'Weekly', minLevel: 180},
            ],
          },
          {
          name: 'Vellum',
            difficulties: [
              { name: 'Normal', value:    968000 , reset:'Daily' , minLevel: 125},
              { name: 'Chaos',  value:  21012500 , reset:'Weekly', minLevel: 180},
            ],
          },
          {
            name: 'Von Leon',
              difficulties: [
                { name: 'Easy',   value:   1058000 , reset:'Daily' , minLevel: 125},
                { name: 'Normal', value:   1458000 , reset:'Daily' , minLevel: 125},
                { name: 'Hard',   value:   2450000 , reset:'Daily' , minLevel: 120},
              ],
          },
          {
            name: 'Horntail',
              difficulties: [
                { name: 'Easy',   value:    882000 , reset:'Daily' , minLevel: 130},
                { name: 'Normal', value:   1012500 , reset:'Daily' , minLevel: 130},
                { name: 'Chaos',  value:   1352000 , reset:'Daily' , minLevel: 135},
              ],
          },
          {
            name: 'Arkarium',
              difficulties: [
                { name: 'Normal', value:   1152000 , reset:'Daily' , minLevel: 140},
                { name: 'Hard',   value:   2520500 , reset:'Daily' , minLevel: 140},
              ],
          },
          {
            name: 'Pink Beam',
              difficulties: [
                { name: 'Normal', value:    1404500 , reset:'Daily' , minLevel: 160},
                { name: 'Chaos',  value:   12800000 , reset:'Weekly', minLevel: 170},
              ],
          },
          {
            name: 'Ranmaru',
              difficulties: [
                { name: 'Normal', value:    840500 , reset:'Daily' , minLevel: 120},
                { name: 'Hard',   value:   2664500 , reset:'Daily' , minLevel: 180},
              ],
          },
          {  
            name: 'Cygnus',
              difficulties: [
                { name: 'Easy',     value:    9112500 , reset:'Weekly' , minLevel: 165},
                { name: 'Normal',   value:   14450000 , reset:'Weekly' , minLevel: 165},
              ],
          },
          {  
            name: 'Lotus',
              difficulties: [
                { name: 'Normal', value:    32512500 , reset:'Weekly' , minLevel: 190},
                { name: 'Hard',   value:    74112500 , reset:'Weekly' , minLevel: 190},
              ],
          },
          {  
            name: 'Damien',
              difficulties: [
                { name: 'Normal', value:    33800000 , reset:'Weekly' , minLevel: 190},
                { name: 'Hard',   value:    70312500 , reset:'Weekly' , minLevel: 190},
              ],
          },
          {  
            name: 'Guardian Angel Slime',
              difficulties: [
                { name: 'Normal', value:    34322000 , reset:'Weekly' , minLevel: 210},
                { name: 'Chaos',  value:    90312500 , reset:'Weekly' , minLevel: 210},
              ],
          },
          {
            name: 'Lucid',
              difficulties: [
                { name: 'Easy',   value:   35112500 , reset:'Weekly' , minLevel: 220},
                { name: 'Normal', value:   40612500 , reset:'Weekly' , minLevel: 220},
                { name: 'Hard',   value:   80000000 , reset:'Weekly' , minLevel: 220},
              ],
          },
          {
            name: 'Will',
              difficulties: [
                { name: 'Easy',   value:   38255000 , reset:'Weekly' , minLevel: 235},
                { name: 'Normal', value:   46512500 , reset:'Weekly' , minLevel: 235},
                { name: 'Hard',   value:   88200000 , reset:'Weekly' , minLevel: 235},
              ],
          },
          {
            name: 'Gloom',
              difficulties: [
                { name: 'Normal',  value:   49612500 , reset:'Weekly' , minLevel: 245},
                { name: 'Chaos',   value:   92450000 , reset:'Weekly' , minLevel: 245},
              ],
          },
          {
            name: 'Verus Hilla',
              difficulties: [
                { name: 'Normal',  value:    89520000 , reset:'Weekly' , minLevel: 250},
                { name: 'Hard',    value:   110450000 , reset:'Weekly' , minLevel: 250},
              ],
          },
          {
            name: 'Darknell',
              difficulties: [
                { name: 'Normal',  value:    52812500 , reset:'Weekly' , minLevel: 255},
                { name: 'Hard',    value:    96800000 , reset:'Weekly' , minLevel: 255},
              ],
          },
          {
            name: 'Black Mage',
              difficulties: [
                { name: 'Hard',    value:     500000000 , reset:'Monthly' , minLevel: 255},
                { name: 'Extreme', value:    2000000000 , reset:'Monthly' , minLevel: 255},
              ],
          },
          {
            name: 'Seren',
              difficulties: [
                { name: 'Normal',  value:     133687500 , reset:'Weekly' , minLevel: 265},
                { name: 'Hard',    value:     151250000 , reset:'Weekly' , minLevel: 265},
                { name: 'Extreme', value:     605000000 , reset:'Weekly' , minLevel: 265},
              ],
          },
          {
            name: 'Kalos',
              difficulties: [
                { name: 'Chaos',  value:     200000000 , reset:'Weekly' , minLevel: 270},
              ],
          },
          {
            name: 'Princess No',
              difficulties: [
                { name: 'Normal',  value:     16200000 , reset:'Weekly' , minLevel: 140},
              ],
          },
          {
            name: 'Akechi',
              difficulties: [
                { name: 'Normal',  value:     28800000 , reset:'Weekly' , minLevel: 200},
              ],
          },
          
          

        ];
        Boss.insertMany(defaultBosses, (err, docs) => {
          if (err) console.error(err);
          console.log('Default bosses created:', docs);
        });
      }
    });
  });
  
 

exports = Boss;*/