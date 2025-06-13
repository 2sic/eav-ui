import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

/**
 * Initializes and configures dayjs with UTC and localization
 * Should be called once at application startup
 * 
 * @param locale - The locale string (e.g., 'en', 'de', 'fr') to configure dayjs
 */
export function initializeDayjs(locale: string): void {
    dayjs.extend(utc);
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
export function generateTimePickerOptionsFn(dateTimeValue: Dayjs): { label: string; value: Dayjs }[] {
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

    // Create an option for the user's current selection
    const userOption = {
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
 * Handles user input in the date-time field
 * Attempts to parse the input with the localized format
 * 
 * @param value - The string value entered by the user
 * @param currentUiValue - The current UI value
 * @param setUiValue - Callback function to update the UI value
 * @returns Boolean indicating if the input was valid and processed
 */
export function handleDateTimeInputFn(
    value: string,
    currentUiValue: string,
    setUiValue: (value: string | null) => void
): boolean {
    if (!value) {
        setUiValue(null);
        return true;
    }

    // Try to parse with localized format
    let parsedDate = dayjs(value, 'L LT');
    if (parsedDate.isValid()) {
        updateFormattedValueFn(parsedDate, parsedDate, currentUiValue, setUiValue);
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
    if (!date && !time) return null;

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