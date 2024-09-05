import { Component, OnDestroy, OnInit, ViewChild, inject, Injector } from '@angular/core';
import { PickerSearchComponent } from './picker-search/picker-search.component';
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
export class PickerComponent extends BaseComponent implements OnInit, OnDestroy {

  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  /** The injector is used by most children to get transient one-time objects */
  #injector = inject(Injector);
  #editRoutingService = inject(EditRoutingService);
  #fieldState = inject(FieldState);

  constructor(log?: EavLogger) {
    super(log ?? new EavLogger(logSpecs));
    this.log.a('constructor');
    this.#pickerDataFactory.setupPickerData(this.#pickerData, this.#fieldState);
  }

  // wip
  #pickerDataFactory = new PickerDataFactory(this.#injector);

  #pickerData = this.#fieldState.pickerData;

  /**
   * Whether to show the preview or not,
   * since this control is used both for preview and dialog.
   */
  showPreview = computedObj('showPreview', () => {
    const settings = this.#fieldState.settings();
    const allowMultiValue = settings.AllowMultiValue;
    const isDialog = settings.isDialog;
    const showPreview = !allowMultiValue || (allowMultiValue && !isDialog);
    return showPreview;
  });

  ngOnInit(): void {
    if (this.#pickerData.closeWatcherAttachedWIP)
      return;
    this.#refreshOnChildClosed();
    this.#pickerData.state.attachCallback(this.focusOnSearchComponent);
    this.#pickerData.closeWatcherAttachedWIP = true;
  }

  focusOnSearchComponent(): void {
    // TODO: I don't think this actually works, since I can't see where it would be set
    this.entitySearchComponent?.autocomplete()?.nativeElement.focus();
  }

  #refreshOnChildClosed(): void {
    const l = this.log.fn('refreshOnChildClosed');

    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    const config = this.#fieldState.config;
    this.subscriptions.add(
      // TODO: 2dm 2024-09-05 I believe this doesn't work as expected
      this.#editRoutingService.childFormResult(config.index, config.entityGuid)
        .subscribe(result => this.#pickerData.addNewlyCreatedItem(result))
    );
    l.end();
  }
}
