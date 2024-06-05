import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDayjsDateAdapter, MAT_DAYJS_DATE_ADAPTER_OPTIONS } from './mat-dayjs-date-adapter'
import { MAT_DAYJS_DATE_FORMATS } from './mat-dayjs-date-formats';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { OWL_DAYJS_DATE_TIME_ADAPTER_OPTIONS } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';


const OWL_DAYJS_FORMATS = {
  parseInput: 'l LT',
  fullPickerInput: 'l LT',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: MatDayjsDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_DAYJS_DATE_ADAPTER_OPTIONS]
    }
  ],
})
export class MatDayjsDateModule { }


@NgModule({
  imports: [MatDayjsDateModule],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MAT_DAYJS_DATE_FORMATS },
  { provide: MAT_DAYJS_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
  { provide: OWL_DATE_TIME_FORMATS, useValue: OWL_DAYJS_FORMATS },
  { provide: OWL_DAYJS_DATE_TIME_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
})
export class MatDayjsModule { }
