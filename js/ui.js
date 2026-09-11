// FOUC prevention, this should load long after css is ready
document.querySelector("body").classList.add("ready");

// Formaters
const format = {
	percent: value => new Intl.NumberFormat("en-GB", { style: "percent", minimumFractionDigits: 2 }).format(value),
	time: value => new Intl.DurationFormat("en-GB", { style: "narrow", minutesDisplay: "always" }).format(value)
};

// Tabs
const tabs = document.querySelectorAll("nav[role=tablist] > button");
const tab_panels = document.querySelectorAll("article[role=tabpanel]");

// Settings
const workHours = document.getElementById("work-hours");
const dailyAux = document.getElementById("daily-aux");
const acwTarget = document.getElementById("acw-target");
const canShowTime = document.getElementById("display-time");
const canShowWeekend = document.getElementById("show-weekend");
const isAcwWoAux = document.getElementById("acw-wo-aux");

// Calculator
const days = document.querySelectorAll(".day");
const weekend = document.querySelectorAll(".weekend");
const actualAcwInput = document.querySelectorAll(".actual-acw");
const availAcw = document.querySelectorAll(".avail-acw");
const averageAcw = document.getElementById("average-acw");
const remainingAcw = document.getElementById("remaining-acw");

// Reset buttons
const resetCalculator = document.getElementById("reset-calc");
const resetEverything = document.getElementById("reset-everything");

// TABS
tabs.forEach((tab) => {
	tab.addEventListener("click", (e) => {
		e.preventDefault();
		
		tabs.forEach((button) => {
			if (
				button.getAttribute("aria-controls") ===
				e.target.getAttribute("aria-controls")
			) {
				e.target.setAttribute("aria-selected", true);
				e.target.classList.toggle("primary");
				openTab(e)
			} else {
				button.setAttribute("aria-selected", false);
				button.classList.toggle("primary");
			};
		});
	});
});

function openTab(event) {
	tab_panels.forEach((panel) => {
		if (
			event.target.getAttribute("aria-controls") === panel.id
		) {
			panel.removeAttribute("hidden");
		} else {
			panel.setAttribute("hidden", true);
		};
	});
};

// SETUP
export function setupEventListeners({
	onCalcStateChange = () => {},
	onSettingChange = () => {},
	onResetCalculator = () => {},
	onResetAll = () => {}
}) {
	// Calculator //
	// Days
	days.forEach((day, i) => {
		day.addEventListener("change", (e) => {
			onCalcStateChange(i, { attended: Boolean(e.target.checked) });
		});
	});
	// Acw
	actualAcwInput.forEach((acw, i) => {
		acw.addEventListener("change", (e) => {
			onCalcStateChange(i, { actualAcw: Number(e.target.value) });
		});
	});
	
	// Settings //
	// Workday
	workHours.addEventListener("change", () => {
		onSettingChange("workHours", Number(workHours.value));
	});
	dailyAux.addEventListener("change", () => {
		onSettingChange("dailyAux", Number(dailyAux.value));
	});
	acwTarget.addEventListener("change", () => {
		onSettingChange("acwTarget", Number(acwTarget.value));
	});
	// Display time
	canShowTime.addEventListener("change", () => {
		onSettingChange("canShowTime", Boolean(canShowTime.checked));
	});
	// Miscellaneous
	canShowWeekend.addEventListener("change", () => {
		onSettingChange("canShowWeekend", Boolean(canShowWeekend.checked));
		showWeekend(canShowWeekend.checked);
	});
	isAcwWoAux.addEventListener("change", () => {
		onSettingChange("isAcwWoAux", Boolean(isAcwWoAux.checked));
	});
	
	// Reset buttons //
	resetCalculator.addEventListener("click", (e) => {
		e.preventDefault();
		onResetCalculator();
	});
	resetEverything.addEventListener("click", (e) => {
		e.preventDefault();
		onResetAll();
	});
};

// OTHER TOGGLE ELEMENTS
function showWeekend(canShow) {
	weekend.forEach((day) => {
		if (canShow) {
			day.removeAttribute("hidden");
		} else {
			day.setAttribute("hidden", true);
		};
	});
};

// Settings initialization
export function setupSettings(settings) {
	workHours.value = settings.workHours;
	dailyAux.value = settings.dailyAux;
	acwTarget.value = settings.acwTarget;
	canShowTime.checked = settings.canShowTime;
	canShowWeekend.checked = settings.canShowWeekend;
	isAcwWoAux.checked = settings.isAcwWoAux;
	
	showWeekend(canShowWeekend.checked);
};

// Calculator Initialization
export function setupCalcState(calcState) {
	days.forEach((day, i) => {
		const canEnable = calcState.days[i].attended;
		const acwInput = actualAcwInput[i];
		
		day.checked = canEnable;
		
		if (canEnable) {
			acwInput.removeAttribute("disabled");
			acwInput.value = calcState.days[i].actualAcw;
		} else {
			acwInput.setAttribute("disabled", true);
			acwInput.value = "";
		};
	});
};

export function populateCalcResults(result, settings) {
	const canShowTime = settings.canShowTime;
	
	availAcw.forEach((avail, i) => {
		const day = result.days[i];
		
		if (!day.attended || isNaN(day.availableAcw)) {
			avail.value = "";
			return;
		};
		
		avail.value = (canShowTime ? format.time(day.acwDifferenceTime) : format.percent(day.acwDifference));
	});
	
	averageAcw.value = format.percent(result.averageAcw);
	remainingAcw.value = (canShowTime ? format.time(result.acwRemainingTime) : format.percent(result.acwRemaining));
};
