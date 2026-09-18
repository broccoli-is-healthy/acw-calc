const STORAGE_KEY = "acw-calc-state";

// TODO: Day factory with `actualAcwPercent` getter
const createDay = (attended = true) => ({
	attended,
	actualAcw: 0,
	actualTime: { hours: 8, minutes: 0 },
	acwDifference: 0,
	acwDifferenceTime: { hours: 0, minutes: 0 },
	availableAcw: 0,
	availableAcwTime: { hours: 0, minutes: 0 },
});

function createState(savedState) {
	const defaultDays = Array.from({ length: 7 }, (_, i) => createDay(i < 5));
	
	return {
		acwRemaining: 0,
		acwRemainingTime: { hours: 0, minutes: 0 },
		...savedState,
		
		// TODO: Make day factory responsible for merging
		days: defaultDays.map((day, i) => ({
			...day,
			...savedState?.days?.[i]
		})),
		
		get attendedDays() {
			return this.days.filter((day) => day.attended).length;
		},
		get averageAcw() {
			return (this.days.reduce(
				(sum, day) => sum + (day.attended ? day.actualAcw : 0),
				0
			) / this.attendedDays * 0.01);
		},
		get workWeek() {
			// Sum up time for attended days
			return this.days.reduce(
				(sum, day) => sum + (
					day.attended
					? day.actualTime.hours * 3600 + day.actualTime.minutes * 60
					: 0
				),
				0
			);
		},
	};
};

let state = loadState();

function dayWorkHours(i) {
	const day = state.days[i];
	return (
		day.actualTime.hours * 3600 + day.actualTime.minutes * 60
	);
};

function loadState() {
	const savedState = localStorage.getItem(STORAGE_KEY);
	
	if (!savedState) return createState();
	
	try {
		return createState(JSON.parse(savedState));
	} catch {
		return createState();
	};
};

export function getCalcState() {
	return structuredClone(state);
};

function saveState() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export function saveCalcInput(i, day) {
	state.days[i] = {
		...state.days[i],
		...day
	};
	saveState();
};

export function resetCalcState() {
	localStorage.removeItem(STORAGE_KEY);
	state = loadState();
};

function duration(timeInSeconds) {
	if (timeInSeconds < 0) {
		return {
			hours: Math.ceil(timeInSeconds / 3600),
			minutes: Math.ceil((timeInSeconds % 3600) / 60),
		};
	} else {
		return {
			hours: Math.floor(timeInSeconds / 3600),
			minutes: Math.floor((timeInSeconds % 3600) / 60),
		};
	};
};

export function calculate(settings) {
	// Get relevant settings
	const acwTargetPercent = settings.acwTargetPercent;
	const workWeek = state.workWeek - (!settings.isAcwWoAux ? 0 : settings.dailyAuxInSec * state.attendedDays)
	
	// ACW target time for whole week
	const attendedDays = state.attendedDays;
	const acwTargetTime = workWeek * acwTargetPercent;
	
	// Calculate remainging ACW for each day
	let remainingTime = acwTargetTime;
	let remaingingWorkTime = workWeek;
	state.days.forEach((day, i) => {
		if (!day.attended) return; // Skip unattended days
		
		const workHours = dayWorkHours(i) - (!settings.isAcwWoAux ? 0 : settings.dailyAuxInSec);
		const availableTodayPercent = remainingTime / remaingingWorkTime;
		const availableTodayTime = workHours * availableTodayPercent;

		const dayAcwPercent = day.actualAcw * 0.01;
		const acwDifferenceTime = availableTodayTime - workHours * dayAcwPercent;
		
		day.acwDifference = availableTodayPercent - dayAcwPercent;
		day.acwDifferenceTime = duration(acwDifferenceTime);
		
		if (dayAcwPercent) {
			remainingTime -= workHours * dayAcwPercent;
			remaingingWorkTime -= workHours;
		};
	});
	
	const acwRemainingTime = (
		acwTargetTime - state.days.reduce(
			(sum, day, i) => sum + (dayWorkHours(i) - (!settings.isAcwWoAux ? 0 : settings.dailyAuxInSec)) *
			(day.attended ? day.actualAcw * 0.01 : 0), 0)
	);
	
	state.acwRemaining = acwRemainingTime / workWeek;
	state.acwRemainingTime = duration(acwRemainingTime);
	
	saveState();
	return getCalcState();
};
