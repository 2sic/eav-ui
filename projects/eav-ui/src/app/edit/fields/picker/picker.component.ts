import { Component, inject, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '../../../shared/components/base.component';
import { classLog, ClassLogger } from '../../../shared/logging';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { FieldState } from '../../fields/field-state';
import { EditRoutingService } from '../../routing/edit-routing.service';
import { PickerDataSetup } from './picker-data-setup';
import { PickerImports } from './picker-providers.constant';
import { PickerSearchComponent } from './picker-search/picker-search.component';

@Component({
  // selector: none since it's a base class
  templateUrl: './picker.component.html',
  standalone: true,
  imports: PickerImports,
})
export abstract class PickerComponent extends BaseComponent implements OnInit, OnDestroy {

  /** Typed Log Specs for inheriting classes to reuse */
  static logSpecs = {
    all: false,
    focusOnSearchComponent: true,
    refreshOnChildClosed: false,
    childFormResult: true,
  };

  log: ClassLogger<typeof PickerComponent.logSpecs>;
  
  constructor() { super(); }
  
  constructorEnd() {
    this.log ??= classLog({PickerComponent}, PickerComponent.logSpecs);
    this.log.a('constructor');
    const pickerDataFactory = new PickerDataSetup(this.#injector);
    pickerDataFactory.setupPickerData(this.#pickerData, this.#fieldState);
  }

  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  /** The injector is used by most children to get transient one-time objects */
  #injector = inject(Injector);
  #editRoutingService = inject(EditRoutingService);
  #fieldState = inject(FieldState);

  #pickerData = this.#fieldState.pickerData;

  /**
   * Whether to show the preview or not,
   * since this control is used both for preview and dialog.
   */
  showPreview = computedObj('showPreview', () => {
    const s = this.#fieldState.settings();
    return !s.AllowMultiValue || (s.AllowMultiValue && !s.isDialog);
  });

  ngOnInit(): void {
    if (this.#pickerData.closeWatcherAttachedWIP)
      return;
    this.#refreshOnChildClosed();
    this.#pickerData.closeWatcherAttachedWIP = true;
  }

  #refreshOnChildClosed(): void {
    const l = this.log.fnIf('refreshOnChildClosed');

    // this is used when new entity is created in child form it automatically adds it to the picker as selected item
    const config = this.#fieldState.config;
    this.subscriptions.add(
      // TODO: 2dm 2024-09-05 I believe this doesn't work as expected
      this.#editRoutingService.childFormResult(config.index, config.entityGuid)
        .subscribe(result => {
          const l2 = this.log.fnIf('childFormResult', { result });
          return l2.r(this.#pickerData.addNewlyCreatedItem(result));
        })
    );
    l.end();
  }
}
