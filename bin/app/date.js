const logger = require('./logger');

function snapMonthsTo(months) {
    
    let msToHour = 1000 * 60 * 60;
    let msToMonth = msToHour * 24 * 30;
    let monthsInMs = months * msToMonth;
    
    let currentDateInMs = Date.now();
    let backInTimeDate = new Date(currentDateInMs - monthsInMs);

    return format(backInTimeDate);
}

function format(date) {
    let dateString = date.toISOString();
    return dateString.slice(0, dateString.length - 5);
}

module.exports = {
    snapMonthsTo
}
