const {Character} = require('../models/character');
const {insertOnBossList, removeFromBossList} = require('../models/bossingList');
const {DateTime} = require('luxon');

module.exports = {
    redirectCharacter: async (ctx) => {
      try {
        const { username, server, characterClass } = ctx.params;
        const { _id } = ctx.state.user;
        await ctx.render('character', {
          username: username,
          server: server,
          characterClass: characterClass,
          _id: _id
        });
      } catch (error) {
        console.error('Error rendering character page:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while rendering character page' };
      }
    },

    editCharacter: async (ctx) => {
      try {
        const { username, server, characterClass } = ctx.params;
        const { _id } = ctx.state.user;
        await ctx.render('edit', {
          username: username,
          server: server,
          characterClass: characterClass,
          _id: _id
        });
      } catch (error) {
        console.error('Error rendering edit page:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while rendering edit page' };
      }
    },
    updateCharacter: async (ctx) =>{
      try{
        const { _id,
                name,
                level,
                targetLevel,
                bossing,
                ArcaneForce, 
                SacredForce,
                server } = ctx.request.body;
        const character = await Character.findById(_id);
        character.name = name;
        character.level = level;
        character.targetLevel = targetLevel;
        character.bossing =bossing;
    
        for (const updatedForce of ArcaneForce) {
          const forceToUpdate = character.ArcaneForce.find(force => force.name === updatedForce.name);
          if (forceToUpdate) {
            forceToUpdate.level = updatedForce.level;
            forceToUpdate.exp = updatedForce.exp;

            for(let i = 0; i < forceToUpdate.content.length; i++) {
              forceToUpdate.content[i].checked = updatedForce.content[i].checked;
            }
          }
        }

        for (const updatedForce of SacredForce) {
          const forceToUpdate = character.SacredForce.find(force => force.name === updatedForce.name);
          if (forceToUpdate) {
            forceToUpdate.level = updatedForce.level;
            forceToUpdate.exp = updatedForce.exp;

            for(let i = 0; i < forceToUpdate.content.length; i++) {
              forceToUpdate.content[i].checked = updatedForce.content[i].checked;
            }
          }
        }
        if(bossing == true){
          const characterData = {
            id: character._id.toString(),
            name: character.name,
            code: character.code,
            level: character.level,
            class: character.class,
          };
          await insertOnBossList(character.userOrigin, characterData, server);
        }
        else if (bossing == false){
          await removeFromBossList(character.userOrigin, character._id.toString(), server);
        }

        await character.save();
    
      } catch (error) {
        console.error('Error updating character:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while updating character' };
      }
    },

    getCharacterData: async (ctx) => {
      try {
        const { username, server, characterClass } = ctx.params;
        let query = {
          userOrigin: username,
          server: server,
          class: characterClass
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
        const foundCharacter = await Character.findById(characterData._id);
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
          console.log(date);
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
        const foundCharacter = await Character.findById(characterData._id);
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
  