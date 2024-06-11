import { FieldSettings } from "projects/edit-types";
import { BehaviorSubject, distinctUntilChanged, map, of, shareReplay } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';

const logThis = false;
const logChildren = false;
const logRx = false;

@Injectable()
export class DataSourceString extends DataSourceBase {
  constructor() {
    super(new EavLogger('DataSourceString', logThis, logChildren));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): this {
    this.log.a('setup - settings$', [settings$]);
    super.setup(settings$);
    this.loading$ = of(false);

    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const maskHelper = this.getMaskHelper();
    maskHelper.patchMasks({ value: 'Value' })
    this.log.a('maskHelper', [maskHelper.getMasks()]);
    const rxLog = this.log.rxTap('data$', { enabled: logRx });
    this.data$ = this.settings$.pipe(
      rxLog.pipe(),
      map(settings => settings._options.map(option => {
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
      })),
      distinctUntilChanged(),
      shareReplay(1),
    );

    return this;
  }

  destroy(): void {
    super.destroy();
  }

}