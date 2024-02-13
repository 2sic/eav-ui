import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { PickerComponent } from '../../picker/picker.component';
import { EntityDefaultLogic } from './entity-default-logic';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerData } from '../../picker/picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Component({
  selector: InputTypeConstants.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {
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
    this.log = new EavLogger('EntityDefaultComponent', logThis);
    EntityDefaultLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initAdaptersAndViewModel();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.add('createPickerAdapters');

    const state = this.stateFactory.createPickerEntityStateAdapter(this);

    const source = this.sourceFactory.createPickerEntitySourceAdapter(
      state.disableAddNew$,
      this.fieldsSettingsService,

      state.control,
      this.config,
      state.settings$,
      this.editRoutingService,
      this.group,
      // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
      (props: DeleteEntityProps) => state.doAfterDelete(props)
    );

    state.init();
    source.init('EntityDefaultComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );

  }
}
