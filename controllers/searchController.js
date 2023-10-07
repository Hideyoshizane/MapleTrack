const {Character} = require('../models/character');
const { User } = require('../models/user');
const {Server} = require('../models/servers');



module.exports = {
  search: async (ctx) => {
    try {
      const { query, username } = ctx.request.query;

      const characters = await Character.find({
        userOrigin: username,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { class: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      ctx.status = 200;
      ctx.body = characters;

    } catch (error) {
      console.error('Error performing search:', error);
      ctx.status = 500;
      ctx.body = { error: 'An error occurred during the search' };
    }
  },

  userServer: async(ctx) => {
    try{
      const username = ctx.state.user.username;
      const user = await User.findOne({ username: username});
      ctx.body = user.servers;
      
    } catch(error){
      console.error('Error finding user', error);
      ctx.status = 500;
      ctx.body = {error: 'An error ocurred during the search'};
    }
  },

  serverName: async(ctx) => {
    try{
      const serverID = ctx.params.serverID;
      const serverData = await Server.findOne({_id: serverID});
      if(!serverData) {
        ctx.status = 404;
        ctx.body = { error: 'Server not found' };
      }
      else {
        ctx.body = { name: serverData.name, img: serverData.img };
      }
      
    } catch(error){
      console.error('Error finding server', error);
      ctx.status = 500;
      ctx.body = {error: 'An error ocurred during the search'};
    }
  }




  
};
