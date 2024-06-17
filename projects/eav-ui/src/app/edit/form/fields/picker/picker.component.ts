import { AfterViewInit, Component, OnDestroy, OnInit, Signal, ViewChild, computed, signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { BaseFieldComponent } from '../base/base-field.component';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerViewModel } from './models/picker.models';
import { PickerData } from './picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from './picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from './picker-preview/picker-preview.component';
import { PickerProviders } from './picker-providers.constant';

const logThis = false;

@Component({
  // selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: [
    PickerPreviewComponent,
    PickerDialogComponent,
    AsyncPipe,
  ],
})
export class PickerComponent extends BaseFieldComponent<string | string[]> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  pickerData: PickerData;
  isStringQuery: boolean;

  viewModel$: Observable<PickerViewModel>;

  public showPreview: Signal<boolean>;

  public log: EavLogger = new EavLogger('PickerComponent', logThis);

  constructor(fieldsSettingsService: FieldsSettingsService, public editRoutingService: EditRoutingService) {
    super(fieldsSettingsService);
  }

  ngOnInit(): void {
    this.log.a('ngOnInit');
    super.ngOnInit();
    this.refreshOnChildClosed();
    this.initAdaptersAndViewModel();

    const pd = this.pickerData;
    const allowMultiValue = pd.state.settings().AllowMultiValue;
    const showPreview = !allowMultiValue || (allowMultiValue && this.controlConfig.isPreview);
    this.showPreview = signal(showPreview);
  }

  /**
   * Initialize the Picker Adapter and View Model
   * If the PickerData already exists, it will be reused
   */
  private initAdaptersAndViewModel(): void {
    this.log.a('initAdaptersAndViewModel');
    // First, create the Picker Adapter or reuse
    // The reuse is a bit messy - reason is that there are two components (preview/dialog)
    // which have the same services, and if one is created first, the pickerData should be shared
    if (this.config.pickerData) {
      this.log.a('createPickerAdapters: pickerData already exists, will reuse');
      this.pickerData = this.config.pickerData;
    } else {
      // this method is overridden in each variant as of now
      this.createPickerAdapters();
      this.log.a('createPickerAdapters: config', [this.config]);
      this.config.pickerData = this.pickerData;
    }
  }


  ngAfterViewInit(): void {
    this.log.a('ngAfterViewInit');
    this.pickerData.source.onAfterViewInit();
  }

  ngOnDestroy(): void {
    this.log.a('ngOnDestroy');
    this.pickerData.destroy();
    super.ngOnDestroy();
  }

  /** Create the Picker Adapter - MUST be overridden in each inheriting class */
  protected createPickerAdapters(): void {
    throw new Error('Method not implemented. Must be overridden by inheriting class.');
  }


  focusOnSearchComponent(): void {
    this.entitySearchComponent.autocomplete()?.nativeElement.focus();
  }

  private refreshOnChildClosed(): void {
    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    this.subscriptions.add(
      this.editRoutingService.childFormResult(this.config.index, this.config.entityGuid).subscribe(result => {
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
        if (this.pickerData.source.editEntityGuid$.value)
          this.pickerData.source.forceReloadData([this.pickerData.source.editEntityGuid$.value]);
      })
    );
  }
}
