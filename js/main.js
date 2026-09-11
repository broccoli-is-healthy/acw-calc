import { getSettings, setSetting, resetSettings } from "./settings.js";
import { getCalcState, saveCalcInput, resetCalcState, calculate } from "./math.js";
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
	onCalcStateChange: (i, day) => {
		if (!day.attended) {
			saveCalcInput(i, { actualAcw: 0 });
		};
		saveCalcInput(i, day);
		initialize();
	},
	onSettingChange: (name, value) => {
		if (name === "canShowWeekend" && !value) {
			saveCalcInput(5, { attended: false, actualAcw: 0 });
			saveCalcInput(6, { attended: false, actualAcw: 0 });
		};
		setSetting(name, value);
		initialize();
	},
	onResetCalculator: () => { resetCalcState(), initialize() },
	onResetAll: () => { resetSettings(), resetCalcState(), initialize() }
});

initialize();
