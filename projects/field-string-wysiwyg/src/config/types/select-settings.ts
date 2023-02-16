import { WysiwygButtons, WysiwygFeatures } from '.';
import * as DialogModes from '../../constants/display-modes';
import * as EditModes from '../../constants/edit-modes';

export interface SelectSettings {
  /** The mode like 'default', 'text', etc. */
  editMode: EditModes.WysiwygEditMode;
  /** inline / dialog */
  displayMode: DialogModes.DisplayModes;
  /** What buttons are enabled by configuration */
  buttons: WysiwygButtons;
  /** which features are currently enabled */
  features: WysiwygFeatures;
}

