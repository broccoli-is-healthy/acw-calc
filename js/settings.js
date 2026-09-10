const STORAGE_KEY = "acw-calc-settings";

const defaultSettings = {
	workHours: 8,
	dailyAux: 30,
	acwTarget: 25,
	canShowTime: false,
	canShowWeekend: false,
	isAcwWoAux: false
};

let settings = loadSettings();

function loadSettings() {
	const savedSettings = localStorage.getItem(STORAGE_KEY);
	
	if (!savedSettings) {
		return { ...defaultSettings };
	};
	
	try {
		return {
			...defaultSettings,
			...JSON.parse(savedSettings)
		};
	} catch {
		return { ...defaultSettings };
	};
};

function saveSettings() {
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(settings)
	);
};

export function getSettings() {
	return structuredClone(settings);
};

export function setSetting(name, value) {
	settings[name] = value;
	saveSettings();
};

export function resetSettings() {
	localStorage.removeItem(STORAGE_KEY);
	settings = loadSettings();
};
