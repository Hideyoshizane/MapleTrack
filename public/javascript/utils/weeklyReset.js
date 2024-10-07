function getWeeklyResetDate(currentDate, targetDayOfWeek) {
	const daysUntilNextDayOfWeek = (targetDayOfWeek - currentDate.weekday + 7) % 7;

	const nextDayOfWeek = currentDate
		.set({
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0,
		})
		.plus({
			days: daysUntilNextDayOfWeek === 0 ? 7 : daysUntilNextDayOfWeek,
		});
	return nextDayOfWeek;
}

function timeConditionChecker(nextDay, timeNow) {
	if (!timeNow.isValid || !nextDay.isValid || timeNow.diff(nextDay, 'days').days >= 1) {
		return true;
	}
	if (timeNow.hasSame(nextDay, 'day')) {
		return timeNow.hour > nextDay.hour || (timeNow.hour === nextDay.hour && timeNow.minute > nextDay.minute);
	}

	return false;
}

if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		getWeeklyResetDate,
		timeConditionChecker,
	};
}
