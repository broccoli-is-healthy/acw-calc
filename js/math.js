const STORAGE_KEY = "acw-calc-state";

const createDay = (attended = true) => ({
	attended,
	actualAcw: 0,
	acwDifference: 0,
	acwDifferenceTime: { hours: 0, minutes: 0 },
	availableAcw: 0,
	availableAcwTime: { hours: 0, minutes: 0 }
});

let state = loadState();

function loadState() {
	const defaultValues = Array.from({ length: 7 }, (_, i) => createDay(i < 5));
	defaultValues.push({ total: true, totalAcw: 0, totalAcwTime: { hours: 0, minutes: 0 } });
	const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY));
	
	if (!savedState) {
		return defaultValues;
	};
	
	try {
		return defaultValues.map((day, savedDay) => ({
			...day,
			...savedState[savedDay]
		}));
	} catch {
		return defaultValues;
	};
}

function saveState() {
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify(state)
	);
};

export function getCalcState() {
	return structuredClone(state);
};

export function saveCalcState(day, obj) {
	state[day] = {
		...state[day],
		...obj
	};
	saveState();
};

export function resetCalcState() {
	localStorage.removeItem(STORAGE_KEY);
	state = loadState();
};

export function calculate(settings) {
	const acwTarget = settings.acwTarget * 0.01;
	
	// Work hours w/o AUX
	const workHours = settings.workHours * 60 * 60 -
						(!settings.isAcwWoAux ? 0 : settings.dailyAux * 60);
	
	// Get number of attended days
	const attendedDays = state.filter((day) => day.attended).length;
	// ACW target time for whole week
	const acwTargetTime = attendedDays * workHours * acwTarget;
	
	let remainingTime = acwTargetTime;
	let remainingDays = attendedDays;
	state.forEach((day) => {
		// Skip unattended days
		if (!day.attended || day.total) return;
		
		const availableTodayTime = remainingTime / remainingDays;
		const availableTodayPercent = availableTodayTime / workHours;
		
		const dayAcwPercent = day.actualAcw * 0.01;
		const acwDifferenceTime = availableTodayTime - workHours * dayAcwPercent;
		
		// Day
		day.acwDifference = availableTodayPercent - dayAcwPercent;
		if (acwDifferenceTime < 0) {
			day.acwDifferenceTime = {
				hours: Math.ceil(acwDifferenceTime / 3600),
				minutes: Math.ceil((acwDifferenceTime % 3600) / 60)
			};
		} else {
			day.acwDifferenceTime = {
				hours: Math.floor(acwDifferenceTime / 3600),
				minutes: Math.floor((acwDifferenceTime % 3600) / 60)
			};
		};
		day.availableAcw = availableTodayPercent;
		day.availableAcwTime = {
		 	hours: Math.floor(availableTodayTime / 3600),
		 	minutes: Math.floor((availableTodayTime % 3600) / 60)
		};
		
		if (dayAcwPercent) {
			remainingTime = remainingTime - workHours * dayAcwPercent;
			remainingDays--;
		};
	});
	// Convert current acw in to time and sum it
	const totalAcwTime = state.reduce((sum, day) => sum + workHours *
						(day.attended ? day.actualAcw * 0.01 : 0), 0);
	const totalAcwPercent = totalAcwTime / acwTargetTime;
	
	// Totals
	state.at(-1).totalAcw = totalAcwPercent;
	state.at(-1).totalAcwTime = {
		hours: Math.floor(totalAcwTime / 3600),
		minutes: Math.floor((totalAcwTime % 3600) / 60)
	};
	
	return structuredClone(state);
};
