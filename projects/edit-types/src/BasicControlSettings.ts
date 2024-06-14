import { FieldSettings } from './FieldSettings';

/**
 * Goal of this is to provide the basic settings for a control
 * in the BaseFieldComponent<T = FieldValue>
 * to replace all the many subscriptions etc.
 * with a simple signal containing the important settings.
 */
export class BasicControlSettings
{
  label: string;
  placeholder: string;
  required: boolean;

  labelWithRequired: string;

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