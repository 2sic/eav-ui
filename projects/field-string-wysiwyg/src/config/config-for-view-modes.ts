import { WysiwygDisplayMode, WysiwygEditMode } from './tinymce-helper-types';

export type ConfigForDisplayModes<TData> = Record<WysiwygDisplayMode, TData>;
export type ConfigForDisplayModesRaw<TData> = Partial<Record<WysiwygDisplayMode | 'all', Partial<TData>>>;

export type ConfigForEditModes<TData> = Record<WysiwygEditMode, TData>;
export type ConfigForDisplayEditModes<TData> = ConfigForDisplayModes<ConfigForEditModes<TData>>;

export type ConfigForViewModeVariations<TData> = TData | ConfigForDisplayModesRaw<TData>;


// TODO: this is not well designed yet, as the final form isn't decided
// Still WIP 2023-01-23 2dm

export function toConfigForViewModes<TData>(
  original: ConfigForViewModeVariations<TData>,
  // defaults: TData,
  expander?: (data: TData, nodeName: WysiwygDisplayMode) => TData
): ConfigForDisplayModes<TData> {

  function build(inline: TData, dialog: TData): ConfigForDisplayModes<TData> {
    // if (defaults != null) {
    //   inline = { ...defaults, ...inline };
    //   dialog = { ...defaults, ...dialog };
    // }
    return {
      inline: expander == null ? inline : expander(inline, 'inline'),
      dialog: expander == null ? dialog : expander(dialog, 'dialog')
    };
  }

  // Case 1 & 2: null, undefined or array
  if (original == null || Array.isArray(original)) 
    return build(original as TData, original as TData);

  const maybeRealConfig = original as ConfigForDisplayModesRaw<TData>;
  const all = maybeRealConfig.all;
  const inline = maybeRealConfig.inline;
  const dialog = maybeRealConfig.dialog;

  // Case 3: Whatever it is, it doesn't have the expected sub-properties
  // so it must itself be the config
  if (all == undefined && inline == undefined && dialog == undefined)
    return build(original as TData, original as TData);




  if (original as ConfigForDisplayModesRaw<TData> == null) return {
    inline: original as TData,
    dialog: original as TData
  };
}