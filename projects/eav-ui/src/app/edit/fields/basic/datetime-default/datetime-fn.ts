import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

/**
 * Initializes and configures dayjs with UTC and localization
 * Should be called once at application startup
 * 
 * @param locale - The locale string (e.g., 'en', 'de', 'fr') to configure dayjs
 */
export function initializeDayjsFn(locale: string): void {
  dayjs.extend(utc);
  dayjs.extend(customParseFormat);
  dayjs.locale(locale);
}

/**
 * Creates a Dayjs object from a UI value string
 * 
 * @param uiValue - ISO string representation of date/time
 * @returns A Dayjs object in UTC timezone
 */
export function getDateTimeValueFn(uiValue: string): Dayjs {
  return dayjs.utc(uiValue);
}

/**
 * Generates options for the time picker dropdown
 * Includes predefined times plus the user's current selection if not already in the list
 * 
 * @param dateTimeValue - The current date/time value
 * @returns Array of time options with labels and values, sorted chronologically
 */
export function generateTimePickerOptionsFn(dateTimeValue: Dayjs | null): { label: string; value: Dayjs }[] {
  const template = dayjs().utc().hour(0).minute(0).second(0);

  // Create predefined time options (common times throughout the day)
  const predefinedOptions = [
    { label: '00:00 AM', value: template.hour(0) },
    { label: '06:00 AM', value: template.hour(6) },
    { label: '08:00 AM', value: template.hour(8) },
    { label: '10:00 AM', value: template.hour(10) },
    { label: '12:00 PM', value: template.hour(12) },
    { label: '06:00 PM', value: template.hour(18) },
  ];

  // If dateTimeValue is null or invalid, return only predefined options
  if (!dateTimeValue || !dateTimeValue.isValid()) {
    return predefinedOptions;
  }

  let userOption = {
    label: dateTimeValue.format('HH:mm A'),
    value: dayjs()
      .utc()
      .hour(dateTimeValue.hour())
      .minute(dateTimeValue.minute())
      .second(0),
  };

  // If the user's current time is already in predefined options, just return those
  if (predefinedOptions.some(
    (option) =>
      option.value.hour() === userOption.value.hour() &&
      option.value.minute() === userOption.value.minute()
  )) return predefinedOptions;

  // Otherwise, add user's time to the options and sort chronologically
  const allOptions = [...predefinedOptions, userOption];
  allOptions.sort((a, b) => a.value.valueOf() - b.value.valueOf());

  return allOptions;
}

// Additional help function for standard options
export function generateDefaultTimePickerOptions(): { label: string; value: Dayjs }[] {
  const template = dayjs().utc().hour(0).minute(0).second(0);

  return [
    { label: '00:00 AM', value: template.hour(0) },
    { label: '06:00 AM', value: template.hour(6) },
    { label: '08:00 AM', value: template.hour(8) },
    { label: '10:00 AM', value: template.hour(10) },
    { label: '12:00 PM', value: template.hour(12) },
    { label: '06:00 PM', value: template.hour(18) },
  ];
}

/**
 * Formats a date and time for display in the UI
 * Uses localized date (L) and time (LT) formats
 * 
 * @param date - The date to format
 * @returns Formatted date string or empty string if date is null
 */
export function formatDateTimeFn(date: dayjs.Dayjs | Date | null): string {
  if (!date) return '';
  return dayjs(date).format('L LT');
}

/**
 * Get the current locale's date format
 * 
 * @returns The localized date format string (e.g., 'DD.MM.YYYY', 'MM/DD/YYYY')
 */
export function getLocaleDateFormatFn(): string {
  try {
    const localized = dayjs().localeData().longDateFormat('L');
    if (localized && typeof localized === 'string') {
      return localized;
    }
  } catch (e) {
    // keep fallback
  }
  return 'YYYY-MM-DD';
}

/**
 * Handles user input in the date-time field
 * Attempts to parse the input with multiple localized formats
 * 
 * @param value - The string value entered by the user
 * @param currentUiValue - The current UI value
 * @param setUiValue - Callback function to update the UI value
 * @param useTimePicker - Whether time picker is enabled
 * @returns Boolean indicating if the input was valid and processed
 */
