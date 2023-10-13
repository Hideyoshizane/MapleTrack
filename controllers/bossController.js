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
  }
};
