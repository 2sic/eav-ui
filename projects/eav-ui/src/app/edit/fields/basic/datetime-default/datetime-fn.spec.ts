import dayjs from 'dayjs';
import { formatDateTimeFn, initializeDayjs, updateFormattedValueFn } from './datetime-fn';

describe('DateTime Functions', () => {
  beforeEach(() => {
    // Initialisiere dayjs für Tests
    initializeDayjs('en');
  });

  describe('formatDateTimeFn', () => {
    it('should return empty string for null date', () => {
      expect(formatDateTimeFn(null)).toBe('');
    });

    it('should format date correctly', () => {
      const testDate = dayjs('2025-06-13T09:30:32Z');
      const formatted = formatDateTimeFn(testDate);
      expect(formatted.length).toBeGreaterThan(0);
      // Je nach Lokalisierung wird das genaue Format unterschiedlich sein
    });
  });

  describe('updateFormattedValueFn', () => {
    it('should return null when no date and time are provided', () => {
      const setUiValue = jasmine.createSpy('setUiValue');
      const result = updateFormattedValueFn(null, null, '', setUiValue);
      expect(result).toBeNull();
      expect(setUiValue).not.toHaveBeenCalled();
    });

    it('should update date parts correctly', () => {
      const setUiValue = jasmine.createSpy('setUiValue');
      const testDate = dayjs('2025-06-13');
      const currentValue = '2025-01-01T12:00:00Z';
      
      updateFormattedValueFn(testDate, null, currentValue, setUiValue);
      
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2025-06-13');
      expect(result).toContain('12:00:00');
    });

    it('should update time parts correctly', () => {
      const setUiValue = jasmine.createSpy('setUiValue');
      const testTime = dayjs().hour(15).minute(45);
      const currentValue = '2025-06-13T12:00:00Z';
      
      updateFormattedValueFn(null, testTime, currentValue, setUiValue);
      
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2025-06-13');
      expect(result).toContain('15:45:00');
    });

    it('should set time to 00:00:00 when useTimePicker is false', () => {
      const setUiValue = jasmine.createSpy('setUiValue');
      const testDate = dayjs('2025-06-13T15:45:00Z');
      
      updateFormattedValueFn(testDate, testDate, '', setUiValue, false);
      
      expect(setUiValue).toHaveBeenCalled();
      const result = setUiValue.calls.first().args[0];
      expect(result).toContain('2025-06-13');
      expect(result).toContain('00:00:00');
    });
  });

  // Weitere Tests für andere Funktionen...
});