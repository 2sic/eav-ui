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

  /** Real final visibility. Also respects if it was disabled by the ItemFieldVisibility. */
  visible: boolean;

  // /** Original visibility, more as info. ATM not used any where. */
  // visibilityRaw: boolean;

  // /** Information if this field was forcibly disabled */
  // visibilityDisabled: boolean;

  /** If the field is collapsed */
  collapsed: boolean;


  static fromSettings(s: FieldSettings): BasicControlSettings {
    const label = s?.Name ?? 'loading...';
    const notes = s?.Notes ?? '';
    const required = s?._currentRequired ?? true;
    const visibilityRaw = s?.Visible ?? true;
    const visibilityDisabled = s?.VisibleDisabled ?? false;
    const visible = visibilityRaw && !visibilityDisabled;
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
      // visibilityRaw,
      // visibilityDisabled,
      collapsed,
    };
  }
}
