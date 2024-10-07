/**
 * Picker features of a single item.
 */
export interface PickerFeaturesItem {
  /** Item level: provide the edit button */
  edit: boolean;
  /** Item level: provide the remove button */
  remove: boolean;
  /** Item level: provide the delete button */
  delete: boolean;
}

/**
 * Picker Features allow a source, state or control to determine what features are available for a picker.
 *
 * The idea is that by default, these things should be truish, and then the source, state or control can
 * declare that it's not allowed.
 *
 * In the end the features should be merged into one object, and the picker should be able to determine
 * what buttons etc. to show.
 */
export interface PickerFeatures extends PickerFeaturesItem {
  /** Control level: provide the create button */
  create: boolean;
  /** Control level: provide the text entry */
  textEntry: boolean;
  /** Control level: provide the multi-value picker */
  multiValue: boolean;
}

export interface PickerFeaturesForControl extends PickerFeatures {
  /**
   * Determines if the control should also show the "Go to List" button.
   * This depends on multi-select and in future also on the sortability of the list.
   */
  showGoToListDialogButton: boolean;

  /**
   * Determines if the control should also show the "Add New" button.
   * This depends on the setting to create new items + the availability of the create-names.
   */
  showAddNewButton: boolean;
}

function fill(data: Partial<PickerFeatures>, fallback: boolean): PickerFeatures {
  return {
    create: data.create ?? fallback,
    textEntry: data.textEntry ?? fallback,
    multiValue: data.multiValue ?? fallback,

    edit: data.edit ?? fallback,
    remove: data.remove ?? fallback,
    delete: data.delete ?? fallback,
  };
}

export function mergePickerFeatures(first: Partial<PickerFeatures>, second: Partial<PickerFeatures>): PickerFeatures {
  first = fill(first, true);
  second = fill(second, true);
  return {
    create: first.create && second.create,
    textEntry: first.textEntry && second.textEntry,
    multiValue: first.multiValue && second.multiValue,

    edit: first.edit && second.edit,
    remove: first.remove && second.remove,
    delete: first.delete && second.delete,
  };
}