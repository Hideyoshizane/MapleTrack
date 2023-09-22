const {Character} = require('../models/character');

module.exports = {
    redirectCharacter: async (ctx) => {
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

    editCharacter: async (ctx) => {
      try {
        const { username, server, characterCode } = ctx.params;
        await ctx.render('edit', {
          username: username,
          server: server,
          characterCode: characterCode,
        });
      } catch (error) {
        console.error('Error rendering edit page:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while rendering edit page' };
      }
    },

    getCharacterData: async (ctx) => {
      try {
        const { username, server, characterCode } = ctx.params;
        let query = {
          userOrigin: username,
          server: server,
          code: characterCode
        };
        const character = await Character.findOne(query);

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
    },

    increaseDaily: async (ctx) =>{
      try{
        const {forceType, forceName, value, characterData, necessaryExp, date} = ctx.request.body;
        const foundCharacter = await Character.findOne(characterData);
        let AreaData;
        if (forceType) {
          AreaData = foundCharacter.ArcaneForce;
        } else if (!forceType) {
          AreaData = foundCharacter.SacredForce;
        }
        const foundArea = AreaData.find((obj) => obj.name === forceName);

        if(foundArea){
          foundArea.exp += Number(value);
          if(foundArea.exp >= necessaryExp){
            foundArea.exp = Number(foundArea.exp - necessaryExp);
            foundArea.level +=Number(1);
          }
          foundArea.content[0].date = date;
          await foundCharacter.save();
          ctx.status = 200;
        }

      }catch(error){
        console.log('Error updating value', error);
        ctx.status = 500;
        ctx.body = {error: 'Error updating value'};
      }
    },
    increaseWeekly: async (ctx) =>{
      try{
        const {forceName, value, characterData, necessaryExp, date} = ctx.request.body;
        const foundCharacter = await Character.findOne(characterData);
        let AreaData = foundCharacter.ArcaneForce;
        const foundArea = AreaData.find((obj) => obj.name === forceName);

        if(foundArea){
          foundArea.exp += Number(value);
          if(foundArea.exp >= necessaryExp){
            foundArea.exp = Number(foundArea.exp - necessaryExp);
            foundArea.level +=Number(1);
          }
          foundArea.content[1].date = date;
          if(foundArea.content[1].tries > 0){
            foundArea.content[1].tries -=Number(1);
          }
          await foundCharacter.save();
          ctx.status = 200;
        }

      }catch(error){
        console.log('Error updating value', error);
        ctx.status = 500;
        ctx.body = {error: 'Error updating value'};
      }
  }
};
  