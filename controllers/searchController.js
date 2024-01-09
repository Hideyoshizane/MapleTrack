const {Character} = require('../models/character');
const { User } = require('../models/user');
const {Server} = require('../models/servers');



module.exports = {
  search: async (req, res) => {
    try {
      const { query, username } = req.query;

      const characters = await Character.find({
        userOrigin: username,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { class: { $regex: query, $options: 'i' } },
        ],
      }).limit(5);

      res.status(200).json(characters);

    } catch (error) {
      console.error('Error performing search:', error);
      res.status(500).json({ error: 'An error occurred during the search' });
    }
  },

  userServer: async (req, res) => {
    try{
      const username = res.locals.username;
      const user = await User.findOne({ username: username});
      res.status(200).json(user.servers);

    } catch(error){
      console.error('Error finding user', error);
      res.status(500).json({ error: 'An error occurred during the search' });
    }
  },

  serverName: async (req, res) => {
    try{
      const serverID = req.params.serverID;
      const serverData = await Server.findOne({_id: serverID});
      if(!serverData) {
        res.status(404).json({ error: 'Server not found' });
      }
      else {
        res.json({ name: serverData.name, img: serverData.img });
      }
      
    } catch(error){
      console.error('Error finding server', error);
      res.status(500).json({ error: 'An error occurred during the search' });
    }
  },
  
  
};
