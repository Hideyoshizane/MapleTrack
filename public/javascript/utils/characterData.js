function getRank(characterData) {
	const { level, class: CharacterClass } = characterData;

	if (CharacterClass === 'Zero') {
		if (level >= 130 && level <= 159) return 'b';
		if (level >= 160 && level <= 179) return 'a';
		if (level >= 180 && level <= 199) return 's';
		if (level >= 200 && level <= 249) return 'ss';
		if (level >= 250) return 'sss';
	} else {
		if (level >= 60 && level <= 99) return 'b';
		if (level >= 100 && level <= 139) return 'a';
		if (level >= 140 && level <= 199) return 's';
		if (level >= 200 && level <= 249) return 'ss';
		if (level >= 250) return 'sss';
	}

	return 'no_rank';
}

function getCode(characterData) {
	return characterData.class
		.replace(/ /g, '_')
		.replace(/[^a-zA-Z0-9_]/g, '')
		.replace(/_+/g, '_')
		.toLowerCase();
}

function getJob(characterData) {
	const { level } = characterData;
	if (level < 30) return '1st Class';
	if (level >= 30 && level < 60) return '2nd Class';
	if (level >= 60 && level < 100) return '3rd Class';
	if (level >= 100 && level < 200) return '4th Class';
	if (level >= 200 && level < 260) return 'V Class';
	if (level >= 260) return 'VI Class';
}

function codeToClass(code) {
	const formattedCode = code.replace(/(^\w|_(\w))/g, (match) => match.toUpperCase());

	if (code === 'ice_lightning' || code === 'fire_poison') {
		return formattedCode.replace(/_/g, ' & ');
	} else {
		return formattedCode.replace(/_/g, ' ');
	}
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		codeToClass,
	};
}
