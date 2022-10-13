import { NgxMatDateAdapter, NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxMatDayjsDatetimeAdapter, NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS } from './ngx-mat-dayjs-datetime-adapter'
import { NGX_MAT_DAYJS_DATETIME_FORMATS } from './ngx-mat-dayjs-datetime-formats';

@NgModule({
  providers: [
    {
      provide: NgxMatDateAdapter,
      useClass: NgxMatDayjsDatetimeAdapter,
      deps: [MAT_DATE_LOCALE, NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS]
    }
  ],
})
export class NgxMatDayjsDatetimeModule { }

@NgModule({
  imports: [NgxMatDayjsDatetimeModule],
  providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: NGX_MAT_DAYJS_DATETIME_FORMATS }],
})
export class NgxMatDayjsModule { }