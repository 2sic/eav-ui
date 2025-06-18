import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DAYJS_DATE_ADAPTER_OPTIONS, MatDayjsDateAdapter } from './mat-dayjs-date-adapter';
import { MAT_DAYJS_DATE_FORMATS } from './mat-dayjs-date-formats';

@NgModule({
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MAT_DAYJS_DATE_FORMATS },
    { provide: MAT_DAYJS_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    {
      provide: DateAdapter,
      useClass: MatDayjsDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_DAYJS_DATE_ADAPTER_OPTIONS]
    }
  ],
})
export class MatDayjsModule { }