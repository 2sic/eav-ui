import { MatDateFormats } from '@angular/material/core';

const DEFAULT_DATE_INPUT = 'L';   // Locale-specific date format, e.g., 'MM/DD/YYYY' or 'DD/MM/YYYY'
const DEFAULT_TIME_INPUT = 'LT';  // Locale-specific time format, e.g., 'h:mm A' or 'HH:mm'
const TIME_OPTION_LABEL = 'LT';   // Format for time options in the dropdown

export const MAT_DAYJS_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: DEFAULT_DATE_INPUT,
    timeInput: DEFAULT_TIME_INPUT,
  },
  display: {
    dateInput: DEFAULT_DATE_INPUT,
    timeInput: DEFAULT_TIME_INPUT,
    timeOptionLabel: TIME_OPTION_LABEL,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
