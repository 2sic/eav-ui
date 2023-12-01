import { AbstractControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, WIPDataSourceItem } from "projects/edit-types";
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, map } from "rxjs";
import { ControlStatus } from "../../../../shared/models";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";
import { PickerStateAdapter } from "./picker-state-adapter";
import { calculateStringSelectedOptions, convertArrayToString, convertValueToArray } from "../picker.helpers";

export class PickerStringStateAdapter extends PickerStateAdapter {
  constructor(
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    public isExpanded$: Observable<boolean>,
    public label$: Observable<string>,
    public placeholder$: Observable<string>,
    public required$: Observable<boolean>,
    public cacheItems$: Observable<WIPDataSourceItem[]>,
    public stringQueryCache$: Observable<QueryEntity[]>,

    public translate: TranslateService,

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
      cacheItems$,
      stringQueryCache$,
      translate,
      control,
      focusOnSearchComponent,
    );
  }

  init(): void {
    this.selectedItems$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(
        map(settings => ({
          Separator: settings.Separator,
          Value: settings.Value,
          Label: settings.Label,
          Options: settings._options,
        })),
      ),
    ]).pipe(map(([value, settings]) => calculateStringSelectedOptions(value, settings.Separator, settings.Options)));
    super.init();
  }

  destroy(): void {
    super.destroy();
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings$.value.Separator);
  }
}