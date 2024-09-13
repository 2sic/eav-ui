import { Component, OnDestroy, OnInit, ViewChild, inject, Injector, Optional } from '@angular/core';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerImports } from './picker-providers.constant';
import { FieldState } from '../../fields/field-state';
import { BaseComponent } from '../../../shared/components/base.component';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { EditRoutingService } from '../../routing/edit-routing.service';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { PickerDataSetup } from './picker-data-setup';
import { classLog } from '../../../shared/logging';
import { ClassLogger } from '../../../shared/logging/logger.interface';


@Component({
  // selector: none since it's a base class
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export abstract class PickerComponent extends BaseComponent implements OnInit, OnDestroy {

  /** Typed Log Specs for inheriting classes to reuse */
  static logSpecs = {
    all: true,
    focusOnSearchComponent: false,
    refreshOnChildClosed: false,
    childFormResult: true,
  };

  @ViewChild(PickerSearchComponent) protected entitySearchComponent: PickerSearchComponent;

  /** The injector is used by most children to get transient one-time objects */
  #injector = inject(Injector);
  #editRoutingService = inject(EditRoutingService);
  #fieldState = inject(FieldState);

  #pickerData = this.#fieldState.pickerData;

  log: ClassLogger<typeof PickerComponent.logSpecs>;
  
  constructor(@Optional()log: EavLogger = null) {
    super();
    this.log = log ?? classLog({PickerComponent}, PickerComponent.logSpecs);
    this.log.a('constructor');
    const pickerDataFactory = new PickerDataSetup(this.#injector);
    pickerDataFactory.setupPickerData(this.#pickerData, this.#fieldState);
  }

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
    this.#pickerData.state.attachCallback(this.focusOnSearchComponent);
    this.#pickerData.closeWatcherAttachedWIP = true;
  }

  focusOnSearchComponent(): void {
    const l = this.log.fnIf('focusOnSearchComponent');
    // TODO: I don't think this actually works, since I can't see where it would be set
    this.entitySearchComponent?.autocomplete()?.nativeElement.focus();
    l.end();
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
