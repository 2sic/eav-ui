import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { EntityPickerPreviewViewModel } from './picker-preview.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { GeneralHelpers } from '../../../../shared/helpers';
import { PickerData } from '../picker-data';
import { ContentTypesService } from 'projects/eav-ui/src/app/app-administration/services';
import { eavConstants } from 'projects/eav-ui/src/app/shared/constants/eav.constants';

@Component({
  selector: 'app-picker-preview',
  templateUrl: './picker-preview.component.html',
  styleUrls: ['./picker-preview.component.scss'],
})
export class PickerPreviewComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  viewModel$: Observable<EntityPickerPreviewViewModel>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
    private contentTypesService: ContentTypesService,
  ) {
    super();
  }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const selectedItems$ = this.pickerData.selectedItems$;
    const freeTextMode$ = state.freeTextMode$;
    const controlStatus$ = state.controlStatus$;
    const disableAddNew$ = state.disableAddNew$;

    const contentTypes$ = this.contentTypesService.retrieveContentTypes(eavConstants.scopes.default.name);

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableTextEntry: settings.EnableTextEntry,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.viewModel$ = combineLatest([
      selectedItems$, freeTextMode$, settings$, controlStatus$, disableAddNew$, contentTypes$,
    ]).pipe(
      map(([
        selectedItems, freeTextMode, settings, controlStatus, disableAddNew, contentTypes,
      ]) => {
        const entityTypes = settings.EntityType
          ? settings.EntityType.split(',').map((guid: string) => ({ label: contentTypes.find(ct => ct.StaticName === guid)?.Label, guid }))
          : [];
        const leavePlaceForButtons = (settings.EntityType && settings.EnableCreate) || settings.AllowMultiValue;
        const showAddNewEntityButton = settings.EntityType && settings.EnableCreate;
        const showGoToListDialogButton = settings.AllowMultiValue;

        const viewModel: EntityPickerPreviewViewModel = {
          selectedItems,
          freeTextMode,
          enableTextEntry: settings.EnableTextEntry,
          controlStatus,
          disableAddNew,

          entityTypes,
          leavePlaceForButtons,
          showAddNewEntityButton,
          showGoToListDialogButton,
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

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}
