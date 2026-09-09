import { getSettings, setSetting, resetSettings } from "./settings.js";
import { getCalcState, saveCalcState, resetCalcState, calculate } from "./math.js";
import { setupSettings, setupCalcState, setupEventListeners, populateCalcResults } from "./ui.js"; 

let settings;
let calcState;

function initialize() {
	settings = getSettings();
	calcState = getCalcState();
	setupSettings(settings);
	setupCalcState(calcState);
	populateCalcResults(calculate(settings), settings);
}

setupEventListeners({
	onCalcStateChange: (day, obj) => {
		if (!obj.attended) {
			saveCalcState(day, { actualAcw: 0 });
		};
		saveCalcState(day, obj);
		initialize();
	},
	onSettingChange: (name, value) => {
		if (name === "canShowWeekend" && !value) {
			saveCalcState(5, { attended: false, actualAcw: 0 });
			saveCalcState(6, { attended: false, actualAcw: 0 });
		};
		setSetting(name, value);
		initialize();
	},
	onResetCalculator: () => { resetCalcState(), initialize() },
	onResetAll: () => { resetSettings(), resetCalcState(), initialize() }
});

initialize();
