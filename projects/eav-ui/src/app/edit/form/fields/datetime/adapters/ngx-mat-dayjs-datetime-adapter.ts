import { Optional, Inject, InjectionToken, Injectable } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import dayjs, { Dayjs, UnitType } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
// import badMutable from 'dayjs/plugin/badMutable'; // commented because it is not working with datime picker calendar as expected
import 'dayjs/locale/en-gb';
import 'dayjs/locale/en';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/cs';
import 'dayjs/locale/pt';
import 'dayjs/locale/hr';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';

export interface NgxMatDayjsDatetimeAdapterOptions {
  /**
   * Turns the use of utc dates on or off.
   * Changing this will change how Angular Material components like DatePicker output dates.
   * {@default false}
   */
  useUtc?: boolean;
}

/** InjectionToken for Dayjs date adapter to configure options. */
export const NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS =
  new InjectionToken<NgxMatDayjsDatetimeAdapterOptions>(
    'NGX_MAT_DAYJS_DATE_ADAPTER_OPTIONS',
    {
      providedIn: 'root',
      factory: NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS_FACTORY,
    }
  );

export function NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS_FACTORY(): NgxMatDayjsDatetimeAdapterOptions {
  return {
    useUtc: false,
  };
}

/**
 * dayjs-adapter is used with datetime picker control that is made to work with mutable Moment type
 * use private $set to mutate internal dayjs property, so that timepicker still works as expected
 * this was necesery hack to avoid use of badMutable
 */
interface DayjsMutableSet extends Dayjs {
  $set(unit: UnitType, value: number): void
}

/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  const valuesArray = Array(length);
  for (let i = 0; i < length; i++) {
    valuesArray[i] = valueFunction(i);
  }
  return valuesArray;
}

/** Adapts Dayjs Dates for use with Angular Material. */
@Injectable()
export class NgxMatDayjsDatetimeAdapter extends NgxMatDateAdapter<Dayjs> {
  private localeData: {
    firstDayOfWeek: number;
    longMonths: string[];
    shortMonths: string[];
    dates: string[];
    longDaysOfWeek: string[];
    shortDaysOfWeek: string[];
    narrowDaysOfWeek: string[];
  };

  constructor(
    @Optional() @Inject(MAT_DATE_LOCALE) public dateLocale: string,
    @Optional() @Inject(NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS) private _options?: NgxMatDayjsDatetimeAdapterOptions
  ) {
    super();

    if (this.shouldUseUtc) {
      dayjs.extend(utc);
    }

    dayjs.extend(localizedFormat);
    dayjs.extend(customParseFormat);
    dayjs.extend(localeData);
    // dayjs.extend(badMutable); // commented because it is not working with datime picker calendar as expected

    this.setLocale(dayjs().locale());
  }

  setLocale(locale: string) {
    super.setLocale(locale);

    let loc = locale;
    if (loc == "en-US") loc = "en";
    this.locale = loc;
    dayjs.locale(loc.toLowerCase());
    let localeData = dayjs().locale(loc.toLowerCase()).localeData();

    this.localeData = {
      firstDayOfWeek: localeData.firstDayOfWeek(),
      longMonths: dayjs.months(),
      shortMonths: dayjs.monthsShort(),
      dates: range(31, (i) => this.createDate(2017, 0, i + 1).format('D')),
      longDaysOfWeek: range(7, (i) =>
        this.dayJs().set('day', i).format('dddd')
      ),
      shortDaysOfWeek: dayjs.weekdaysShort(),
      narrowDaysOfWeek: dayjs.weekdaysMin(),
    };
  }

  getYear(date: Dayjs): number {
    return this.clone(date).year();
  }

  getMonth(date: Dayjs): number {
    return this.clone(date).month();
  }

  getDate(date: Dayjs): number {
    return this.clone(date).date();
  }

  getDayOfWeek(date: Dayjs): number {
    return this.clone(date).day();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    return style === 'long'
      ? this.localeData.longMonths
      : this.localeData.shortMonths;
  }

  getDateNames(): string[] {
    return this.localeData.dates;
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (style === 'long') {
      return this.localeData.longDaysOfWeek;
    }
    if (style === 'short') {
      return this.localeData.shortDaysOfWeek;
    }
    return this.localeData.narrowDaysOfWeek;
  }

  getYearName(date: Dayjs): string {
    return this.clone(date).format('YYYY');
  }

