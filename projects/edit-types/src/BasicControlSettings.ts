import { FieldSettings } from './FieldSettings';

/**
 * Goal of this is to provide the basic settings for a control
 * in the BaseFieldComponent<T = FieldValue>
 * to replace all the many subscriptions etc.
 * with a simple signal containing the important settings.
 */
export class BasicControlSettings
{
  /** Label to show on an input field */
  label: string;

  /** Label with a * if required */
  labelWithRequired: string;

  /** Placeholder to show on an input field */
  placeholder: string;

  /** If the field is required */
  required: boolean;

  static fromSettings(s: FieldSettings): BasicControlSettings {
    const label = s?.Name ?? 'loading...';
    const required = s?._currentRequired ?? false;
    return {
      label,
      placeholder: s?.Placeholder ?? 'loading...',
      required,
      labelWithRequired: label + (required ? ' *' : ''),
    };
  }
}