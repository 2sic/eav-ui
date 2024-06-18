import { FieldSettings } from "projects/edit-types";
import { of } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Injector, Signal, computed, inject, runInInjectionContext } from '@angular/core';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';
import { toObservable } from '@angular/core/rxjs-interop';

const logThis = false;
const logChildren = false;
const logRx = false;

@Injectable()
export class DataSourceString extends DataSourceBase {
  private injector = inject(Injector);

  constructor() {
    super(new EavLogger('DataSourceString', logThis, logChildren));
  }


  public override setup(settings: Signal<FieldSettings>): this {
    this.log.a('setup - settings$', [settings()]);
    super.setup(settings);
    this.loading$ = of(false);

    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const maskHelper = this.getMaskHelper();
    maskHelper.patchMasks({ value: 'Value' })
    this.log.a('maskHelper', [maskHelper.getMasks()]);

    // New: signal
    this.data = computed(() => {
      const sets = settings();
      return sets._options.map(option => {
        const asEntity: EntityBasicWithFields = {
          Id: null,
          Guid: null,
          Title: option.label,
          // These are only added for use in Formulas or masks.
          Value: option.value,
        };
        // TODO: @2dm fix bug, the value should be provided by entity2PickerItem
        // but it's not - probably something we must ensure with the mask...?
        const pickerItem = maskHelper.entity2PickerItem({ entity: asEntity, streamName: null, mustUseGuid: false });
        this.log.a('final data', [pickerItem]);
        return pickerItem;
      });
    });

    runInInjectionContext(this.injector, () => {
      this.data$ = toObservable(this.data);
    });

    return this;
  }

  destroy(): void {
    super.destroy();
  }

}