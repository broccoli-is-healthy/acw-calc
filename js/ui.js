// Display content (FOUC prevention)
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
const workHours = document.querySelector("#work-hours");
const dailyAux = document.querySelector("#daily-aux");
const acwTarget = document.querySelector("#acw-target");
const canShowTimeDay = document.querySelector("#display-time-day");
const canShowTimeWeek = document.querySelector("#display-time-week");
const canShowWeekend = document.querySelector("#show-weekend");
const isAcwWoAux = document.querySelector("#acw-wo-aux");

// Calculator
const days = document.querySelectorAll(".day");
const weekend = document.querySelectorAll(".weekend");
const actualAcwInput = document.querySelectorAll(".actual-acw");
const availAcw = document.querySelectorAll(".avail-acw");
const totalAcw = document.getElementById("total-acw");

// Reset buttons
const resetCalculator = document.querySelector("#reset-calc");
const resetEverything = document.querySelector("#reset-everything");

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
	canShowTimeDay.addEventListener("change", () => {
		onSettingChange("canShowTimeDay", Boolean(canShowTimeDay.checked));
	});
	canShowTimeWeek.addEventListener("change", () => {
		onSettingChange("canShowTimeWeek", Boolean(canShowTimeWeek.checked));
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
	canShowTimeDay.checked = settings.canShowTimeDay;
	canShowTimeWeek.checked = settings.canShowTimeWeek;
	canShowWeekend.checked = settings.canShowWeekend;
	isAcwWoAux.checked = settings.isAcwWoAux;
	
	showWeekend(canShowWeekend.checked);
};

// Calculator Initialization
export function setupCalcState(calcState) {
	days.forEach((day, i) => {
		const canEnable = calcState[i].attended;
		const acwInput = actualAcwInput[i];
		
		day.checked = canEnable;
		
		if (canEnable) {
			acwInput.removeAttribute("disabled");
			acwInput.value = calcState[i].actualAcw;
		} else {
			acwInput.setAttribute("disabled", true);
			acwInput.value = "";
		};
	});
};

export function populateCalcResults(result, settings) {
	const canShowTimeDay = settings.canShowTimeDay;
	const canShowTimeWeek = settings.canShowTimeWeek;
	const defaultDuration = { minutes: 0 };
	
	availAcw.forEach((avail, i) => {
		const day = result[i];
		
		if (day.total) return;
		
		if (!day.attended || isNaN(day.availableAcw)) {
			avail.value = "";
			return;
		};
		
		if (day.actualAcw) {
			avail.value = format.percent(day.acwDifference) + 
				(canShowTimeDay ? " / " + format.time(day.acwDifferenceTime) : "");
		} else {
			avail.value = format.percent(day.availableAcw) + 
				(canShowTimeDay ? " / " + format.time(day.availableAcwTime) : "");
		}
	});
	
	totalAcw.value = format.percent(result.at(-1).totalAcw) +
		(canShowTimeWeek ? " / " + format.time(result.at(-1).totalAcwTime) : "");
};
