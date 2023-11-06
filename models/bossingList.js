const mongoose = require('mongoose');
const { defaultServers } = require('./servers');
const {DateTime} = require('luxon');

const bossList = mongoose.model('bossList', new mongoose.Schema({
    userOrigin:   {type: String,},
    lastUpdate:   {type: Date},
    server:[{
      name: String,
      weeklyBosses: {type: Number},
      totalGains:   {type: Number},
      characters: [{
        id:       {type: String},
        name:     {type: String},
        code:     {type: String},
        class:    {type: String},
        level:    {type: Number, required: true},
        totalIncome: {type: Number},
        bosses: [{
          name:      {type: String},
          difficulty:{type: String},
          value:     {type: Number},
          reset:     {type: String},
          checked:   {type: Boolean},
          DailyTotal:{type: Number},
          date:      {type: Date}
        }]  
      }],
    }],
}, { strictPopulate: false })); 

async function createBossList(username){
  const newBossList = new bossList({
    userOrigin: username,
    lastUpdate: null,
    server: defaultServers.map(server => ({
      name: server.name,
      weeklyBosses: 0,
      totalGains: 0,
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
      class: characterData.class,
      totalIncome: 0,
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

async function resetBossList(username){
    const bossingList = await bossList.findOne({userOrigin: username });
    const timeNow = DateTime.utc();
    const userLastLogin = DateTime.fromJSDate(bossingList.lastUpdate);
    
    const nextWednesday = userLastLogin.plus({ days: 1 }).set({ weekday: 3, hour: 0, minute: 0, second: 0, millisecond: 0 });
    const nextDay = userLastLogin.plus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    
  
    if(timeNow >= nextDay && timeNow <= nextWednesday){
        //Reset Daily bosses
        await resetDailyBoss(bossingList);
    }
    else if(timeNow > nextDay && timeNow > nextWednesday){
        //Reset everything
        await resetWeeklyBoss(bossingList);
    }

}


async function resetDailyBoss(bossingList){
  const filteredServers = bossingList.server.filter((server) => server.characters.length > 0);

	filteredServers.forEach((server) => {
		server.characters.forEach((character) => {
			character.bosses.forEach((boss) => {
				if (boss.reset === 'Daily') {
					boss.checked = false;
				}
			});
		});
	});
  bossingList.lastUpdate = DateTime.utc().toJSDate();
  await bossingList.save();
}
async function resetWeeklyBoss(bossingList){
  const filteredServers = bossingList.server.filter((server) => server.characters.length > 0);

	filteredServers.forEach((server) => {
		server.characters.forEach((character) => {
			character.bosses.forEach((boss) => {
					boss.checked = false;
			});
		});
    server.weeklyBosses = 0;
    server.totalGains = 0;
	});
  bossingList.lastUpdate = DateTime.utc().toJSDate();
  await bossingList.save();

}


module.exports = { bossList, createBossList, insertOnBossList, removeFromBossList, resetBossList};
