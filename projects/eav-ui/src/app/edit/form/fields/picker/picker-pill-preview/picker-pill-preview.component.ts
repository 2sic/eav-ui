import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { PickerPillPreviewTemplateVars } from './picker-pill-preview.models';
import { GeneralHelpers } from '../../../../shared/helpers';
import { calculateSelectedEntities } from '../picker.helpers';
import { TranslateService } from '@ngx-translate/core';
import { EavService, FieldsSettingsService, EditRoutingService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { BaseFieldComponent } from '../../base/base-field.component';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

@Component({
  selector: 'app-picker-pill-preview',
  templateUrl: './picker-pill-preview.component.html',
  styleUrls: ['./picker-pill-preview.component.scss'],
})
export class PickerPillPreviewComponent extends BaseFieldComponent<string | string[]> implements OnInit, OnDestroy {

  templateVars$: Observable<PickerPillPreviewTemplateVars>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private entityCacheService: EntityCacheService,
    private stringQueryCache: StringQueryCacheService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const isOpen$ = this.settings$.pipe(map(settings => settings._isDialog), distinctUntilChanged());
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

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([selectedEntities$, isOpen$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [selectedEntities, isOpen],
      ]) => {
        const templateVars: PickerPillPreviewTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          selectedEntities: selectedEntities?.slice(0, 9) || [],
          entitiesNumber: selectedEntities?.length || 0,
          isOpen,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  trackByFn(index: number, item: SelectedEntity) {
    return item.Value;
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}
