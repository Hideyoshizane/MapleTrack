const {Character, updateCharacterWeekly} = require('../models/character');
const {insertOnBossList, removeFromBossList} = require('../models/bossingList');

module.exports = {
    redirectCharacter: async (req, res) => {
      try {
        const { username, server, characterClass } = req.params;
        const  _id  = res.locals._id;
        updateCharacterWeekly(username, server, characterClass);
        res.render('character', {
          username: username,
          server: server,
          characterClass: characterClass,
          _id: _id
        });
      } catch (error) {
        console.error('Error rendering character page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
    
    editCharacter:async (req, res) => {
      try {
        const { username, server, characterClass } = req.params;
        const { _id } = res.locals._id;
        res.render('edit', {
          username: username,
          server: server,
          characterClass: characterClass,
          _id: _id
        });
      } catch (error) {
        console.error('Error rendering edit page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
    updateCharacter: async (req, res) => {
      try{
        const { _id,
                name,
                level,
                targetLevel,
                bossing,
                ArcaneForce, 
                SacredForce,
                server
              } = req.body;
        const character = await Character.findById(_id);
        character.name = name;
        character.level = level;
        character.targetLevel = targetLevel;
        character.bossing = bossing;
    
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

        res.status(200).send('Character updated successfully.');
      } catch (error) {
        console.error('Error updating character:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
      
    },

    getCharacterData: async (req, res) => {
      try {
        const { username, server, characterClass } = req.params;
        let query = {
          userOrigin: username,
          server: server,
          class: characterClass
        };
        const character = await Character.findOne(query);

        res.status(200).json(character);
      } catch (error) {
        console.error('Error retrieving character Data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    fullCharacter: async (req, res) => {
      try{
        const { username, server} = req.params;
        const characters = await Character.find({userOrigin: username, server: server});
        res.status(200).json(characters);

      } catch (error) {
        console.log('Error retrieving characters Data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },

    increaseDaily:  async (req, res) => {
      try{
        const {forceType, forceName, value, characterData, necessaryExp, date} = req.body;
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
  
          const jsDate = new Date(date);
          foundArea.content[0].date = jsDate;
          await foundCharacter.save();
          res.status(200).send('Value updated successfully.');
        }

      }catch(error){
        console.log('Error updating value', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    },
    increaseWeekly: async (req, res) => {
      try{
        const {forceName, value, characterData, necessaryExp, date} = req.body;
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
          res.status(200).send('Value updated successfully.');
        }

      }catch(error){
        console.log('Error updating value', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  }
};
  