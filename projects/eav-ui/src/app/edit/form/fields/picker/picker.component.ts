import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject, computed } from '@angular/core';
import { EditRoutingService } from '../../../shared/services';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerData } from './picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerImports, PickerProviders } from './picker-providers.constant';
import { FieldState } from '../../builder/fields-builder/field-state';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';

const logThis = false;
const nameOfThis = 'PickerComponent';

@Component({
  // selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class PickerComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  public fieldState = inject(FieldState);
  
  public editRoutingService = inject(EditRoutingService);

  pickerData = inject(PickerData);

  /**
   * cache previous state, as it will often be null on follow-up computations
   * This is hacky / not nice!
   * Reason is that the _isDialog doesn't get fully pushed back to the state, and 
   * when formulas run, it will be undefined on follow up settings-updates.
   * To make it nicer, we would have to extend how these states are pushed to the system...
   */
  // prevIsDialog: boolean = null;
  showPreview = computed(() => { 
    const settings = this.fieldState.settings();
    const allowMultiValue = settings.AllowMultiValue;
    const isDialog = /* this.prevIsDialog = */ settings._isDialog;// ?? this.prevIsDialog;
    const showPreview = !allowMultiValue || (allowMultiValue && !isDialog);
    // console.log(this.log.svcId + '; computed - settings: ' + showPreview, settings._isDialog, allowMultiValue, isDialog, showPreview, settings);
    return showPreview;
  });

  constructor(log?: EavLogger) {
    super(log ?? new EavLogger(nameOfThis, logThis));
  }

  ngOnInit(): void {
    this.log.a('ngOnInit');
    this.refreshOnChildClosed();
    this.initAdaptersAndViewModel();

    // const allowMultiValue = this.fieldState.settings().AllowMultiValue;
    // TODO: 2DM CONTINUE HERE - problem with this.controlConfig always being {} and not having isPreview
    // which seems to work, and the fieldSettings.controlConfig fails!
    // const showPreview = !allowMultiValue || (allowMultiValue && this.controlConfig.isPreview);
    // this.showPreview = signal(showPreview);
  }

  /**
   * Initialize the Picker Adapter and View Model
   * If the PickerData already exists, it will be reused
   */
  private initAdaptersAndViewModel(): void {
    this.log.a('initAdaptersAndViewModel');
    const config = this.fieldState.config;
    // First, create the Picker Adapter or reuse
    // The reuse is a bit messy - reason is that there are two components (preview/dialog)
    // which have the same services, and if one is created first, the pickerData should be shared
    if (config.pickerData) {
      this.log.a('createPickerAdapters: pickerData already exists, will reuse');
      this.pickerData = config.pickerData;
    } else {
      // this method is overridden in each variant as of now
      this.createPickerAdapters();
      this.log.a('createPickerAdapters: config', [config]);
      config.pickerData = this.pickerData;
    }
  }


  ngAfterViewInit(): void {
    this.log.a('ngAfterViewInit');
    this.pickerData.source.onAfterViewInit();
  }
  
  /** Create the Picker Adapter - MUST be overridden in each inheriting class */
  protected createPickerAdapters(): void {
    throw new Error('Method not implemented. Must be overridden by inheriting class.');
  }


  focusOnSearchComponent(): void {
    // TODO: I don't think this actually works, since I can't see where it would be set
    this.entitySearchComponent?.autocomplete()?.nativeElement.focus();
  }

  private refreshOnChildClosed(): void {
    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    const config = this.fieldState.config;
    this.subscriptions.add(
      this.editRoutingService.childFormResult(config.index, config.entityGuid).subscribe(result => {
        // @2SDV TODO check why this triggers twice
        const newItemGuid = Object.keys(result)[0];
        if (!this.pickerData.state.createValueArray().includes(newItemGuid)) {
          this.pickerData.state.addSelected(newItemGuid);
          this.pickerData.source.forceReloadData([newItemGuid]);
        }
      })
    );
    // this is used when new entity is created/changed in child form it automatically fetched again
    this.subscriptions.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        if (this.pickerData.source.editEntityGuid())
          this.pickerData.source.forceReloadData([this.pickerData.source.editEntityGuid()]);
      })
    );
  }
}
