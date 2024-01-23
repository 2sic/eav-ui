import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { EntityPickerDialogViewModel } from './picker-dialog.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { PickerData } from '../picker-data';
import { ContentTypesService } from 'projects/eav-ui/src/app/app-administration/services';
import { eavConstants } from 'projects/eav-ui/src/app/shared/constants/eav.constants';

@Component({
  selector: 'app-picker-dialog',
  templateUrl: './picker-dialog.component.html',
  styleUrls: ['./picker-dialog.component.scss'],
})
export class PickerDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  viewModel$: Observable<EntityPickerDialogViewModel>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private contentTypesService: ContentTypesService,
  ) {
    super();
  }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const source = this.pickerData.source;

    const freeTextMode$ = state.freeTextMode$;
    const disableAddNew$ = state.disableAddNew$;
    const controlStatus$ = state.controlStatus$;

    const contentTypes$ = this.contentTypesService.retrieveContentTypes(eavConstants.scopes.default.name);

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.viewModel$ = combineLatest([
      settings$, controlStatus$, freeTextMode$, disableAddNew$, contentTypes$,
    ]).pipe(
      map(([
        settings, controlStatus, freeTextMode, disableAddNew, contentTypes,
      ]) => {
        const entityTypes = settings.EntityType
          ? settings.EntityType.split(',').map((guid: string) => ({ label: contentTypes.find(ct => ct.StaticName === guid)?.Label, guid }))
          : [];
        const showAddNewEntityButtonInDialog = !freeTextMode && settings.EnableCreate && settings.EntityType && settings.AllowMultiValue;

        const viewModel: EntityPickerDialogViewModel = {
          controlStatus,
          freeTextMode,
          disableAddNew,

          // additional properties for easier readability in the template
          entityTypes,
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
}
