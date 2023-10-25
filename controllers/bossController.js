const {bossList} = require('../models/bossingList');

module.exports = {
  getList: async (ctx) => {
    try {
      const username = ctx.params.username;
      const bossListFetch = await bossList.findOne({userOrigin: username});

      ctx.body = bossListFetch;
    } catch (error) {
      console.error('Error in getList:', error);
      ctx.status = 500;
      console.error('Error in getList:', error);
    }
  },
  increaseBoss: async (ctx) => {
    try{

      const { value, server, username } = ctx.request.body;
      const ListFound = await bossList.findOne({userOrigin: username});
      const foundServer = ListFound.server.find(servers => servers.name === server);
      foundServer.totalGains += Number(value);
      foundServer.weeklyBosses++;

      await ListFound.save();
      ctx.status = 200;
    } catch (error) {
      console.error('Error checking boss:', error);
      ctx.status = 500;
      console.error('Error checking boss:', error);
    };
  },
  editBosses: async (ctx) =>{
    try{
      if(ctx.isAuthenticated()){
        const { username, _id } = ctx.state.user;
				await ctx.render('editBosses', { username, _id });
      }
    } catch (error) {
      ctx.status = 500;
      console.error('Error loading page:', error);
    }
  },
  saveBossChange: async (ctx) =>{
    try{
      const characterList = ctx.request.body;
      const listFound = await bossList.findOne({userOrigin: characterList.userOrigin});
      const foundServer = listFound.server.find(servers => servers.name === characterList.name);

      for(const character of characterList.characters){
        const foundCharacter = foundServer.characters.find((serverCharacter) => serverCharacter.name === character.name);
        for(const bossData of character.bosses){
          const existingBossIndex = foundCharacter.bosses.findIndex((existingBoss) =>
            (existingBoss.name == bossData.name) && (existingBoss.reset == bossData.reset)
          );
          if(existingBossIndex !== -1){
            const existingBoss = foundCharacter.bosses[existingBossIndex];
            if(bossData.reset === 'Daily'){
              existingBoss.DailyTotal = bossData.DailyTotal;
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
        const foundCharacter = characterList.characters.find((listCharacter) => listCharacter.name === character.name);
        character.bosses = character.bosses.filter(onDatabaseBoss => {
          return foundCharacter.bosses.some(onRequestBoss => (onDatabaseBoss.name === onRequestBoss.name) && (onDatabaseBoss.reset === onRequestBoss.reset))
        })
      }
      
      await listFound.save();
      ctx.status = 200;
    } catch (error) {
      ctx.status = 500;
      console.error('Error saving Boss:', error);
    }
  }

};
