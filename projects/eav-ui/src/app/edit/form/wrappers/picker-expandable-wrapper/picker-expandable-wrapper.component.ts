import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, map, Observable, share } from 'rxjs';
import { WrappersConstants } from '../../../shared/constants';
import { GeneralHelpers } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { SelectedEntity } from '../../fields/entity/entity-default/entity-default.models';
import { calculateSelectedEntities } from '../../fields/picker/picker.helpers';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { PickerExpandableViewModel } from './picker-expandable-wrapper.models';

@Component({
  selector: WrappersConstants.PickerExpandableWrapper,
  templateUrl: './picker-expandable-wrapper.component.html',
  styleUrls: ['./picker-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class PickerExpandableWrapperComponent extends BaseFieldComponent<string | string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$.pipe(share());
  viewModel$: Observable<PickerExpandableViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private entityCacheService: EntityCacheService,
    private stringQueryCache: StringQueryCacheService,
    private formsStateService: FormsStateService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dialogIsOpen$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    const selectedEntities$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.entityCacheService.getEntities$(),
      this.stringQueryCache.getEntities$(this.config.entityGuid, this.config.fieldName),
      this.settings$.pipe(
        map(settings => ({
          Separator: settings.Separator,
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([value, entityCache, stringQueryCache, settings]) =>
        calculateSelectedEntities(value, settings.Separator, entityCache, stringQueryCache, settings.Value, settings.Label, this.translate)
      ),
    );

    this.viewModel$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([selectedEntities$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [selectedEntities],
      ]) => {
        const viewModel: PickerExpandableViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          selectedEntities: selectedEntities?.slice(0, 9) || [],
          entitiesNumber: selectedEntities?.length || 0,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  trackByFn(index: number, item: SelectedEntity) {
    return item.value;
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }

  saveAll(close: boolean) {
    this.formsStateService.saveForm$.next(close);
  }
}
