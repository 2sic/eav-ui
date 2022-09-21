import 'dayjs/locale/en-gb';
import 'dayjs/locale/en';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/cs';
import 'dayjs/locale/pt';
import 'dayjs/locale/hr';

export * from './mat-dayjs-date-adapter/mat-dayjs-date-adapter.module';
export * from './ngx-mat-dayjs-datetime-adapter/ngx-mat-dayjs-datetime-adapter.module';

export { MatDayjsDateAdapter, MatDayjsDateAdapterOptions, MAT_DAYJS_DATE_ADAPTER_OPTIONS } from './mat-dayjs-date-adapter/mat-dayjs-date-adapter';
export { MAT_DAYJS_DATE_FORMATS } from './mat-dayjs-date-adapter/mat-dayjs-date-formats';

export { NgxMatDayjsDatetimeAdapter, NgxMatDayjsDatetimeAdapterOptions, NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS } from './ngx-mat-dayjs-datetime-adapter/ngx-mat-dayjs-datetime-adapter';
export { NGX_MAT_DAYJS_DATETIME_FORMATS } from './ngx-mat-dayjs-datetime-adapter/ngx-mat-dayjs-datetime-formats';