const {Character} = require('../models/character');

module.exports = {
    showCharacter: async (ctx) => {
      try {
        const { username, server, characterClass } = ctx.params;
        await ctx.render('character', {
          username: username,
          server: server,
          characterClass: characterClass,
        });
      } catch (error) {
        console.error('Error rendering character page:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while rendering character page' };
      }
    },

    characterData: async (ctx) => {
      try {
        const { username, server, characterClass } = ctx.params;
        const character = await Character.findOne({
          userOrigin: username,
          server: server,
          characterClass: characterClass
          }
        )
        ctx.body = character;
      } catch (error) {
        console.error('Error retrieving character Data:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while getting character data' };
      }
    },

    fullCharacter: async (ctx) => {
      try{
        const { username, server} = ctx.params;
        const characters = await Character.find({userOrigin: username, server: server});
        ctx.body = characters;

      } catch (error) {
        console.log('Error rtrieving characters Data:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while getting characters data' };
      }
    }



  };
  