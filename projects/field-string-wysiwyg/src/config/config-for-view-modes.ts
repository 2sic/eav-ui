import * as DialogModes from '../constants/display-modes';
import * as EditModes from '../constants/edit-modes';


export type ConfigForDisplayModes<TData> = Record<DialogModes.DisplayModes, TData>;
export type ConfigForDisplayModesRaw<TData> = Partial<Record<DialogModes.DisplayModes | 'all', Partial<TData>>>;

export type ConfigForEditModes<TData> = Record<EditModes.WysiwygEditMode, TData>;
export type ConfigForDisplayEditModes<TData> = ConfigForDisplayModes<ConfigForEditModes<TData>>;

export type ConfigForViewModeVariations<TData> = TData | ConfigForDisplayModesRaw<TData>;


// TODO: this is not well designed yet, as the final form isn't decided
// Still WIP 2023-01-23 2dm

export function toConfigForViewModes<TData>(
  original: ConfigForViewModeVariations<TData>,
  // defaults: TData,
  expander?: (data: TData, nodeName: DialogModes.DisplayModes) => TData
): ConfigForDisplayModes<TData> {

  // Case 1 & 2: null, undefined or array
  if (original == null || Array.isArray(original))
    return build(expander, original as TData, original as TData);

  const maybeRealConfig = original as ConfigForDisplayModesRaw<TData>;
  const all = maybeRealConfig.all;
  const inline = maybeRealConfig.inline;
  const dialog = maybeRealConfig.dialog;

  // Case 3: Whatever it is, it doesn't have the expected sub-properties
  // so it must itself be the config
  if (all === undefined && inline === undefined && dialog === undefined)
    return build(expander, original as TData, original as TData);

  // Case 4: It has some of the expected sub-properties
  return build(expander, (all ?? inline) as TData, (all ?? dialog) as TData);

}


function build<TData>(expander: ((data: TData, nodeName: DialogModes.DisplayModes) => TData) | undefined,
  newInline: TData,
  newDialog: TData
): ConfigForDisplayModes<TData> {
  // if (defaults != null) {
  //   inline = { ...defaults, ...inline };
  //   dialog = { ...defaults, ...dialog };
  // }
  return {
    inline: expander == null ? newInline : expander(newInline, 'inline'),
    dialog: expander == null ? newDialog : expander(newDialog, 'dialog')
  };
}
