const moment = require('moment-timezone');

// Standard format used across the application
const STANDARD_DATE_FORMAT = 'DD/MM/YYYY :: HH:mm:ss';
const TIMEZONE = 'Asia/Kolkata';

const dateUtils = {
    // Convert any date input to standard format
    formatToStandard: (date) => {
        if (!date) return '';
        let momentDate;

        // If input is a string, explicitly parse with format to avoid fallback
        if (typeof date === 'string') {
            momentDate = moment.tz(date, STANDARD_DATE_FORMAT, true, TIMEZONE);
        } else {
            momentDate = moment(date).tz(TIMEZONE);
        }

        return momentDate.isValid()
            ? momentDate.format(STANDARD_DATE_FORMAT)
            : '';
    },

    // Parse standard format to Date object
    parseFromStandard: (dateString) => {
        if (!dateString) return null;
        const momentDate = moment.tz(dateString, STANDARD_DATE_FORMAT, true, TIMEZONE);
        return momentDate.isValid() ? momentDate.toDate() : null;
    },

    // Get current date in standard format
    getCurrentDate: () => {
        return moment().tz(TIMEZONE).format(STANDARD_DATE_FORMAT);
    },

    // Validate if a date string matches our standard format
    isValidDate: (dateString) => {
        return moment(dateString, STANDARD_DATE_FORMAT, true).isValid();
    }
};

module.exports = dateUtils;
