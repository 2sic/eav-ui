import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { EntityDefaultLogic } from './entity-default-logic';
import { PickerData } from '../../picker/picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';
import { PickerEntitySourceAdapter } from '../../picker/adapters/picker-entity-source-adapter';

const logThis = true;

@Component({
  selector: InputTypeConstants.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
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
    private stateRaw: PickerEntityStateAdapter,
    private pickerEntitySourceAdapter: PickerEntitySourceAdapter,
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
    this.log.add('constructor');
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

    const state = this.stateRaw.setupFromComponent(this);

    this.log.add('specs', 'isStringQuery', this.isStringQuery, 'state', state, 'control', this.control, 'config', this.config, 'settings$', this.settings$)

    const source = this.pickerEntitySourceAdapter.setupFromComponent(this, state);
    // const source = this.sourceFactory.createPickerEntitySourceAdapter(
    //   this,
    //   state,
    //   // state.disableAddNew$,
    //   // state.control,
    //   // this.config,
    //   // state.settings$,
    //   // this.group,
    //   // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
    //   // (props: DeleteEntityProps) => state.doAfterDelete(props)
    // );

    state.init();
    source.init('EntityDefaultComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );

  }
}
