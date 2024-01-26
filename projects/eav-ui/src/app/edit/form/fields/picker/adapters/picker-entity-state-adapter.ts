import { AbstractControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { ControlStatus } from "../../../../shared/models";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";
import { PickerStateAdapter } from "./picker-state-adapter";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { ContentTypesService } from "projects/eav-ui/src/app/app-administration/services/content-types.service";

export class PickerEntityStateAdapter extends PickerStateAdapter {
  constructor(
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    public isExpanded$: Observable<boolean>,
    public label$: Observable<string>,
    public placeholder$: Observable<string>,
    public required$: Observable<boolean>,
    public cacheItems$: Observable<PickerItem[]>,
    public stringQueryCache$: Observable<QueryEntity[]>,
    public fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    public translate: TranslateService,
    public control: AbstractControl,
    public contentTypesService: ContentTypesService,
    focusOnSearchComponent: () => void,
  ) {
    super(
      settings$,
      controlStatus$,
      isExpanded$,
      label$,
      placeholder$,
      required$,
      cacheItems$,
      stringQueryCache$,
      translate,
      control,
      contentTypesService,
      focusOnSearchComponent,
    );
  }

  init(): void {
    super.init();
  }

  destroy(): void {
    super.destroy();
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return valueArray;
  }
}