export function handleDateTimeInputFn(
  value: string,
  currentUiValue: string,
  setUiValue: (value: string | null) => void,
  useTimePicker: boolean = true
): boolean {
  if (!value) {
    setUiValue(null);
    return true;
  }

  const dateFormat = getLocaleDateFormatFn();
  let parsedDate: Dayjs | null = null;

  // Try multiple parsing formats in order of specificity
  const formats = [
    'YYYY-MM-DD',     // ISO date - PRIORITIZED
    'YYYY-MM-DD HH:mm: ss', // ISO datetime with seconds - PRIORITIZED
    'YYYY-MM-DD HH:mm',    // ISO datetime without seconds - PRIORITIZED
    'YYYY/MM/DD',     // Alternative slash format
    'YYYY/MM/DD HH: mm:ss',
    'YYYY/MM/DD HH: mm',
    'L LT',           // Localized date + time (e.g., "31. 12.2025 14:30")
    'L LTS',          // Localized date + time with seconds (e.g., "31.12.2025 14:30:45")
    'L',              // Localized date only (e.g., "31.12.2025")
    dateFormat,       // Raw locale format (e.g., "DD.MM.YYYY")
    `${dateFormat} HH:mm:ss`, // Raw locale format + time with seconds
    `${dateFormat} HH:mm`,    // Raw locale format + time without seconds
  ];

  for (const format of formats) {
    parsedDate = dayjs(value, format, true); // strict parsing
    if (parsedDate.isValid()) {
      break;
    }
  }

  // If all strict parsing fails, try lenient parsing
  if (!parsedDate || !parsedDate.isValid()) {
    parsedDate = dayjs(value);
  }

  if (parsedDate && parsedDate.isValid()) {
    updateFormattedValueFn(parsedDate, parsedDate, currentUiValue, setUiValue, useTimePicker);
    return true;
  }

  return false; // Invalid format
}

/**
 * Updates the time component based on time picker input
 * 
 * @param timeValue - The time string in HH:mm format
 * @param currentUiValue - The current UI value
 * @param setUiValue - Callback function to update the UI value
 */
export function updateTimeFn(
  timeValue: string,
  currentUiValue: string,
  setUiValue: (value: string | null) => void
): void {
  const time = dayjs(timeValue, 'HH:mm');

  if (time == null) {
    setUiValue(null);
    return;
  }

  if (time.isValid()) {
    updateFormattedValueFn(null, time, currentUiValue, setUiValue);
  }
}

/**
 * Material Date Picker Event Handler
 * Updates the date component while preserving the existing time
 * 
 * @param date - The selected date from the date picker
 * @param currentUiValue - The current UI value
 * @param setUiValue - Callback function to update the UI value
 */
export function updateDateFn(
  date: Dayjs | null,
  currentUiValue: string,
  setUiValue: (value: string | null) => void
): void {
  if (date == null) {
    setUiValue(null);
    return;
  }

  if (date.isValid()) {
    updateFormattedValueFn(date, null, currentUiValue, setUiValue);
  }
}

/**
 * Combines date and time values and updates the UI
 * Core function that merges date and time components while preserving 
 * other components from the current value
 * 
 * @param date - The date component to update (or null to keep current)
 * @param time - The time component to update (or null to keep current)
 * @param currentUiValue - The current UI value
 * @param setUiValue - Callback function to update the UI value
 * @param useTimePicker - Whether time picking is enabled (if false, time is set to 00:00:00)
 * @returns The updated ISO string or null if no updates were made
 */
export function updateFormattedValueFn(
  date: Dayjs | null,
  time: Dayjs | null,
  currentUiValue: string,
  setUiValue: (value: string | null) => void,
  useTimePicker: boolean = true
): string | null {
  if (!date && !time)
    return null;

  // Initialize with current date/time from UI or with default values
  let currentDateTime = dayjs(currentUiValue).isValid()
    ? dayjs(currentUiValue).utc()
    : dayjs().utc().hour(0).minute(0).second(0);

  // Update date components if a date is provided
  if (date) {
    currentDateTime = currentDateTime
      .year(date.year())
      .month(date.month())
      .date(date.date());
  }

  // Update time components if a time is provided
  if (time) {
    currentDateTime = currentDateTime
      .hour(time.hour())
      .minute(time.minute())
      .second(0); // Explicitly set seconds to 0
  }

  // Set time to 00:00:00 if time picker is disabled
  const resultDateTime = !useTimePicker
    ? currentDateTime.utc().hour(0).minute(0).second(0).toISOString()
    : currentDateTime.toISOString();

  setUiValue(resultDateTime);
  return resultDateTime;
}

export class DateTimeUtils {
  static initializeDayjs = initializeDayjsFn;
  static updateFormattedValue = updateFormattedValueFn;
  static updateDate = updateDateFn;
  static updateTime = updateTimeFn;
  static handleDateTimeInput = handleDateTimeInputFn;
  static formatDateTime = formatDateTimeFn;
  static generateTimePickerOptions = generateTimePickerOptionsFn;
  static getDateTimeValue = getDateTimeValueFn;
  static getLocaleDateFormat = getLocaleDateFormatFn;
}