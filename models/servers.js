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
  usernameSource: [{type: mongoose.Schema.Types.ObjectID, ref: 'User'}],
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
}, { strictPopulate: false });


const defaultServers = [
  { name: 'Scania' ,img:  '../../assets/icons/servers/scania'  },
  { name: 'Bera'   ,img:  '../../assets/icons/servers/bera'    },
  { name: 'Aurora' ,img:  '../../assets/icons/servers/aurora'  },
  { name: 'Elysium',img:  '../../assets/icons/servers/elysium' },
  { name: 'Reboot' ,img:  '../../assets/icons/servers/reboot'  },
];


async function searchServersAndCreateMissing(userID, username){
  const userData = await User.findById(userID).populate('servers');
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
    usernameSource: userID,
    characters: baseCharacters.map((char) => char._id),
  });

  await Character.insertMany(baseCharacters);

  try {
    const tesing = await User.findById(userID);
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



const Server = mongoose.model('Server', serverSchema);
module.exports = {Server, serverSchema , searchServersAndCreateMissing, createMissingServer, defaultServers};

