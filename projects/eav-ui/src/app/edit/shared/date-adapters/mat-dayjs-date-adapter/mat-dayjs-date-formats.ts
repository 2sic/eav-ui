import { MatDateFormats } from '@angular/material/core';

const DEFAULT_DATE_INPUT = 'l';

export const MAT_DAYJS_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: DEFAULT_DATE_INPUT,
  },
  display: {
    dateInput: DEFAULT_DATE_INPUT,
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
