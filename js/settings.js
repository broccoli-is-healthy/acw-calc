const STORAGE_KEY_S = "acw-calc-settings";
const STORAGE_KEY_T = "acw-calc-timer";

function getNewResetDate(now) {
	const date = new Date(now);
	
	// Next monday
	date.setDate(
		date.getDate() + ((1 - date.getDay() + 7) % 7 || 7)
	);
	
	const timestamp = date.setHours(0, 0, 0, 0);
	
	localStorage.setItem(STORAGE_KEY_T, timestamp);
	
	return timestamp;
};

export function checkResetDate(onReset = () => {}) {
	const now = new Date().getTime();
	const savedResetDate = localStorage.getItem(STORAGE_KEY_T);
	
	let resetDate = Number(savedResetDate);
	
	if (savedResetDate === null || !Number.isFinite(resetDate)) {
		resetDate = getNewResetDate(now);
	};
	
	if (resetDate < now) {
		onReset();
		resetDate = getNewResetDate(now);
	};
	
	return (resetDate - now) / 1000;
};

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
	const savedSettings = localStorage.getItem(STORAGE_KEY_S);
		
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
	localStorage.setItem(STORAGE_KEY_S, JSON.stringify(settings));
};

export function setSetting(name, value) {
	settings[name] = value;
	saveSettings();
};

export function resetSettings() {
	localStorage.removeItem(STORAGE_KEY_S);
	settings = loadSettings();
};