  getFirstDayOfWeek(): number {
    return this.localeData.firstDayOfWeek;
  }

  getNumDaysInMonth(date: Dayjs): number {
    return this.clone(date).daysInMonth();
  }

  clone(date: Dayjs): Dayjs {
    return this.dayJs(date).clone().locale(this.locale)
  }

  createDate(year: number, month: number, date: number, hour?: number, minute?: number, second?: number): Dayjs {
    const returnDayjs = this.dayJs()
      .set('year', year)
      .set('month', month)
      .set('date', date);
    if (hour)
      returnDayjs.set('hour', hour);
    if (minute)
      returnDayjs.set('minute', minute);
    if (second)
      returnDayjs.set('second', second);
    return returnDayjs;
  }

  today(): Dayjs {
    return this.dayJs();
  }

  parse(value: any, parseFormat: string): Dayjs | null {
    if (value && typeof value === 'string') {
      return this.dayJs(
        value,
        dayjs().localeData().longDateFormat(parseFormat),
        this.locale
      );
    }
    return value ? this.dayJs(value).locale(this.locale) : null;
  }

  format(date: Dayjs, displayFormat: string): string {
    if (!this.isValid(date)) {
      throw Error('DayjsDateAdapter: Cannot format invalid date.');
    }
    return date.locale(this.locale).format(displayFormat);
  }

  addCalendarYears(date: dayjs.Dayjs, years: number): Dayjs {
    return date.add(years, 'year');
  }

  addCalendarMonths(date: dayjs.Dayjs, months: number): Dayjs {
    return date.add(months, 'month');
  }

  addCalendarDays(date: dayjs.Dayjs, days: number): Dayjs {
    return date.add(days, 'day');
  }

  toIso8601(date: Dayjs): string {
    return date.toISOString();
  }

  /**
   * Attempts to deserialize a value to a valid date object. This is different from parsing in that
   * deserialize should only accept non-ambiguous, locale-independent formats (e.g. a ISO 8601
   * string). The default implementation does not allow any deserialization, it simply checks that
   * the given value is already a valid date object or null. The `<mat-datepicker>` will call this
   * method on all of it's `@Input()` properties that accept dates. It is therefore possible to
   * support passing values from your backend directly to these properties by overriding this method
   * to also deserialize the format used by your backend.
   * @param value The value to be deserialized into a date object.
   * @returns The deserialized date object, either a valid date, null if the value can be
   *     deserialized into a null date (e.g. the empty string), or an invalid date.
   */
  deserialize(value: any): Dayjs | null {
    let date;
    if (value instanceof Date) {
      date = this.dayJs(value);
    } else if (this.isDateInstance(value)) {
      // NOTE: assumes that cloning also sets the correct locale.
      return this.clone(value);
    }
    if (typeof value === 'string') {
      if (!value) {
        return null;
      }
      date = this.dayJs(value).toISOString();
    }
    if (date && this.isValid(date as Dayjs)) {
      return this.dayJs(date); // NOTE: Is this necessary since Dayjs is immutable and Moment was not?
    }
    return super.deserialize(value);
  }

  isDateInstance(obj: any): boolean {
    return dayjs.isDayjs(obj);
  }

  isValid(date: Dayjs): boolean {
    return this.clone(date).isValid();
  }

  invalid(): Dayjs {
    return this.dayJs(null);
  }

  getHour(date: Dayjs): number {
    return this.clone(date).hour();
  }

  getMinute(date: Dayjs): number {
    return this.clone(date).minute();
  }

  getSecond(date: Dayjs): number {
    return this.clone(date).second();
  }

  setHour(date: DayjsMutableSet, value: number): void {
    date.$set('hour', value);
  }

  setMinute(date: DayjsMutableSet, value: number): void {
    date.$set('minute', value);
  }

  setSecond(date: DayjsMutableSet, value: number): void {
    date.$set('second', value);
  }

  private dayJs(input?: string | number | Date | Dayjs | null | undefined, format?: string, locale?: string): Dayjs {
    if (!this.shouldUseUtc) {
      return dayjs(input, { format, locale }, locale);
    }
    return dayjs(
      input,
      { format, locale, utc: this.shouldUseUtc },
      locale
    ).utc();
  }

  private get shouldUseUtc(): boolean {
    const { useUtc }: NgxMatDayjsDatetimeAdapterOptions = this._options || {};
    return !!useUtc;
  }
}
