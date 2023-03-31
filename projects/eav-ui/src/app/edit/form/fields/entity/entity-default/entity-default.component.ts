import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldMask } from '../../../../shared/helpers';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerSourceAdapterFactoryService } from '../../picker/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/picker-state-adapter-factory.service';
import { PickerComponent } from '../../picker/picker.component';
import { filterGuids } from '../../picker/picker.helpers';
import { EntityDefaultLogic } from './entity-default-logic';
import { PickerAdapterBaseFactoryService } from '../../picker/picker-adapter-base-factory.service';

@Component({
  selector: InputTypeConstants.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {
  private paramsMask: FieldMask;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private pickerAdapterBaseFactoryService: PickerAdapterBaseFactoryService,
    private pickerSourceAdapterFactoryService: PickerSourceAdapterFactoryService,
    private pickerStateAdapterFactoryService: PickerStateAdapterFactoryService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      entityCacheService,
      stringQueryCacheService,
    );
    EntityDefaultLogic.importMe();
    this.isQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.createPickerAdapters();

    this.createTemplateVariables();
  }

  ngOnDestroy(): void {
    this.pickerSourceAdapter.destroy();
    this.pickerStateAdapter.destroy();
    this.paramsMask?.destroy();
    super.ngOnDestroy();
  }

  private createPickerAdapters(): void {
    this.pickerAdapterBase = this.pickerAdapterBaseFactoryService.fillPickerAdapterBase(
      this.control,
      this.config,
      this.entitySearchComponent,
      this.settings$,
    );

    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.fillPickerSourceAdapter(
      this.pickerAdapterBase,
      this.editRoutingService,
      this.group,
      false,
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache)
    );

    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.fillPickerStateAdapter(
      this.pickerAdapterBase,
      this.editRoutingService,
      this.controlStatus$,
      this.label$,
      this.placeholder$,
      this.required$,
    );

    this.pickerSourceAdapterFactoryService.init(this.pickerSourceAdapter);
    this.pickerStateAdapterFactoryService.init(this.pickerStateAdapter);
  }

  /** WARNING! Overrides function in superclass */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.pickerSourceAdapter.availableEntities$.next(null);
    }

    const contentTypeName = this.pickerSourceAdapter.contentTypeMask.resolve();
    const entitiesFilter: string[] = (clearAvailableEntitiesAndOnlyUpdateCache || !this.settings$.value.EnableAddExisting)
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;

    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // const includeParentApps = this.settings$.value?.IncludeParentApps == true;
    this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      if (!clearAvailableEntitiesAndOnlyUpdateCache) {
        this.pickerSourceAdapter.availableEntities$.next(items);
      }
    });
  }
}
