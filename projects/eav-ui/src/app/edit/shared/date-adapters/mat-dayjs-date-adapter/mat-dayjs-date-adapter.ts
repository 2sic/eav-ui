import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';

export interface MatDayjsDateAdapterOptions {
  /**
   * Turns the use of utc dates on or off.
   * Changing this will change how Angular Material components like DatePicker output dates.
   * {@default false}
   */
  useUtc?: boolean;
}

/** InjectionToken for Dayjs date adapter to configure options. */
export const MAT_DAYJS_DATE_ADAPTER_OPTIONS =
  new InjectionToken<MatDayjsDateAdapterOptions>(
    'MAT_DAYJS_DATE_ADAPTER_OPTIONS',
    {
      providedIn: 'root',
      factory: MAT_DAYJS_DATE_ADAPTER_OPTIONS_FACTORY,
    }
  );

export function MAT_DAYJS_DATE_ADAPTER_OPTIONS_FACTORY(): MatDayjsDateAdapterOptions {
  return {
    useUtc: false,
  };
}

/**
 * This Date Adapter was inspired by @vanrossumict/material-dayjs-adapter
 * https://github.com/vanrossumict/material-dayjs-adapter/tree/localization/projects/material-dayjs-adapter
 * This adapter wasn't made as a fork because @vanrossumict/material-dayjs-adapter is a fork of @tabuckner/material-dayjs-adapter
 * witch since continued to be updated and forked so we didn't want to add to the complexity
 */
