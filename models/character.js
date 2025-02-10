const mongoose = require('mongoose');
const path = require('path');
const jsonData = require('../public/data/classes.json');
const { User } = require('./user');
const { timeConditionChecker, getWeeklyResetDate } = require('../public/javascript/utils/weeklyReset');
const { codeToClass } = require('../public/javascript/utils/characterData');
const { DateTime } = require('luxon');

const Character = mongoose.model(
	'Character',
	new mongoose.Schema(
		{
			name: { type: String },
			level: { type: Number },
			targetLevel: { type: Number },
			class: { type: String },
			jobType: { type: String },
			legion: { type: String },
			linkSkill: { type: String },
			bossing: {
				type: Boolean,
				default: false,
			},
			server: { type: String },
			userOrigin: { type: String },
			lastUpdate: { type: Date },
			ArcaneForce: [
				{
					name: { type: String, required: true },
					level: { type: Number, required: true },
					exp: { type: Number, required: true },
					content: [
						{
							contentType: {
								type: String,
								required: true,
								editable: false,
							},
							checked: { type: Boolean },
							date: { type: Date },
							tries: { type: Number },
							maxTries: { type: Number },
						},
					],
				},
			],
			SacredForce: [
				{
					name: { type: String, required: true },
					level: { type: Number, required: true },
					exp: { type: Number, required: true },
					content: [
						{
							contentType: {
								type: String,
								required: true,
								editable: false,
							},
							checked: { type: Boolean },
							date: { type: Date },
						},
					],
				},
			],
			GrandSacredForce: [
				{
					name: { type: String, required: true },
					level: { type: Number, required: true },
					exp: { type: Number, required: true },
					content: [
						{
							contentType: {
								type: String,
								required: true,
								editable: false,
							},
							checked: { type: Boolean },
							date: { type: Date },
						},
					],
				},
			],
		},
		{ strictPopulate: false }
	)
);

