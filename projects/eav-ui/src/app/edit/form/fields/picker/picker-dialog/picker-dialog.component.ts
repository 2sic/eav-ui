import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
import { EntityPickerDialogTemplateVars } from './picker-dialog.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';

@Component({
  selector: 'app-picker-dialog',
  templateUrl: './picker-dialog.component.html',
  styleUrls: ['./picker-dialog.component.scss'],
})
export class PickerDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  templateVars$: Observable<EntityPickerDialogTemplateVars>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super();
   }

  ngOnInit(): void {
    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const disableAddNew$ = this.pickerStateAdapter.disableAddNew$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    
    this.templateVars$ = combineLatest([
      settings$, controlStatus$, freeTextMode$, disableAddNew$
    ]).pipe(
      map(([
        settings, controlStatus, freeTextMode, disableAddNew,
      ]) => {
        const showAddNewEntityButtonInDialog = !freeTextMode && settings.EnableCreate && settings.EntityType && settings.AllowMultiValue && !this.controlConfig.isPreview;

        const templateVars: EntityPickerDialogTemplateVars = {
          controlStatus,
          freeTextMode,
          disableAddNew,

          // additional properties for easier readability in the template
          showAddNewEntityButtonInDialog,
        };

        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openNewEntityDialog(): void {
    this.pickerSourceAdapter.editEntity(null);
  }
}