@Injectable()
export class MatDayjsDateAdapter extends DateAdapter<Dayjs> {
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
    @Optional() @Inject(MAT_DAYJS_DATE_ADAPTER_OPTIONS) private _options?: MatDayjsDateAdapterOptions
  ) {
    super();

    if (this.shouldUseUtc) {
      dayjs.extend(utc);
    }

    dayjs.extend(localizedFormat);
    dayjs.extend(customParseFormat);
    dayjs.extend(localeData);

    this.setLocale(dayjs().locale());
  }

  /**
   * @vanrossumict/material-dayjs-adapter didn't set dayjs locale in adapter but in the component in witch it was used
   */
  setLocale(locale: string) {
    super.setLocale(locale);

    dayjs.locale(locale);
    const localeData = dayjs().locale(locale).localeData();

    this.localeData = {
      firstDayOfWeek: localeData.firstDayOfWeek(),
      longMonths: dayjs.months(),
      shortMonths: dayjs.monthsShort(),
      dates: this.range(31, (i) => this.createDate(2017, 0, i + 1).format('D')),
      longDaysOfWeek: this.range(7, (i) =>
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
    return this.dayJs(date).clone().locale(this.locale);
  }

  /**
   * @vanrossumict/material-dayjs-adapter didn't set hours, minutes, seconds and milliseconds to zero but we expect
   * dates to have time set as midnight
   */
  createDate(year: number, month: number, date: number): Dayjs {
    const returnDayjs = this.dayJs()
      .set('year', year)
      .set('month', month)
      .set('date', date)
      .set('hour', 0)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
    return returnDayjs;
  }

  today(): Dayjs {
    return this.dayJs();
  }

  parse(value: any, parseFormat: string): Dayjs | null {
    if (value && typeof value === 'string') {
      const longDateFormat = dayjs().localeData().longDateFormat(parseFormat) as string; // MM/DD/YYY or DD-MM-YYYY, etc.

      let parsed = this.dayJs(value, longDateFormat, this.locale, true);

      if (parsed.isValid()) {
        // string value is exactly like long date format
        return parsed;
      }

      if (value.length === 9) {
        // user might have typed 1-12-2020 or 12/1/2020
        // try to parse with D-MM-YYYY or MM/D/YYYY (based on long date format)
        const formatWithSmallDay = longDateFormat.replace('DD', 'D');
        parsed = this.dayJs(value, formatWithSmallDay, this.locale, true);
        if (parsed.isValid()) {
          return parsed;
        }

        // user might have typed 25-1-2020 or 1/25/2020
        // try to parse with DD-M-YYYY or M/DD/YYYY (based on long date format)
        const formatWithSmallMonth = longDateFormat.replace('MM', 'M');
        parsed = this.dayJs(value, formatWithSmallMonth, this.locale, true);
        if (parsed.isValid()) {
          return parsed;
        }
      }

      if (value.length === 8) {
        // user might have typed 24012020 or 01242020
        // strip long date format of non-alphabetic characters so we get MMDDYYYY or DDMMYYYY
        const formatWithoutSeparators = longDateFormat.replace(/[\W_]+/g, '');
        parsed = this.dayJs(value, formatWithoutSeparators, this.locale, true);
        if (parsed.isValid()) {
          return parsed;
        }

        // user might have typed 1-2-2020 or 2/1/2020
        // try to parse with D-M-YYYY or M/D/YYYY (based on long date format)
        const formatWithSmallDayAndMonth = longDateFormat.replace('DD', 'D').replace('MM', 'M');
        parsed = this.dayJs(value, formatWithSmallDayAndMonth, this.locale, true);
        if (parsed.isValid()) {
          return parsed;
        }
      }

      if (value.length < 6 && value.length > 2) {
        // user might have typed 01/24, 24-01, 1/24, 24/1 or 24-1
        // try to extract month and day part and parse them with custom format
        let parts = new Array();
        if (value.indexOf('/') !== -1) {
          parts = value.split('/');
        }
        if (value.indexOf('-') !== -1) {
          parts = value.split('-');
        }
        if (value.indexOf('.') !== -1) {
          parts = value.split('.');
        }
        if (parts.length === 2) {
          let dayPart: string;
          let monthPart: string;
          if (longDateFormat.startsWith('D')) {
            dayPart = parts[0];
            monthPart = parts[1];
          } else if (parts.length > 1) {
            monthPart = parts[0];
            dayPart = parts[1];
          }
          if (monthPart.length === 1) {
            monthPart = 0 + monthPart;
          }
          if (dayPart.length === 1) {
            dayPart = 0 + dayPart;
          }
          parsed = this.dayJs(dayPart + monthPart, 'DDMM', this.locale, true);
          if (parsed.isValid()) {
            return parsed;
          }
        }
      }

      if (value.length === 2) {
        // user might have typed 01, parse DD only
        const format = 'DD';
        parsed = this.dayJs(value, format, this.locale, true);
        if (parsed.isValid()) {
          return parsed;
        }
      }

      if (value.length === 1) {
        // user might have typed 1, parse D only
        const format = 'D';
        parsed = this.dayJs(value, format, this.locale, true);

        if (parsed.isValid()) {
          return parsed;
        }
      }

      // not able to parse anything sensible, return something invalid so input can be corrected
      return this.dayJs(null);
    }

    return value ? this.dayJs(value).locale(this.locale) : null;
  }

  format(date: Dayjs, displayFormat: string): string {
    if (!this.isValid(date)) {
      throw Error('DayjsDateAdapter: Cannot format invalid date.');
    }
    return date.locale(this.locale).format(displayFormat);
  }

  addCalendarYears(date: Dayjs, years: number): Dayjs {
    return date.add(years, 'year');
  }

  addCalendarMonths(date: Dayjs, months: number): Dayjs {
    return date.add(months, 'month');
  }

  addCalendarDays(date: Dayjs, days: number): Dayjs {
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
      date = (this.dayJs(value) as unknown as string);
    }
    if (date && this.isValid(date as Dayjs)) {
      return this.dayJs(date);
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

  /**
   * @vanrossumict/material-dayjs-adapter didn't actually used this.shouldUseUtc function and no matter the chosen option
   * no date used UTC
   */
  private dayJs(input?: string | number | Date | Dayjs | null | undefined, format?: string, locale?: string, isTyped?: boolean): Dayjs {
    isTyped = isTyped || false;
    if (!this.shouldUseUtc) {
      return dayjs(input, format);
    }
    // when user writes date
    if (typeof (input) === 'string') {
      const date = new Date(dayjs(input, format).toDate());
      // this is necessary because for typed dates time is set to midnight, not to the appropriate UTC time
      if (isTyped) {
        date.setUTCHours(date.getUTCHours() - date.getTimezoneOffset() / 60);
      }
      // this is necessary because for -(minus) timezones getDate returns date for previous day
      if (date.getTimezoneOffset() > 0)
        return dayjs(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))).add(1, 'day').utc();
      return dayjs(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))).utc();
    }
    // when user picks date in date picker
    return dayjs(input, format).utc();
  }

  private range<T>(length: number, valueFunction: (index: number) => T): T[] {
    const valuesArray = Array(length);
    for (let i = 0; i < length; i++) {
      valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
  }

  private get shouldUseUtc(): boolean {
    const { useUtc }: MatDayjsDateAdapterOptions = this._options || {};
    return !!useUtc;
  }
}
