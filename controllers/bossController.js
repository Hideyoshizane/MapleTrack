const {bossList} = require('../models/bossingList');
const {DateTime} = require('luxon');

module.exports = {
  getList: async (req, res) => {
    try {
      const username = req.params.username;
      const bossListFetch = await bossList.findOne({userOrigin: username});

      res.status(200).json(bossListFetch);

    } catch (error) {
      console.error('Error in getList:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  increaseBoss: async (req, res) => {
    try{
      const { server, username, characterClass, bossName, difficult, value, date, checkMark} = req.body;
      const ListFound = await bossList.findOne({userOrigin: username});
      const foundServer = ListFound.server.find(servers => servers.name === server);
      const foundCharacter = foundServer.characters.find(character => character.class === characterClass);
      const foundBoss = foundCharacter.bosses.find(boss => boss.name == bossName && boss.difficulty == difficult);

      foundBoss.checked = checkMark;
      
      foundServer.totalGains = checkMark ? foundServer.totalGains + Number(value) : foundServer.totalGains - Number(value);
      foundServer.weeklyBosses = checkMark ? foundServer.weeklyBosses + 1 : foundServer.weeklyBosses - 1;

      foundBoss.date = checkMark ? date : null;
      ListFound.lastUpdate = date;

      await ListFound.save();
      res.status(200).send('Boss checked successfully.');
    } catch (error) {
      console.error('Error checking boss:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    };
  },
  editBosses: async (req, res) => {
    try{
        const { username, _id } = res.locals;
        res.render('editBosses', { username, _id });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      console.error('Error loading page:', error);
    }
  },
  saveBossChange: async (req, res) => {
    try{
      const characterList = req.body;
      const listFound = await bossList.findOne({userOrigin: characterList.userOrigin});
      const foundServer = listFound.server.find(servers => servers.name === characterList.name);

      for(const character of characterList.characters){
        const foundCharacter = foundServer.characters.find((serverCharacter) => serverCharacter.class === character.class);
        for(const bossData of character.bosses){
          const existingBossIndex = foundCharacter.bosses.findIndex((existingBoss) => (existingBoss.name == bossData.name) && (existingBoss.reset == bossData.reset));
          if(existingBossIndex !== -1){
            const existingBoss = foundCharacter.bosses[existingBossIndex];
            if(bossData.reset === 'Daily'){
              existingBoss.DailyTotal = bossData.DailyTotal;
            }
            if ((existingBoss.reset === 'Weekly' || existingBoss.reset === 'Monthly') && existingBoss.difficulty !== bossData.difficulty) {
              existingBoss.difficulty = bossData.difficulty;
              existingBoss.value = bossData.value;
              existingBoss.checked = false;
              existingBoss.date = null;
          }          
          
          } 
          else{
            foundCharacter.bosses.push(bossData);
          }
          foundCharacter.totalIncome = character.totalIncome;
        }
       
      }
      //Remove bosses that are on character list on database but not on character from the request
      for(const character of foundServer.characters){
        const foundCharacter = characterList.characters.find((listCharacter) => listCharacter.class === character.class);
        character.bosses = character.bosses.filter(onDatabaseBoss => {
          return foundCharacter.bosses.some(onRequestBoss => (onDatabaseBoss.name === onRequestBoss.name) && (onDatabaseBoss.reset === onRequestBoss.reset))
        })
      }
      listFound.lastUpdate = DateTime.utc().toJSDate();
      await listFound.save();
      res.status(200).send('Boss changes saved successfully.');
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      console.error('Error saving Boss:', error);
    }
  }

};
