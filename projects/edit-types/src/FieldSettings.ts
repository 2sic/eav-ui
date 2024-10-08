import { Of } from '../../core';
import { FeatureNames } from '../../eav-ui/src/app/features/feature-names';

/** Internal settings which are calculated based off of other aspects */
interface InternalSettings {
  /** Ui is disabled for translation reasons - detected at runtime */
  uiDisabledInThisLanguage?: boolean;

  /**
   * This is set by calculations and does not come from the back end.
   * Reasons typically:
   * - Form is read-only
   * - Field is disabled because of translation
   * - Slot is empty (eg. not activate presentation)
   */
  uiDisabledForced: boolean;

  /** This is the combined calculation of forced disabled and configured disabled */
  uiDisabled: boolean;

  /**
   * The value is currently required.
   * This is calculated at runtime, often based on visibility etc.
   */
  valueRequired?: boolean;

  /**
   * List of features required by this field.
   * Mainly for license warnings.
   * @internal - don't show in any docs
   */
  requiredFeatures: Of<typeof FeatureNames>[];

  /**
   * New marker to prevent auto-focus on dropdowns if they are the first field.
   * It's often null/undefined, but must be true if we want to prevent an auto-focus.
   */
  noAutoFocus?: boolean;
}

/**
 * @All - Configuration fields which every input field has.
 */
interface All {
  /**
   * Used as a label
   */
  Name: string;
  /** The input type such as 'string-default' or 'string-picker' */
  InputType: string;

  /** The default value to use if there is nothing in the field yet / new */
  DefaultValue: string;

  /** Placeholder message in the input box */
  Placeholder: string;

  /** Notes / help - usually underneath the field input */
  Notes: string;

  /** If the field is visible */
  Visible: boolean;

  /**
   * Information if this field was forcibly disabled.
   * TODO: explain why this would be the case.
   * new v16.01
   */
  VisibleDisabled: boolean;

  /** Required according to configuration */
  Required: boolean;

  /** Disabled according to configuration */
  Disabled: boolean;

  /** Translation is not allowed - eg. on fields which should never have a different value in another language. */
  DisableTranslation: boolean;

  /** Disable Auto-Translation - eg. because it would not make sense. */
  DisableAutoTranslation: boolean;
  ValidationRegExJavaScript: string;

  /** IDs of formulas */
  Formulas: string[];

  CustomJavaScript: string;

  /** Determines if this field really exists or not */
  IsEphemeral: boolean;
}

/**
 * The Field Settings which every field has, containing `@All` and `@InternalSettings`.
 */
export interface FieldSettings extends 
  All,
  InternalSettings { }
