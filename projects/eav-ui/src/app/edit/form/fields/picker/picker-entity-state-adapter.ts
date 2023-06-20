import { AbstractControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, EntityInfo } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { ControlStatus } from "../../../shared/models";
import { FieldConfigSet } from "../../builder/fields-builder/field-config-set.model";
import { QueryEntity } from "../entity/entity-query/entity-query.models";
import { PickerStateAdapter } from "./picker-state-adapter";

export class PickerEntityStateAdapter extends PickerStateAdapter {
  constructor(
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    public isExpanded$: Observable<boolean>,
    public label$: Observable<string>,
    public placeholder$: Observable<string>,
    public required$: Observable<boolean>,
    public cacheEntities$: Observable<EntityInfo[]>,
    public stringQueryCache$: Observable<QueryEntity[]>,

    public translate: TranslateService,

    protected config: FieldConfigSet,
    public control: AbstractControl,

    focusOnSearchComponent: () => void,
  ) {
    super(
      settings$,
      controlStatus$,
      isExpanded$,
      label$,
      placeholder$,
      required$,
      cacheEntities$,
      stringQueryCache$,
      translate,
      config,
      control,
      focusOnSearchComponent,
    );
  }

  init(): void {
    super.init();
  }

  destroy(): void {
    super.destroy();
  }
  
  protected createValueArray(): string[] {
    return [...this.control.value];
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return valueArray;
  }
}