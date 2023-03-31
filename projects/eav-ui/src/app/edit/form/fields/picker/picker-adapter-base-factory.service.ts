import { Injectable } from "@angular/core";
import { PickerSearchComponent } from "./picker-search/picker-search.component";
import { AbstractControl } from "@angular/forms";
import { FieldConfigSet } from "../../builder/fields-builder/field-config-set.model";
import { FieldSettings } from "projects/edit-types";
import { BehaviorSubject } from "rxjs";
import { PickerAdapterBase } from "./picker-adapter-base";

@Injectable()
export class PickerAdapterBaseFactoryService {
  constructor() { }

  createPickerAdapterBase(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
  ): PickerAdapterBase {
    const pickerAdapterBase = new PickerAdapterBase();
    pickerAdapterBase.control = control;
    pickerAdapterBase.config = config;
    pickerAdapterBase.settings$ = settings$;
    return pickerAdapterBase;
  }
}