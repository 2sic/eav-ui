import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject, Injector } from '@angular/core';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerData } from './picker-data';
import { PickerImports } from './picker-providers.constant';
import { FieldState } from '../../fields/field-state';
import { BaseComponent } from '../../../shared/components/base.component';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { PickerDataFactory } from './picker-data.factory';

const logSpecs = {
  name: 'PickerComponent',
  enabled: true,
};

@Component({
  // selector: none since it's a base class
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class PickerComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(log?: EavLogger) {
    super(log ?? new EavLogger(logSpecs));
    this.log.a('constructor');
  }

  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  /** The injector is used by most children to get transient one-time objects */
  protected injector = inject(Injector);
  public editRoutingService = inject(EditRoutingService);
  public fieldState = inject(FieldState);

  // wip
  protected pickerDataFactory = new PickerDataFactory(this.injector);

  pickerData: PickerData = this.fieldState.pickerData;

  /**
   * This control will always be created 2x
   * once for preview, and optional for dialog.
   * This is to indicate if it's the primary,
   * because the primary should also attach certain inits/events.
   */
  mustInitializePicker = false;

  /**
   * Whether to show the preview or not,
   * since this control is used both for preview and dialog.
   */
  showPreview = computedObj('showPreview', () => {
    const settings = this.fieldState.settings();
    const allowMultiValue = settings.AllowMultiValue;
    const isDialog = settings.isDialog;
    const showPreview = !allowMultiValue || (allowMultiValue && !isDialog);
    return showPreview;
  });

  ngOnInit(): void {
    this.mustInitializePicker = !this.pickerData.isInitialized;
    this.log.a('ngOnInit', { mustInitializePicker: this.mustInitializePicker });
    this.initAdaptersAndViewModel();
    if (!this.pickerData.closeWatcherAttachedWIP) {
      this.#refreshOnChildClosed();
      this.pickerData.state.attachCallback(this.focusOnSearchComponent);
      this.pickerData.closeWatcherAttachedWIP = true;
    }
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
    if (!this.mustInitializePicker) {
      this.log.a('createPickerAdapters: pickerData already exists, will reuse');
    } else {
      // this method is overridden in each variant as of now
      this.createPickerAdapters();
      this.log.a('createPickerAdapters: config', { config });
    }
  }


  ngAfterViewInit(): void {
    this.log.a('ngAfterViewInit');
    if (this.mustInitializePicker) {
      this.pickerData.source.onAfterViewInit();
    }
  }

  /** Create the Picker Adapter - MUST be overridden in each inheriting class */
  protected createPickerAdapters(): void {
    throw new Error('Method not implemented. Must be overridden by inheriting class.');
  }


  focusOnSearchComponent(): void {
    // TODO: I don't think this actually works, since I can't see where it would be set
    this.entitySearchComponent?.autocomplete()?.nativeElement.focus();
  }

  #refreshOnChildClosed(): void {
    const l = this.log.fn('refreshOnChildClosed');

    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    const config = this.fieldState.config;
    this.subscriptions.add(
      // TODO: 2dm 2024-09-05 I believe this doesn't work as expected
      this.editRoutingService.childFormResult(config.index, config.entityGuid)
        .subscribe(result => this.pickerData.addNewlyCreatedItem(result))
    );
    l.end();
  }
}
