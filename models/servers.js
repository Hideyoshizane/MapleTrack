const mongoose = require('mongoose');
const { Character, createDefaultCharacters } = require('./character');
const { User } = require('./user');

const serverSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		img: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		usernameSource: [{ type: mongoose.Schema.Types.ObjectID, ref: 'User' }],
		characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
	},
	{ strictPopulate: false }
);

const defaultServers = [
	{
		name: 'Scania',
		img: '/public/assets/icons/servers/scania',
		type: 'Regular',
	},
	{ name: 'Bera', img: '/public/assets/icons/servers/bera', type: 'Regular' },
	{
		name: 'Aurora',
		img: '/public/assets/icons/servers/aurora',
		type: 'Regular',
	},
	{
		name: 'Elysium',
		img: '/public/assets/icons/servers/elysium',
		type: 'Regular',
	},
	{
		name: 'Kronos',
		img: '/public/assets/icons/servers/kronos',
		type: 'Reboot',
	},
	{
		name: 'Hyperion',
		img: '/public/assets/icons/servers/hyperion',
		type: 'Reboot',
	},
];

async function searchServersAndCreateMissing(username, userID) {
	const userData = await User.findById(userID);
	let userStoredServers = userData ? userData.servers.map((server) => server.name) : [];

	// Find missing servers that are not in the user's stored servers
	const missingServers = defaultServers.filter((server) => !userStoredServers.includes(server.name));

	if (missingServers.length === 0) {
		console.log('User servers are updated.');
		return;
	}

	for (const server of missingServers) {
		await createMissingServer(userID, server, username);
	}
}

async function createMissingServer(userID, missingServersData, username) {
	try {
		// Check if the server already exists in the database
		let existingServer = await Server.findOne({ name: missingServersData.name });

		if (!existingServer) {
			// If not, create a new server
			const baseCharacters = await createDefaultCharacters(missingServersData.name, username);
			existingServer = new Server({
				name: missingServersData.name,
				img: missingServersData.img,
				type: missingServersData.type,
				usernameSource: [userID], // Wrap in an array to match schema
				characters: baseCharacters.map((char) => char._id),
			});

			await Character.insertMany(baseCharacters);
			await existingServer.save();
			console.log(`${existingServer.name} created.`);
		} else {
			// Ensure the user is in the `usernameSource` array if the server already exists
			if (!existingServer.usernameSource.includes(userID)) {
				existingServer.usernameSource.push(userID);
				await existingServer.save();
			}
		}

		// Link the server to the user if not already linked
		const updatedUser = await User.findByIdAndUpdate(
			userID,
			{ $addToSet: { servers: existingServer._id } }, // Prevent duplicate entry
			{ new: true }
		);

		if (!updatedUser) {
			throw new Error('User not found or update failed');
		}

		console.log(`${existingServer.name} linked to the user.`);
	} catch (error) {
		console.error('Error in createMissingServer:', error);
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
						highestLevel: character.level,
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
module.exports = {
	Server,
	serverSchema,
	searchServersAndCreateMissing,
	createMissingServer,
	defaultServers,
	getServerWithHighestLevel,
	getHighestLevelCharacter,
};
