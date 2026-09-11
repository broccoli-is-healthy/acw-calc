const STORAGE_KEY = "acw-calc-state";

// TODO: Day factory with `actualAcwPercent` getter
const createDay = (attended = true) => ({
	attended,
	actualAcw: 0,
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
	};
};

let state = loadState();

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
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(state)  
	);
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
	const workHours = settings.workHoursInSec - (!settings.isAcwWoAux ? 0 : settings.dailyAuxInSec);
	
	// ACW target time for whole week
	const attendedDays = state.attendedDays;
	const workWeek = attendedDays * workHours;
	const acwTargetTime = workWeek * acwTargetPercent;
	
	// Calculate remainging ACW for each day
	let remainingTime = acwTargetTime;
	let remainingDays = attendedDays;
	state.days.forEach((day) => {
		if (!day.attended) return; // Skip unattended days
		
		const availableTodayTime = remainingTime / remainingDays;
		const availableTodayPercent = availableTodayTime / workHours;
		
		const dayAcwPercent = day.actualAcw * 0.01;
		const acwDifferenceTime = availableTodayTime - workHours * dayAcwPercent;
		
		day.acwDifference = availableTodayPercent - dayAcwPercent;
		day.acwDifferenceTime = duration(acwDifferenceTime);
		
		if (dayAcwPercent) {
			remainingTime = remainingTime - workHours * dayAcwPercent;
			remainingDays--;
		};
	});
	
	const acwRemainingTime = (
		acwTargetTime - state.days.reduce(
			(sum, day) => sum + workHours *
			(day.attended ? day.actualAcw * 0.01 : 0), 0)
	);
	
	state.acwRemaining = acwRemainingTime / workWeek;
	state.acwRemainingTime = duration(acwRemainingTime);
	
	saveState();
	return getCalcState();
};
