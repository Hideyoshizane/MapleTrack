const {Character} = require('../models/character');

module.exports = {
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
