import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, distinctUntilChanged, map, of, shareReplay } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';
import { DataSourceMasks } from './data-source-masks.model';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';

const logThis = true;
const logChildren = true;
const logRx = true;

@Injectable()
export class DataSourceString extends DataSourceBase {
  constructor() {
    super(new EavLogger('DataSourceString', logThis, logChildren));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): this {
    this.log.add('setup', 'settings$', settings$);
    super.setup(settings$);
    this.loading$ = of(false);

    var mask = this.getMaskHelper().getMasks();
    this.log.add('mask', mask);

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
        return this.entity2PickerItem(asEntity, null, /* mustUseGuid: */ false);
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