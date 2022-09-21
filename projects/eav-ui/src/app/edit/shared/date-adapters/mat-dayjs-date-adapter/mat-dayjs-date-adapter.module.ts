import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDayjsDateAdapter, MAT_DAYJS_DATE_ADAPTER_OPTIONS} from './mat-dayjs-date-adapter'
import { MAT_DAYJS_DATE_FORMATS } from './mat-dayjs-date-formats';

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
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MAT_DAYJS_DATE_FORMATS }],
})
export class MatDayjsModule { }