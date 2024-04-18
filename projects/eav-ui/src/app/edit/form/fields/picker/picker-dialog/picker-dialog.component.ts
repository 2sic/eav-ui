import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { EntityPickerDialogViewModel } from './picker-dialog.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { PickerData } from '../picker-data';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { PickerTextComponent } from '../picker-text/picker-text.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerListComponent } from '../picker-list/picker-list.component';

@Component({
    selector: 'app-picker-dialog',
    templateUrl: './picker-dialog.component.html',
    styleUrls: ['./picker-dialog.component.scss'],
    standalone: true,
    imports: [
        PickerListComponent,
        PickerSearchComponent,
        PickerTextComponent,
        FieldHelperTextComponent,
        FlexModule,
        MatButtonModule,
        SharedComponentsModule,
        MatMenuModule,
        MatIconModule,
        AsyncPipe,
        TranslateModule,
    ],
})
export class PickerDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  viewModel$: Observable<EntityPickerDialogViewModel>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super();
  }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const source = this.pickerData.source;

    const freeTextMode$ = state.freeTextMode$;
    const disableAddNew$ = state.disableAddNew$;
    const controlStatus$ = state.controlStatus$;


    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        CreateTypes: settings.CreateTypes,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.viewModel$ = combineLatest([
      settings$, controlStatus$, freeTextMode$, disableAddNew$
    ]).pipe(
      map(([
        settings, controlStatus, freeTextMode, disableAddNew
      ]) => {
        const showAddNewEntityButtonInDialog = !freeTextMode && settings.EnableCreate && settings.CreateTypes && settings.AllowMultiValue;

        const viewModel: EntityPickerDialogViewModel = {
          controlStatus,
          freeTextMode,
          disableAddNew,

          // additional properties for easier readability in the template
          showAddNewEntityButtonInDialog,
        };

        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openNewEntityDialog(entityType: string): void {
    this.pickerData.source.editItem(null, entityType);
  }

  getEntityTypesData(): void {
    this.pickerData.state.getEntityTypesData();
  }
}
