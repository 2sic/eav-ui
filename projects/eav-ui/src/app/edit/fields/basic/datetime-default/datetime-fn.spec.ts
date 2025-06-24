import dayjs from 'dayjs';
import {
  DateTimeUtils
} from './datetime-fn';

describe('DateTime Functions', () => {
  // Common variables used across multiple test suites
  let setUiValue: jasmine.Spy;
  let testDate: dayjs.Dayjs;
  let standardCurrentValue: string;

  beforeEach(() => {
    // Initialize dayjs with english locale
    DateTimeUtils.initializeDayjs('en');

    // Setup common spy and values used in multiple test suites
    setUiValue = jasmine.createSpy('setUiValue');
    testDate = dayjs('2025-06-13T10:45:14Z');
    standardCurrentValue = '2025-06-13T10:45:14Z';
  });

  describe('formatDateTime', () => {
    it('should return empty string for null date', () => {
      expect(DateTimeUtils.formatDateTime(null)).toBe('');
    });

    it('should format date correctly', () => {
      const formatted = DateTimeUtils.formatDateTime(testDate);
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('updateDateFn', () => {
    // Variables specific to updateDateFn tests
    let invalidDate: dayjs.Dayjs;
    let christmasDate: dayjs.Dayjs;
    let currentValueWithMilliseconds: string;
    let currentValueWithPreciseTime: string;

    beforeEach(() => {
      // Initialize test date values specific to updateDateFn
      christmasDate = dayjs('2025-12-25');
      invalidDate = dayjs('not-a-date');

      // Initialize current UI value strings with specific times
      currentValueWithMilliseconds = '2023-03-15T08:30:45.789Z';
      currentValueWithPreciseTime = '2023-03-15T14:27:36.123Z';
    });

    it('should set UI value to null if date is null', () => {
      DateTimeUtils.updateDate(null, standardCurrentValue, setUiValue);
      expect(setUiValue).toHaveBeenCalledWith(null);
    });

    it('should not call setUiValue if date is invalid', () => {
      DateTimeUtils.updateDate(invalidDate, standardCurrentValue, setUiValue);
      expect(setUiValue).not.toHaveBeenCalled();
    });

    it('should update only the date part and preserve time', () => {
      DateTimeUtils.updateDate(christmasDate, currentValueWithPreciseTime, setUiValue);
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toEqual('2025-12-25T14:27:36.123Z');
    });

    it('should handle empty currentUiValue by using default time', () => {
      DateTimeUtils.updateDate(christmasDate, '', setUiValue);
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2025-12-25');
    });

    it('should handle invalid currentUiValue gracefully', () => {
      DateTimeUtils.updateDate(christmasDate, 'not-a-date', setUiValue);
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2025-12-25');
    });

    it('should preserve milliseconds if present in currentUiValue', () => {
      DateTimeUtils.updateDate(christmasDate, currentValueWithMilliseconds, setUiValue);
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toEqual('2025-12-25T08:30:45.789Z');
    });

    it('should not call setUiValue if date is undefined', () => {
      DateTimeUtils.updateDate(undefined as any, standardCurrentValue, setUiValue);
      expect(setUiValue).toHaveBeenCalledWith(null);
    });
  });

  describe('DateTimeUtils.updateFormattedValue', () => {
    // Variables specific to DateTimeUtils.updateFormattedValue tests
    let testTime: dayjs.Dayjs;
    let currentValueWithMilliseconds: string;

    beforeEach(() => {
      // Common test values specific to DateTimeUtils.updateFormattedValue
      testTime = dayjs().hour(15).minute(45).second(0);
      currentValueWithMilliseconds = '2025-01-01T12:45:11.123Z';
    });

    it('should return null when no date and time are provided', () => {
      const result = DateTimeUtils.updateFormattedValue(null, null, '', setUiValue);
      expect(result).toBeNull();
      expect(setUiValue).not.toHaveBeenCalled();
    });

    it('should update date parts correctly', () => {
      DateTimeUtils.updateFormattedValue(testDate, null, standardCurrentValue, setUiValue);

      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toEqual('2025-06-13T10:45:14.000Z');
    });

    it('should update time parts correctly', () => {
      const timeTestCurrentValue = '2025-06-13T12:37:43Z';

      DateTimeUtils.updateFormattedValue(null, testTime, timeTestCurrentValue, setUiValue);

      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toEqual('2025-06-13T15:45:00.000Z');
    });

    it('should set time to 00:00:00 when useTimePicker is false', () => {
      DateTimeUtils.updateFormattedValue(testDate, testDate, '', setUiValue, false);

      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2025-06-13');
      expect(result).toContain('00:00:00');
    });

    it('should handle invalid currentUiValue gracefully', () => {
      const futureTestDate = dayjs('2026-01-01');
      const invalidCurrentValue = 'not-a-date';

      DateTimeUtils.updateFormattedValue(futureTestDate, null, invalidCurrentValue, setUiValue);

      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2026-01-01');
    });

    it('should preserve milliseconds from currentUiValue if time is not updated', () => {
      DateTimeUtils.updateFormattedValue(testDate, null, currentValueWithMilliseconds, setUiValue);

      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('.123Z');
    });
  });
});