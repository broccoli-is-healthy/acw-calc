const STORAGE_KEY = "acw-calc-settings";

const defaultSettings = {
	workHours: 8,
	dailyAux: 30,
	acwTarget: 25,
	canShowTime: false,
	canShowWeekend: false,
	isAcwWoAux: false,
};

function createSettings(savedSettings = {}) {
	return {
		...defaultSettings,
		...savedSettings,
		
		get workHoursInSec() {
			return this.workHours * 3600;
		},
		get dailyAuxInSec() {
			return this.dailyAux * 60;
		},
		
		get acwTargetPercent() {
			return this.acwTarget * 0.01;
		},
	};
};

let settings = loadSettings();

function loadSettings() {
	const savedSettings = localStorage.getItem(STORAGE_KEY);
		
	if (!savedSettings) return createSettings();
	
	try {
		return createSettings(JSON.parse(savedSettings));
	} catch {
		return createSettings();
	};
}

export function getSettings() {
	return structuredClone(settings);
};

function saveSettings() {
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(settings)
	);
};

export function setSetting(name, value) {
	settings[name] = value;
	saveSettings();
};

export function resetSettings() {
	localStorage.removeItem(STORAGE_KEY);
	settings = loadSettings();
};
