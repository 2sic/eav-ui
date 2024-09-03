import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject, computed, Injector } from '@angular/core';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerData } from './picker-data';
import { PickerImports } from './picker-providers.constant';
import { FieldState } from '../../fields/field-state';
import { BaseComponent } from '../../../shared/components/base.component';
import { transient } from '../../../core';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { EditRoutingService } from '../../shared/services/edit-routing.service';

const logThis = false;
const nameOfThis = 'PickerComponent';

@Component({
  // selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class PickerComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(log?: EavLogger) {
    super(log ?? new EavLogger(nameOfThis, logThis));
    this.log.a('constructor');
  }

  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  /** The injector is used by most children to get transient one-time objects */
  protected injector = inject(Injector);

  public fieldState = inject(FieldState);

  public editRoutingService = inject(EditRoutingService);

  pickerData = transient(PickerData);

  /**
   * This control will always be created 2x
   * once for preview, and optional for dialog.
   * This is to indicate if it's the primary,
   * because the primary should also attach certain inits/events.
   */
  isPrimary = false;

  /**
   * Whether to show the preview or not,
   * since this control is used both for preview and dialog.
   */
  showPreview = computed(() => {
    const settings = this.fieldState.settings();
    const allowMultiValue = settings.AllowMultiValue;
    const isDialog = settings.isDialog;
    const showPreview = !allowMultiValue || (allowMultiValue && !isDialog);
    return showPreview;
  });

  ngOnInit(): void {
    this.log.a('ngOnInit');
    this.isPrimary = this.fieldState.config.pickerData == null;
    this.initAdaptersAndViewModel();
    if (this.isPrimary)
      this.refreshOnChildClosed();
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
    if (!this.isPrimary) {
      this.log.a('createPickerAdapters: pickerData already exists, will reuse');
      this.pickerData = config.pickerData;
    } else {
      // this method is overridden in each variant as of now
      this.createPickerAdapters();
      this.log.a('createPickerAdapters: config', { config });
      config.pickerData = this.pickerData;
    }
  }


  ngAfterViewInit(): void {
    this.log.a('ngAfterViewInit');
    if (this.isPrimary)
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
    const l = this.log.fn('refreshOnChildClosed');

    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    const config = this.fieldState.config;
    this.subscriptions.add(
      this.editRoutingService.childFormResult(config.index, config.entityGuid).subscribe(result => {
        const newItemGuid = Object.keys(result)[0];
        this.log.a('childFormResult', { result, newItemGuid });
        if (!this.pickerData.state.createValueArray().includes(newItemGuid)) {
          this.pickerData.state.addSelected(newItemGuid);
          this.pickerData.source.forceReloadData([newItemGuid]);
        }
      })
    );
    // this is used when new entity is created/changed in child form it automatically fetched again
    this.subscriptions.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        const childGuid = this.pickerData.source.editEntityGuid();
        this.log.a('childFormClosed', { childGuid });
        if (childGuid)
          this.pickerData.source.forceReloadData([childGuid]);
      })
    );
    l.end();
  }
}
