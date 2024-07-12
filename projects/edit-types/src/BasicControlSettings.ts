import { FieldSettings } from './FieldSettings';

/**
 * Goal of this is to provide the basic settings for a control
 * in the BaseFieldComponent<T = FieldValue>
 * to replace all the many subscriptions etc.
 * with a simple signal containing the important settings.
 */
export class BasicControlSettings {
  /** Label to show on an input field */
  label: string;

  /** Notes to show below an input field */
  notes: string;

  /** Label with a * if required */
  labelWithRequired: string;

  /** Placeholder to show on an input field */
  placeholder: string;

  /** If the field is required */
  required: boolean;

  visible: boolean;

  visibleDisabled: boolean;

  visibleAndEnabled: boolean;

  collapsed: boolean;


  static fromSettings(s: FieldSettings): BasicControlSettings {
    const label = s?.Name ?? 'loading...';
    const notes = s?.Notes ?? '';
    const required = s?._currentRequired ?? true;
    const visible = s?.Visible ?? true;
    const visibleDisabled = s?.VisibleDisabled ?? false;
    const visibleAndEnabled = visible && !visibleDisabled;
    const collapsed = s?.Collapsed ?? false;
    // if (label == 'loading...') {
    //   console.log('s', s);
    // }
    return {
      label,
      notes,
      placeholder: s?.Placeholder ?? 'loading...',
      required,
      labelWithRequired: label + (required ? ' *' : ''),
      visible,
      visibleDisabled,
      visibleAndEnabled,
      collapsed,
    };
  }
}