const templateCharacter = {
	name: 'Character Name',
	level: 0,
	targetLevel: 10,
	bossing: false,
	ArcaneForce: [
		{
			name: 'Vanish Journey',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
				{
					contentType: 'Erda Spectrum',
					checked: false,
					tries: 3,
					maxTries: 3,
					date: null,
				},
				{
					contentType: 'Reverse City',
					checked: false,
				},
			],
		},
		{
			name: 'Chu Chu Island',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
				{
					contentType: 'Hungry Muto',
					checked: false,
					tries: 3,
					maxTries: 3,
					date: null,
				},
				{
					contentType: 'Yum Yum Island',
					checked: false,
				},
			],
		},
		{
			name: 'Lachelein',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
				{
					contentType: 'Midnight Chaser',
					checked: false,
					tries: 3,
					maxTries: 3,
					date: null,
				},
			],
		},
		{
			name: 'Arcana',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
				{
					contentType: 'Spirit Savior',
					checked: false,
					tries: 3,
					maxTries: 3,
					date: null,
				},
			],
		},
		{
			name: 'Morass',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
				{
					contentType: 'Ranheim Defense',
					checked: false,
					tries: 3,
					maxTries: 3,
					date: null,
				},
			],
		},
		{
			name: 'Esfera',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
				{
					contentType: 'Esfera Guardian',
					checked: false,
					tries: 3,
					maxTries: 3,
					date: null,
				},
			],
		},
	],
	SacredForce: [
		{
			name: 'Cernium',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
		{
			name: 'Arcus',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
		{
			name: 'Odium',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
		{
			name: 'Shangri-La',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
		{
			name: 'Arteria',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
		{
			name: 'Carcion',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
	],
	GrandSacredForce: [
		{
			name: 'Tallahart',
			level: 1,
			exp: 1,
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
				},
			],
		},
	],
};

var defaultCharacters = [];

async function createDefaultCharacters(serverName, username) {
	for (const jsonDataIndex of jsonData) {
		const createdCharacter = await createCharacter(jsonDataIndex, serverName, username);
		defaultCharacters.push(createdCharacter);
	}
	const exportCharacters = [...defaultCharacters];
	defaultCharacters.length = 0;
	return exportCharacters;
}

async function createMissingCharacters(userID, username) {
	const userData = await User.findById(userID)
		.populate({
			path: 'servers',
			populate: {
				path: 'characters',
				model: Character,
				select: 'code',
			},
		})
		.exec();

	for (server of userData.servers) {
		const serverCharacterCodes = server.characters.map((character) => character.class);
		const serverMissingCharacters = jsonData.filter((character) => serverCharacterCodes.includes(character.class));

		for (missingCharacter of serverMissingCharacters) {
			const createdCharacter = await createCharacter(missingCharacter, server.name, username);
			server.characters.push(createdCharacter._id);
			await createdCharacter.save();
			await server.save();
			console.log(`${createdCharacter.class} created on ${server.name} server`);
		}
	}
}

async function createCharacter(data, serverName, username) {
	const character = {
		...templateCharacter,
		class: data.className,
		jobType: data.jobType,
		legion: data.legionType,
		linkSkill: data.linkSkill,
		server: serverName,
		userOrigin: username,
	};
	return new Character(character);
}

async function updateCharacters(userID) {
	const userData = await User.findById(userID)
		.populate({
			path: 'servers',
			populate: {
				path: 'characters',
				model: Character,
				populate: [{ path: 'ArcaneForce' }, { path: 'SacredForce' }, { path: 'GrandSacredForce' }],
			},
		})
		.exec();
	for (const server of userData.servers) {
		for (const character of server.characters) {
			await updateForceData(character, 'ArcaneForce', templateCharacter.ArcaneForce);
			await updateForceData(character, 'SacredForce', templateCharacter.SacredForce);
			await updateForceData(character, 'GrandSacredForce', templateCharacter.GrandSacredForce);

			await character.save();
		}
	}
}

async function updateCharacterWeekly(username, server, characterClass) {
	try {
		const formattedClass = codeToClass(characterClass);
		const userData = await Character.findOne({
			userOrigin: username,
			server: server,
			class: formattedClass,
		});

		const timeNow = DateTime.utc();
		const userLastLogin = DateTime.fromJSDate(userData.lastUpdate, {
			zone: 'utc',
		});
		const nextMonday = getWeeklyResetDate(userLastLogin, 1);

		const MondayPassed = timeConditionChecker(nextMonday, timeNow);
		// Check if the last login date is before the most recent Monday midnight (UTC)
		if (MondayPassed) {
			for (const force of userData.ArcaneForce) {
				force.content[1].tries = Number(3);
			}
			userData.lastUpdate = DateTime.now();
			await userData.save();
			console.log('Weekly update performed.');
		} else {
			console.log('Weekly update not needed.');
		}
	} catch (error) {
		console.error('Error updating characters weekly:', error);
	}
}

async function updateForceData(updatingCharacter, forceType, templateForce) {
	const updatingForce = updatingCharacter[forceType] || [];
	//Add missing Areas
	const missingArea = templateForce.filter(
		(newArea) => !updatingForce.some((existingArea) => existingArea.name === newArea.name)
	);
	for (area of missingArea) {
		updatingForce.push(area);
	}
	//Remove Areas
	const areasToDelete = updatingForce.filter(
		(newArea) => !templateForce.some((existingArea) => existingArea.name === newArea.name)
	);
	areasToDelete.forEach((areaToRemove) => {
		const index = updatingForce.findIndex((area) => area.name === areaToRemove.name);
		if (index !== -1) {
			updatingForce.splice(index, 1);
		}
	});

	for (let i = 0; i < updatingForce.length; i++) {
		const character = updatingForce[i];
		const template = templateForce[i];
		//Add new content
		const missingContent = template.content.filter(
			(newContent) =>
				!character.content.some((exisstingContent) => exisstingContent.contentType === newContent.contentType)
		);
		for (content of missingContent) {
			character.content.push(content);
		}

		//Delete content
		const contentToDelete = character.content.filter(
			(newArea) => !template.content.some((existingArea) => existingArea.contentType === newArea.contentType)
		);
		contentToDelete.forEach((content) => {
			const index = character.content.findIndex((area) => area.contentType === content.contentType);
			if (index !== -1) {
				character.content.splice(index, 1);
			}
		});
	}
}

module.exports = {
	Character,
	createDefaultCharacters,
	createMissingCharacters,
	updateCharacters,
	updateCharacterWeekly,
};
