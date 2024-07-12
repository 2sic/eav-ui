/**
 * Picker Features allow a source, state or control to determine what features are available for a picker.
 * 
 * The idea is that by default, these things should be truish, and then the source, state or control can
 * declare that it's not allowed. 
 * 
 * In the end the features should be merged into one object, and the picker should be able to determine
 * what buttons etc. to show.
 */
export class PickerFeatures {
  // addNew: boolean = true;
  edit: boolean = true;
  create: boolean = true;
  delete: boolean = true;
  textEntry: boolean = true;
  multiValue: boolean = true;

  static merge(first: Partial<PickerFeatures>, second: Partial<PickerFeatures>): PickerFeatures {
    first = PickerFeatures.fill(first, true);
    second = PickerFeatures.fill(second, true);
    return {
      // addNew: first.addNew && second.addNew,
      edit: first.edit && second.edit,
      create: first.create && second.create,
      delete: first.delete && second.delete,
      textEntry: first.textEntry && second.textEntry,
      multiValue: first.multiValue && second.multiValue,
    };
  }

  static fill(data: Partial<PickerFeatures>, fallback: boolean): PickerFeatures {
    return {
      // addNew: data.addNew ?? fallback,
      edit: data.edit ?? fallback,
      create: data.create ?? fallback,
      delete: data.delete ?? fallback,
      textEntry: data.textEntry ?? fallback,
      multiValue: data.multiValue ?? fallback,
    };
  }
  // constructor(init?: Partial<PickerFeatures>) {
  //   this.addNew = (init?.addNew ?? true) && this.addNew;
  //   this.edit = (init?.edit ?? true) && this.edit;
  //   this.create = (init?.create ?? true) && this.create;
  //   this.delete = (init?.delete ?? true) && this.delete;
  //   this.textEntry = (init?.textEntry ?? true) && this.textEntry;
  //   this.multiValue = (init?.multiValue ?? true) && this.multiValue;
  // }


  // static allowAll(): PickerFeatures {
  //   return new PickerFeatures();
  // }

  // static denyAll(): PickerFeatures {
  //   return new PickerFeatures({
  //     addNew: false,
  //     edit: false,
  //     create: false,
  //     delete: false,
  //     textEntry: false,
  //     multiValue: false,
  //   });
  // }
}