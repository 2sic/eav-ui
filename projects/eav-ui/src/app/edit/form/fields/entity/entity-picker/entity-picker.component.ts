import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EavService, FieldsSettingsService, EntityService, EditRoutingService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { DeleteEntityProps } from '../../picker/picker.models';
import { EntityPickerLogic } from './entity-picker-logic';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerData } from '../../picker/picker-data';

@Component({
  selector: InputTypeConstants.WIPEntityPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private sourceFactory: PickerSourceAdapterFactoryService,
    private stateFactory: PickerStateAdapterFactoryService,
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
    EntityPickerLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.createPickerAdapters();
    this.createViewModel();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private createPickerAdapters(): void {
    this.pickerStateAdapter = this.stateFactory.createPickerEntityStateAdapter(
      this.control,
      this.config,
      this.settings$,
      this.editRoutingService,
      this.controlStatus$,
      this.label$,
      this.placeholder$,
      this.required$,
      () => this.focusOnSearchComponent,
    );

    this.pickerSourceAdapter = this.sourceFactory.createPickerEntitySourceAdapter(
      this.pickerStateAdapter.disableAddNew$,
      this.fieldsSettingsService,

      this.pickerStateAdapter.control,
      this.config,
      this.pickerStateAdapter.settings$,
      this.editRoutingService,
      this.group,
      // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
      (props: DeleteEntityProps) => this.pickerStateAdapter.doAfterDelete(props)
    );

    this.pickerStateAdapter.init();
    this.pickerSourceAdapter.init();
    this.pickerData = new PickerData(
      this.pickerSourceAdapter,
      this.pickerStateAdapter,
    );
  }
}
