import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';
import { PickerData } from '../../picker/picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerStateAdapter } from '../../picker/adapters/picker-state-adapter';
import { PickerEntitySourceAdapter } from '../../picker/adapters/picker-entity-source-adapter';

const logThis = true;

@Component({
  selector: InputTypeConstants.EntityContentBlocks,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
})
@FieldMetadata({})
export class EntityContentBlockComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private pickerStateAdapterRaw: PickerStateAdapter,
    private pickerEntitySourceAdapter: PickerEntitySourceAdapter,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      editRoutingService,
    );
    this.log = new EavLogger('EntityContentBlockComponent', logThis);
    this.log.add('constructor');
    EntityContentBlocksLogic.importMe();
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
    const state = this.pickerStateAdapterRaw.setupFromComponent(this);

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
    source.init('EntityContentBlockComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}
