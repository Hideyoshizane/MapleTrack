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
      const listFound = await bossList.findOne({userOrigin: characterList[0].userOrigin});
      const foundServer = listFound.server.find(servers => servers.name === characterList[0].server);

      for(const character of characterList[0].characters){
        const foundCharacter = foundServer.characters.find((serverCharacter) => serverCharacter.name === character.name);
        for (const newBoss of character.bosses) {
          const existingBoss = foundCharacter.bosses.find(
            (existingBoss) => existingBoss.bossName === newBoss.bossName && existingBoss.reset === newBoss.reset
          );
          if (existingBoss) {
            // If the boss has 'Daily' reset, update 'DailyTotal'
            if (newBoss.reset === 'Daily') {
              existingBoss.DailyTotal = newBoss.DailyTotal;
            }
          } else {
            // If the boss doesn't exist, add it to 'foundCharacter.bosses'
            foundCharacter.bosses.push(newBoss);
          }
        }
        // Remove bosses not present in character.bosses
        foundCharacter.bosses = foundCharacter.bosses.filter((existingBoss) =>
        character.bosses.some((newBoss) =>
          existingBoss.bossName === newBoss.bossName && existingBoss.reset === newBoss.reset
        ));
      }
      await listFound.save();
      ctx.status = 200;
    } catch (error) {
      ctx.status = 500;
      console.error('Error saving Boss:', error);
    }
  }

};
