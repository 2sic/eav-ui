import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EavService, EditRoutingService, EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { PickerSourceAdapter } from './picker-source-adapter';
import { DeleteEntityProps } from './picker.models';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';

@Injectable()
export class PickerSourceAdapterFactoryService {
  constructor(
    private eavService: EavService,
    private entityCacheService: EntityCacheService,
    private entityService: EntityService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
  ) { }

  createPickerSourceAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerSourceAdapter {
    const pickerSourceAdapter = new PickerSourceAdapter(
      deleteCallback,
      settings$,
      this.entityCacheService,
      this.entityService,
      this.eavService,
      editRoutingService,
      this.translate,
      config,
      group,
      this.snackBar,
      control,
    );
    pickerSourceAdapter.fetchAvailableEntities =
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache);

    return pickerSourceAdapter;
  }

  init(pickerSourceAdapter: PickerSourceAdapter): void {
    pickerSourceAdapter.init();
  }
}
