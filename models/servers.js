const mongoose = require('mongoose');
const { Character, createDefaultCharacters} = require('./character');
const { User } = require('./user');



const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img:{
    type: String,
    required: true
  },
  type:{
    type: String,
    required: true
  },
  usernameSource: [{type: mongoose.Schema.Types.ObjectID, ref: 'User'}],
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
}, { strictPopulate: false });


const defaultServers = [
  { name: 'Scania' ,img:  '../../assets/icons/servers/scania'  , type: 'Regular'},
  { name: 'Bera'   ,img:  '../../assets/icons/servers/bera'    , type: 'Regular'},
  { name: 'Aurora' ,img:  '../../assets/icons/servers/aurora'  , type: 'Regular'},
  { name: 'Elysium',img:  '../../assets/icons/servers/elysium' , type: 'Regular'},
  { name: 'Reboot' ,img:  '../../assets/icons/servers/reboot'  , type: 'Reboot'},
];


async function searchServersAndCreateMissing(userID, username){
  const userData = await User.findById(userID)
  var userStoredServers = []
  if(userData !== null){
    userStoredServers = (userData.servers).map(server => server.name);
  }
  
  const missingServers = defaultServers.filter((server) => !userStoredServers.includes(server.name));
  if(missingServers.length == 0){
    console.log("User servers are updated.");
  }  

  for(const server of missingServers){
    await createMissingServer(userID, server, username);
  }
}

async function createMissingServer(userID, missingServersData, username) {
  const baseCharacters = await createDefaultCharacters(missingServersData.name, username);
  const createdServer = new Server({
    name: missingServersData.name,
    img: missingServersData.img,
    type: missingServersData.type,
    usernameSource: userID,
    characters: baseCharacters.map((char) => char._id),
  });

  await Character.insertMany(baseCharacters);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userID },
      { $addToSet: { servers: createdServer._id } },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found or update failed');
    }

    await createdServer.save();
    console.log(`${createdServer.name} inserted to the user.`);
  } catch (error) {
    console.error('User.findOneAndUpdate failed:', error);
  }
}

async function getServerWithHighestLevel(userID) {
  try {
    const user = await User.findById(userID).populate('servers').exec();
    let maxLevel = 0;
    let serverWithHighestLevel = null;

    for (const server of user.servers) {
      // Populate the characters for the current server
      const populatedServer = await Server.findById(server._id).populate('characters').exec();

      for (const character of populatedServer.characters) {
        if (character.level > maxLevel) {
          maxLevel = character.level;
          serverWithHighestLevel = populatedServer;
        }
      }
    }

    return maxLevel > 0 ? serverWithHighestLevel.name : null;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function getHighestLevelCharacter(userID) {
  try {
    const user = await User.findById(userID).populate('servers').exec();
    let highestLevel = 0;
    let highestLevelCharacter = null;

    for (const server of user.servers) {
      // Populate the characters for the current server
      const populatedServer = await Server.findById(server._id).populate('characters').exec();

      for (const character of populatedServer.characters) {
        if (character.level > highestLevel) {
          highestLevel = character.level;
          highestLevelCharacter = {
            characterName: character.name,
            highestLevel: character.level
          };
        }
      }
    }

    return highestLevel > 0 ? highestLevelCharacter : null;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}




const Server = mongoose.model('Server', serverSchema);
module.exports = {Server, serverSchema , searchServersAndCreateMissing, createMissingServer, defaultServers, getServerWithHighestLevel, getHighestLevelCharacter};

