import { Injectable } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, startWith } from 'rxjs';
import { classLog } from '../../../../../shared/logging';
import { mapUntilChanged } from '../../shared/rxJs/mapUntilChanged';
import { ServiceBase } from '../../shared/services/service-base';
import { FormConfigService } from '../form/form-config.service';
import { FormsStateService } from '../form/forms-state.service';
import { FieldValueHelpers } from '../shared/helpers/field-value.helpers';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { ItemService } from '../state/item.service';
import { EntityFormStateService } from './entity-form-state.service';

/**
 * A Service to ....
 * 
 * Important: This is specific to a single entity.
 */
@Injectable()
export class EntityFormSyncService extends ServiceBase {

  log = classLog({EntityFormSyncService});

  constructor(
    private entityFormSvc: EntityFormStateService,
    private formsStateSvc: FormsStateService,
    private formConfig: FormConfigService,
    private itemSvc: ItemService,
  ) {
    super();
  }

  public setupSync(entityGuid: string) {
    const form = this.entityFormSvc.formGroup;

    // 1. Sync dirty state upwards
    this.subscriptions.add(
      form.valueChanges.pipe(
        map(() => form.dirty),
        startWith(form.dirty),
        // We can't have distinctUntilChanged because dirty state is not reset on form save.
        // leave this comment and the code below for future reference, so people don't add it back.
        // distinctUntilChanged(),
      ).subscribe(isDirty => {
        this.formsStateSvc.setFormDirty(entityGuid, isDirty);
      })
    );

    // 2. Sync form-valid state to the global states
    // 2.1. Get the form-valid state
    const formValid$ = form.valueChanges.pipe(
      map(() => !form.invalid),
      startWith(!form.invalid),
      mapUntilChanged(m => m),
    );

    // 2.2. Get the item header. Note that it will be null during destruction
    const itemHeader$ = this.itemSvc.getItemHeader$(entityGuid);

    // 2.3. Setup sync
    this.subscriptions.add(
      combineLatest([formValid$, itemHeader$]).pipe(
        mapUntilChanged(([formValid, itemHeader]) => itemHeader?.IsEmpty || formValid),
      ).subscribe(isValid => {
        this.formsStateSvc.setFormValid(entityGuid, isValid);
      })
    );

    // 3. Sync raw values as they change from the form...
    // TODO: THIS LOOKS a bit fishy, since I think we have another service syncing form values to the controls
    this.subscriptions.add(
      form.valueChanges.pipe(
        map(() => form.getRawValue() as ItemValuesOfLanguage),
        distinctUntilChanged((previous, current) => FieldValueHelpers.getItemValuesChanges(previous, current) == null),
      ).subscribe(formValues => {
        const language = this.formConfig.language();
        this.itemSvc.updater.updateItemAttributesValues(entityGuid, formValues, language);
      })
    );

  }
}