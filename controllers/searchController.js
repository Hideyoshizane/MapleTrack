const {Character} = require('../models/character');
const { User } = require('../models/user');



module.exports = {
  username: async(ctx) =>{
    try{
      const { username } = ctx.request.query;
      const user = await User.findOne({ username: username });
      const userId = user._id;
      ctx.body = userId;

    } catch(error){
      console.error('Error finding user', error);
      ctx.status = 500;
      ctx.body = {error: 'An error ocurred during the search'};
    };
  },

  search: async (ctx) => {
    try {
      const { query } = ctx.request.query;

      // Perform the search query using the Character model
      const characters = await Character.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { class: { $regex: query, $options: 'i' } },
        ],
      });

      ctx.body = characters;
    } catch (error) {
      console.error('Error performing search:', error);
      ctx.status = 500;
      ctx.body = { error: 'An error occurred during the search' };
    }
  },
};
