import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/ja';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DateTimeUtils } from './datetime-fn';

describe('DateTime Functions', () => {
  let setUiValue: ReturnType<typeof vi.fn>;
  let testDate: dayjs.Dayjs;
  let standardCurrentValue: string;

  const commonISODate = '2025-06-25T';

  function validateDateResult(result: boolean, expectedDate: dayjs.Dayjs, message?: string) {
    expect(result, message ?? 'Result should be true').toBe(true);
    expect(setUiValue, message ?? 'setUiValue should have been called').toHaveBeenCalled();


    const updatedValue = setUiValue.mock.calls.at(-1)?.[0];
    const resultDate = dayjs(updatedValue);

    expect(
      resultDate.isSame(expectedDate, 'second'),
      `Expected ${expectedDate.format()} but got ${resultDate.format()}. ${message ?? ''}`.trim()
    ).toBe(true);
  }

  beforeEach(() => {
    dayjs.extend(utc);
    dayjs.extend(localizedFormat);
    dayjs.extend(localeData);
    dayjs.extend(timezone);
    dayjs.extend(customParseFormat);

    DateTimeUtils.initializeDayjs('en');

    setUiValue = vi.fn();
    testDate = dayjs('2025-06-13T10:45:14Z');
    standardCurrentValue = '2025-06-13T10:45:14Z';
  });

  describe('getLocaleDateFormat', () => {
    it('should return MM/DD/YYYY for US English locale', () => {
      DateTimeUtils.initializeDayjs('en');
      const format = DateTimeUtils.getLocaleDateFormat();
      expect(format).toBe('MM/DD/YYYY');
    });

    it('should return DD.MM.YYYY for German locale', () => {
      DateTimeUtils.initializeDayjs('de');
      const format = DateTimeUtils.getLocaleDateFormat();
      expect(format).toBe('DD.MM.YYYY');
    });

    it('should return DD/MM/YYYY for UK English locale', () => {
      DateTimeUtils.initializeDayjs('en-gb');
      const format = DateTimeUtils.getLocaleDateFormat();
      expect(format).toBe('DD/MM/YYYY');
    });

    it('should return DD/MM/YYYY for French locale', () => {
      DateTimeUtils.initializeDayjs('fr');
      const format = DateTimeUtils.getLocaleDateFormat();
      expect(format).toBe('DD/MM/YYYY');
    });

    it('should return fallback format when locale data is unavailable', () => {
      // This test just verifies the function doesn't crash and returns a valid format
      const format = DateTimeUtils.getLocaleDateFormat();
      expect(format).toBeTruthy();
      expect(typeof format).toBe('string');
    });
  });

  describe('handleDateTimeInput - ISO Format Support', () => {
    describe('ISO dates with time (useTimePicker = true)', () => {
      it('should accept ISO 8601 format with time YYYY-MM-DD HH:mm:ss', () => {
        const expectedDate = dayjs.utc('2025-12-31T23:59:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025-12-31 23:59:00', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO format with seconds');
      });

      it('should accept ISO 8601 format with time YYYY-MM-DD HH:mm', () => {
        const expectedDate = dayjs.utc('2025-12-31T14:30:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025-12-31 14:30', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO format without seconds');
      });

      it('should accept ISO 8601 format with T separator', () => {
        const expectedDate = dayjs.utc('2025-12-31T14:30:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025-12-31T14:30:00', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO format with T separator');
      });

      it('should accept ISO format with slash separators YYYY/MM/DD HH:mm:ss', () => {
        const expectedDate = dayjs.utc('2025-12-31T23:59:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025/12/31 23:59:00', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO slash format with time');
      });

      it('should accept ISO format with slash separators YYYY/MM/DD HH:mm', () => {
        const expectedDate = dayjs.utc('2025-12-31T14:30:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025/12/31 14:30', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO slash format without seconds');
      });
    });

    describe('ISO dates without time (useTimePicker = true)', () => {
      it('should accept ISO date YYYY-MM-DD and set time to midnight', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025-12-31', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO date only should default to midnight');
      });

      it('should accept ISO date with slashes YYYY/MM/DD and set time to midnight', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025/12/31', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'ISO slash date only should default to midnight');
      });
    });

    describe('ISO dates with time when useTimePicker = false', () => {
      it('should accept ISO date with time but ignore time component', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025-12-31 23:59:59', standardCurrentValue, setUiValue, false);
        validateDateResult(result, expectedDate, 'Should ignore time when useTimePicker is false');
      });

      it('should accept ISO slash date with time but ignore time component', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('2025/12/31 14:30', standardCurrentValue, setUiValue, false);
        validateDateResult(result, expectedDate, 'Should ignore time for slash format when useTimePicker is false');
      });
    });
  });

  describe('handleDateTimeInput - Locale-Specific Formats', () => {
    describe('US English (en) - MM/DD/YYYY', () => {
      beforeEach(() => {
        DateTimeUtils.initializeDayjs('en');
      });

      it('should accept US format with time MM/DD/YYYY HH:mm AM/PM', () => {
        const expectedDate = dayjs.utc('2025-12-31T14:30:00Z');
        const result = DateTimeUtils.handleDateTimeInput('12/31/2025 2:30 PM', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'US format with 12-hour time');
      });

      it('should accept US format without time and set to midnight', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('12/31/2025', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'US format date only');
      });

      it('should accept US format with time when useTimePicker is false', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('12/31/2025 11:30 PM', standardCurrentValue, setUiValue, false);
        validateDateResult(result, expectedDate, 'Should ignore time in US format when useTimePicker is false');
      });

      it('should handle midnight (12:00 AM) correctly', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('12/31/2025 12:00 AM', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'Midnight in 12-hour format');
      });

      it('should handle noon (12:00 PM) correctly', () => {
        const expectedDate = dayjs.utc('2025-12-31T12:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('12/31/2025 12:00 PM', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'Noon in 12-hour format');
      });
    });

    describe('German (de) - DD.MM.YYYY', () => {
      beforeEach(() => {
        DateTimeUtils.initializeDayjs('de');
      });

      it('should accept German format with 24-hour time DD.MM.YYYY HH:mm', () => {
        const expectedDate = dayjs.utc('2025-12-31T23:45:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31.12.2025 23:45', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'German format with 24-hour time');
      });

      it('should accept German format without time and set to midnight', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31.12.2025', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'German format date only');
      });

      it('should accept German format with time when useTimePicker is false', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31.12.2025 23:45', standardCurrentValue, setUiValue, false);
        validateDateResult(result, expectedDate, 'Should ignore time in German format when useTimePicker is false');
      });

      it('should handle early morning time (00:00)', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31.12.2025 00:00', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'Early morning in German format');
      });

      it('should handle end of day time (23:59)', () => {
        const expectedDate = dayjs.utc('2025-12-31T23:59:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31.12.2025 23:59', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'End of day in German format');
      });
    });

    describe('UK English (en-gb) - DD/MM/YYYY', () => {
      beforeEach(() => {
        DateTimeUtils.initializeDayjs('en-gb');
      });

      it('should accept UK format with 24-hour time DD/MM/YYYY HH:mm', () => {
        const expectedDate = dayjs.utc('2025-12-31T14:30:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31/12/2025 14:30', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'UK format with 24-hour time');
      });

      it('should accept UK format without time and set to midnight', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31/12/2025', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'UK format date only');
      });

      it('should accept UK format with time when useTimePicker is false', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31/12/2025 14:30', standardCurrentValue, setUiValue, false);
        validateDateResult(result, expectedDate, 'Should ignore time in UK format when useTimePicker is false');
      });
    });

    describe('French (fr) - DD/MM/YYYY', () => {
      beforeEach(() => {
        DateTimeUtils.initializeDayjs('fr');
      });

      it('should accept French format with time DD/MM/YYYY HH:mm', () => {
        const expectedDate = dayjs.utc('2025-12-31T18:45:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31/12/2025 18:45', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'French format with 24-hour time');
      });

      it('should accept French format without time', () => {
        const expectedDate = dayjs.utc('2025-12-31T00:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('31/12/2025', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'French format date only');
      });
    });
  });

  describe('handleDateTimeInput - Edge Cases', () => {
    it('should handle empty input by setting UI value to null', () => {
      const result = DateTimeUtils.handleDateTimeInput('', standardCurrentValue, setUiValue, true);
      expect(result).toBe(true);
      expect(setUiValue).toHaveBeenCalledWith(null);
    });

    it('should reject whitespace-only input', () => {
      // Pure whitespace doesn't parse as a valid date
      const result = DateTimeUtils.handleDateTimeInput('   ', standardCurrentValue, setUiValue, true);
      // Lenient parsing will fail on pure whitespace
      expect(result).toBe(false);
      expect(setUiValue).not.toHaveBeenCalled();
    });

    it('should reject completely invalid date format', () => {
      const result = DateTimeUtils.handleDateTimeInput('not a date at all', standardCurrentValue, setUiValue, true);
      expect(result).toBe(false);
      expect(setUiValue).not.toHaveBeenCalled();
    });

    it('should reject date with random text appended', () => {
      const result = DateTimeUtils.handleDateTimeInput('31.12.2025 some random text', standardCurrentValue, setUiValue, true);
      expect(result).toBe(false);
      expect(setUiValue).not.toHaveBeenCalled();
    });

    describe('Leap year handling', () => {
      it('should accept February 29 in a leap year', () => {
        const expectedDate = dayjs.utc('2024-02-29T10:30:00Z');
        const result = DateTimeUtils.handleDateTimeInput('02/29/2024 10:30 AM', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'Leap year Feb 29');
      });

      it('should auto-correct February 29 in a non-leap year', () => {
        const result = DateTimeUtils.handleDateTimeInput('02/29/2025 10:30 AM', standardCurrentValue, setUiValue, true);
        expect(result).toBe(true);
        expect(setUiValue).toHaveBeenCalled();
        // Dayjs will auto-correct to March 1
        const updatedValue = setUiValue.mock.calls.at(-1)?.[0];
        const resultDate = dayjs(updatedValue);
        expect(resultDate.month()).toBe(2); // March (0-indexed)
        expect(resultDate.date()).toBe(1);
      });
    });

    describe('Historical and future dates', () => {
      it('should handle very old dates (pre-1900)', () => {
        const expectedDate = dayjs.utc('1876-07-04T12:00:00Z');
        const result = DateTimeUtils.handleDateTimeInput('07/04/1876 12:00 PM', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'Historical date');
      });

      it('should handle far future dates', () => {
        const expectedDate = dayjs.utc('9999-12-31T23:59:00Z');
        const result = DateTimeUtils.handleDateTimeInput('12/31/9999 11:59 PM', standardCurrentValue, setUiValue, true);
        validateDateResult(result, expectedDate, 'Far future date');
      });
    });

    describe('Date overflow/underflow behavior', () => {
      it('should reject overflow month that strict parsing cannot handle', () => {
        // '13/25/2025 10:30 AM' doesn't match any strict format and fails lenient parsing
        const result = DateTimeUtils.handleDateTimeInput('13/25/2025 10:30 AM', standardCurrentValue, setUiValue, true);
        expect(result).toBe(false);
        expect(setUiValue).not.toHaveBeenCalled();
      });

      it('should reject overflow day that strict parsing cannot handle', () => {
        // '06/32/2025 10:30 AM' doesn't match strict formats and fails lenient parsing
        const result = DateTimeUtils.handleDateTimeInput('06/32/2025 10:30 AM', standardCurrentValue, setUiValue, true);
        expect(result).toBe(false);
        expect(setUiValue).not.toHaveBeenCalled();
      });

      it('should reject invalid hour format in strict mode', () => {
        // Format '06/25/2025 25:30' doesn't match any strict format pattern
        const result = DateTimeUtils.handleDateTimeInput('06/25/2025 25:30', standardCurrentValue, setUiValue, true);
        // This will be rejected because it doesn't match strict formats and lenient parsing also fails
        expect(result).toBe(false);
      });

      it('should reject invalid minute format in strict mode', () => {
        // Format '06/25/2025 10:60' doesn't match strict patterns properly
        const result = DateTimeUtils.handleDateTimeInput('06/25/2025 10:60', standardCurrentValue, setUiValue, true);
        // This will be rejected
        expect(result).toBe(false);
      });
    });
  });

  describe('updateTime', () => {
  it('should update time while preserving date', () => {
    const expectedTime = dayjs.utc('2025-06-13T14:30:00Z');
    DateTimeUtils.updateTime('14:30', standardCurrentValue, setUiValue);

    expect(setUiValue).toHaveBeenCalled();
    const updatedValue = setUiValue.mock.calls[setUiValue.mock.calls.length - 1][0];
    const resultDate = dayjs(updatedValue);

    expect(resultDate.isSame(expectedTime, 'second')).toBe(true);
  });

  it('should handle midnight time (00:00)', () => {
    const expectedTime = dayjs.utc('2025-06-13T00:00:00Z');
    DateTimeUtils.updateTime('00:00', standardCurrentValue, setUiValue);

    expect(setUiValue).toHaveBeenCalled();
    const updatedValue = setUiValue.mock.calls[setUiValue.mock.calls.length - 1][0];
    const resultDate = dayjs(updatedValue);

    expect(resultDate.isSame(expectedTime, 'second')).toBe(true);
  });

  it('should handle end of day time (23:59)', () => {
    const expectedTime = dayjs.utc('2025-06-13T23:59:00Z');
    DateTimeUtils.updateTime('23:59', standardCurrentValue, setUiValue);

    expect(setUiValue).toHaveBeenCalled();
    const updatedValue = setUiValue.mock.calls[setUiValue.mock.calls.length - 1][0];
    const resultDate = dayjs(updatedValue);

    expect(resultDate.isSame(expectedTime, 'second')).toBe(true);
  });
});

  describe('updateDate', () => {
    it('should update date while preserving time', () => {
      const newDate = dayjs('2025-12-25');
      const expectedDateTime = dayjs.utc('2025-12-25T10:45:14Z');

      DateTimeUtils.updateDate(newDate, standardCurrentValue, setUiValue);

      expect(setUiValue).toHaveBeenCalled();
      const updatedValue = setUiValue.mock.calls[setUiValue.mock.calls.length - 1][0];
      const resultDate = dayjs(updatedValue);
      expect(resultDate.isSame(expectedDateTime, 'second')).toBe(true);
    });

    it('should set UI value to null when date is null', () => {
      DateTimeUtils.updateDate(null, standardCurrentValue, setUiValue);
      expect(setUiValue).toHaveBeenCalledWith(null);
    });

    it('should not update if date is invalid', () => {
      const invalidDate = dayjs('invalid');
      DateTimeUtils.updateDate(invalidDate, standardCurrentValue, setUiValue);
      expect(setUiValue).not.toHaveBeenCalled();
    });
  });

  describe('updateFormattedValue', () => {
    describe('With useTimePicker = true', () => {
      it('should update only date, preserving existing time', () => {
        const newDate = dayjs('2025-12-25');
        const expectedDateTime = dayjs.utc('2025-12-25T10:45:14Z');

        const result = DateTimeUtils.updateFormattedValue(newDate, null, standardCurrentValue, setUiValue, true);

        expect(setUiValue).toHaveBeenCalled();
        const resultDate = dayjs(result);
        expect(resultDate.isSame(expectedDateTime, 'second')).toBe(true);
      });

      it('should update only time, preserving existing date', () => {
        const newTime = dayjs().hour(18).minute(30).second(0);
        const expectedDateTime = dayjs.utc('2025-06-13T18:30:00Z');

        const result = DateTimeUtils.updateFormattedValue(null, newTime, standardCurrentValue, setUiValue, true);

        expect(setUiValue).toHaveBeenCalled();
        const resultDate = dayjs(result);
        expect(resultDate.isSame(expectedDateTime, 'second')).toBe(true);
      });

      it('should update both date and time', () => {
        const newDate = dayjs('2025-12-25');
        const newTime = dayjs().hour(18).minute(30).second(0);
        const expectedDateTime = dayjs.utc('2025-12-25T18:30:00Z');

        const result = DateTimeUtils.updateFormattedValue(newDate, newTime, standardCurrentValue, setUiValue, true);

        expect(setUiValue).toHaveBeenCalled();
        const resultDate = dayjs(result);
        expect(resultDate.isSame(expectedDateTime, 'second')).toBe(true);
      });

      it('should always set seconds to 0', () => {
        const newTime = dayjs().hour(14).minute(30).second(45); // Note: seconds = 45

        const result = DateTimeUtils.updateFormattedValue(null, newTime, standardCurrentValue, setUiValue, true);

        const resultDate = dayjs(result);
        expect(resultDate.second()).toBe(0);
      });
    });

    describe('With useTimePicker = false', () => {
      it('should set time to 00:00:00 when updating date', () => {
        const newDate = dayjs('2025-12-25');
        const expectedDateTime = dayjs.utc('2025-12-25T00:00:00Z');

        const result = DateTimeUtils.updateFormattedValue(newDate, null, standardCurrentValue, setUiValue, false);

        expect(setUiValue).toHaveBeenCalled();
        const resultDate = dayjs(result);
        expect(resultDate.isSame(expectedDateTime, 'second')).toBe(true);
      });

      it('should ignore time component and set to 00:00:00', () => {
        const newDate = dayjs('2025-12-25');
        const newTime = dayjs().hour(18).minute(30).second(0);
        const expectedDateTime = dayjs.utc('2025-12-25T00:00:00Z');

        const result = DateTimeUtils.updateFormattedValue(newDate, newTime, standardCurrentValue, setUiValue, false);

        expect(setUiValue).toHaveBeenCalled();
        const resultDate = dayjs(result);
        expect(resultDate.isSame(expectedDateTime, 'second')).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('should return null when both date and time are null', () => {
        const result = DateTimeUtils.updateFormattedValue(null, null, standardCurrentValue, setUiValue, true);
        expect(result).toBeNull();
        expect(setUiValue).not.toHaveBeenCalled();
      });

      it('should use today as base date when current UI value is invalid', () => {
        // Create a specific UTC time object
        const specificTime = dayjs().utc().hour(14).minute(30).second(0);

        const result = DateTimeUtils.updateFormattedValue(null, specificTime, 'invalid-date', setUiValue, true);

        expect(setUiValue).toHaveBeenCalled();
        const resultDate = dayjs.utc(result); // Parse result as UTC
        expect(resultDate.isValid()).toBe(true);

        // Check that the time components match what we set
        expect(resultDate.hour()).toBe(14);
        expect(resultDate.minute()).toBe(30);
        expect(resultDate.second()).toBe(0);

        // Verify it used today's date (or close to it)
        const today = dayjs.utc();
        expect(resultDate.year()).toBe(today.year());
        expect(resultDate.month()).toBe(today.month());
        // Date might differ by 1 if test runs at midnight, so check it's within 1 day
        expect(Math.abs(resultDate.date() - today.date())).toBeLessThanOrEqual(1);
      });

      it('should handle timezone differences correctly', () => {
        const nycDate = dayjs.tz('2025-06-25T14:30:00', 'America/New_York');

        const result = DateTimeUtils.updateFormattedValue(nycDate, null, standardCurrentValue, setUiValue, true);

        const resultDate = dayjs(result);
        expect(resultDate.isValid()).toBe(true);
        expect(resultDate.year()).toBe(2025);
        expect(resultDate.month()).toBe(5); // June (0-indexed)
        expect(resultDate.date()).toBe(25);
      });
    });
  });

  describe('getDateTimeValue', () => {
    it('should convert valid ISO string to dayjs UTC object', () => {
      const isoString = '2025-06-25T14:30:00Z';
      const result = DateTimeUtils.getDateTimeValue(isoString);

      expect(result.isValid()).toBe(true);
      expect(result.format()).toBe(dayjs.utc(isoString).format());
    });

    it('should return invalid dayjs object for empty string', () => {
      const result = DateTimeUtils.getDateTimeValue('');
      expect(result.isValid()).toBe(false);
    });

    it('should return invalid dayjs object for invalid string', () => {
      const result = DateTimeUtils.getDateTimeValue('not a date');
      expect(result.isValid()).toBe(false);
    });

    it('should handle ISO string without timezone indicator', () => {
      const isoString = '2025-06-25T14:30:00';
      const result = DateTimeUtils.getDateTimeValue(isoString);

      expect(result.isValid()).toBe(true);
    });
  });

  describe('formatDateTime', () => {
    it('should format dayjs object using localized format', () => {
      DateTimeUtils.initializeDayjs('en');
      const date = dayjs('2025-12-31T14:30:00');
      const formatted = DateTimeUtils.formatDateTime(date);

      expect(formatted).toContain('12/31/2025');
      expect(formatted).toContain('2:30');
    });

    it('should format Date object using localized format', () => {
      DateTimeUtils.initializeDayjs('en');
      const date = new Date('2025-12-31T14:30:00Z');
      const formatted = DateTimeUtils.formatDateTime(date);

      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('');
    });

    it('should return empty string for null input', () => {
      const formatted = DateTimeUtils.formatDateTime(null);
      expect(formatted).toBe('');
    });

    it('should use German format when locale is de', () => {
      DateTimeUtils.initializeDayjs('de');
      const date = dayjs('2025-12-31T14:30:00');
      const formatted = DateTimeUtils.formatDateTime(date);

      expect(formatted).toContain('31.12.2025');
    });
  });

  describe('generateTimePickerOptions', () => {
    it('should return predefined options when dateTimeValue is null', () => {
      const options = DateTimeUtils.generateTimePickerOptions(null);

      expect(options.length).toBe(6);
      expect(options[0].label).toBe('00:00 AM');
      expect(options[options.length - 1].label).toBe('06:00 PM');
    });

    it('should return predefined options when dateTimeValue is invalid', () => {
      const invalidDate = dayjs('invalid');
      const options = DateTimeUtils.generateTimePickerOptions(invalidDate);

      expect(options.length).toBe(6);
    });

    it('should include user time if not in predefined options', () => {
      const userTime = dayjs.utc().hour(15).minute(45);
      const options = DateTimeUtils.generateTimePickerOptions(userTime);

      expect(options.length).toBe(7); // 6 predefined + 1 user time
      expect(options.some(opt => opt.value.hour() === 15 && opt.value.minute() === 45)).toBe(true);
    });

    it('should not duplicate user time if already in predefined options', () => {
      const userTime = dayjs.utc().hour(6).minute(0); // Matches predefined '06:00 AM'
      const options = DateTimeUtils.generateTimePickerOptions(userTime);

      expect(options.length).toBe(6); // Should not add duplicate
    });

    it('should sort options chronologically', () => {
      const userTime = dayjs.utc().hour(9).minute(30); // Between 08:00 and 10:00
      const options = DateTimeUtils.generateTimePickerOptions(userTime);

      for (let i = 0; i < options.length - 1; i++) {
        expect(options[i].value.valueOf()).toBeLessThan(options[i + 1].value.valueOf());
      }
    });
  });

  describe('Cross-locale format compatibility', () => {
    const testCases = [
      { locale: 'en', date: '12/31/2025', time: '11:59 PM', expectedISO: '2025-12-31T23:59:00' },
      { locale: 'de', date: '31.12.2025', time: '23:59', expectedISO: '2025-12-31T23:59:00' },
      { locale: 'en-gb', date: '31/12/2025', time: '23:59', expectedISO: '2025-12-31T23:59:00' },
      { locale: 'fr', date: '31/12/2025', time: '23:59', expectedISO: '2025-12-31T23:59:00' },
    ];

    testCases.forEach(({ locale, date, time, expectedISO }) => {
      it(`should handle ${locale} locale format: ${date} ${time}`, () => {
        DateTimeUtils.initializeDayjs(locale);

        const input = `${date} ${time}`;
        const expectedDate = dayjs.utc(expectedISO + 'Z');
        const result = DateTimeUtils.handleDateTimeInput(input, standardCurrentValue, setUiValue, true);

        validateDateResult(result, expectedDate, `Locale: ${locale}`);
      });
    });
  });
});