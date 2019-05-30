import { Component, Input, OnDestroy, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { MultiItemEditFormComponent } from '../../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';
import { EavAdminUiService } from '../../../../shared/services/eav-admin-ui.service';
import { EntityDefaultListComponent } from '../entity-default-list/entity-default-list.component';
import { Helper } from '../../../../shared/helpers/helper';
import { FieldMaskService } from '../../../../../../projects/shared/field-mask.service';
// spm probably not needed
// import { EavService } from '../../../../shared/services/eav.service';
// import { EntityService } from '../../../../shared/services/entity.service';
// import { QueryService } from '../../../../shared/services/query.service';

@Component({
  selector: 'app-entity-default-main-search',
  templateUrl: './entity-default-main-search.component.html',
  styleUrls: ['./entity-default-main-search.component.scss']
})
export class EntityDefaultMainSearchComponent implements OnInit, OnDestroy {
  @ViewChild('autoCompleteInput') autoCompleteInputControl;
  @ViewChild(EntityDefaultListComponent) entityDefaultListComponent;

  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;
  @Input()
  set cache(entitiesList: EntityInfo[]) {
    this.filterSelectionList();
  }
  @Input() error = '';

  // by default data is in array format, but can be stringformat
  @Input() isStringFormat = false;

  @Output() callAvailableEntities: EventEmitter<any> = new EventEmitter<any>();

  freeTextMode = false;
  selectEntities: EntityInfo[] = [];
  filterText = '';
  contentTypeMask: FieldMaskService;
  disableAddNew = false;

  private subscriptions: Subscription[] = [];

  get availableEntities(): EntityInfo[] { return this.config.cache || []; }
  get allowMultiValue(): boolean { return this.config.field.settings.AllowMultiValue || false; }
  get enableTextEntry(): boolean { return this.config.field.settings.EnableTextEntry || false; }
  get entityType(): string { return this.config.field.settings.EntityType || ''; }
  get enableAddExisting(): boolean { return this.config.field.settings.EnableAddExisting === false ? false : true; }
  get enableCreate(): boolean { return this.config.field.settings.EnableAddExisting === false ? false : true; }
  get enableEdit(): boolean { return this.config.field.settings.EnableEdit === false ? false : true; }
  get enableRemove(): boolean { return this.config.field.settings.EnableRemove === false ? false : true; }
  get enableDelete(): boolean { return this.config.field.settings.EnableDelete || false; }
  get separator() { return this.config.field.settings.Separator || ','; }
  get disabled(): boolean { return this.group.controls[this.config.field.name].disabled; }
  get inputInvalid(): boolean { return this.group.controls[this.config.field.name].invalid; }
  get chosenEntities() { return this.entityDefaultListComponent.chosenEntities; }
  get controlValue() { return Helper.convertValueToArray(this.group.controls[this.config.field.name].value, this.separator); }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }

  getErrorMessage = () => this.validationMessagesService
    .getErrorMessage(this.group.controls[this.config.field.name], this.config, true)

  constructor(
    private eavAdminUiService: EavAdminUiService,
    private validationMessagesService: ValidationMessagesService,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.setAvailableEntities();
    this.contentTypeMask = new FieldMaskService(this.entityType, this.group.controls, this.onContentTypeMaskChange.bind(this), null);
    this.disableAddNew = !!!this.contentTypeMask.resolve();
  }

  onContentTypeMaskChange(value: any) {
    this.disableAddNew = !!!value;
  }

  ngOnDestroy() {
    this.contentTypeMask.destroy();
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  freeTextModeChange(event) {
    this.freeTextMode = !this.freeTextMode;
    // Stops dropdown from opening
    event.stopPropagation();
  }

  optionSelected(event) {
    this.addEntity(event.option.value);
    this.autoCompleteInputControl.nativeElement.value = null;
  }

  /**
   * Determine is entityID in chosenEntities
   */
  isInChosenEntities = (value): boolean => {
    if (this.chosenEntities.find(e => e.name === value)) {
      return true;
    }

    return false;
  }

  /**
   * add entity to form
   * @param value
   */
  addEntity(value: string) {
    if (value) {
      // this.selectedValue = null;
      const entityValues: string[] = [...this.controlValue];
      entityValues.push(value);
      this.patchValue(entityValues);
    }
  }

  openNewEntityDialog() {
    const contentTypeName = this.contentTypeMask ? this.contentTypeMask.resolve() : this.entityType;
    const dialogRef = this.eavAdminUiService.openItemNewEntity(this.dialog, MultiItemEditFormComponent, contentTypeName, null);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addEntity(Object.keys(result)[0]);
        this.setData();
      }
    });
  }

  private setData() {
    this.entityDefaultListComponent.setChosenEntities(this.controlValue);
    this.setAvailableEntities();
  }

  /**
   * TODO: select all entities from app
   */
  setAvailableEntities() {
    this.callAvailableEntities.emit();
  }

  filterSelectionList(newFilter?: string) {
    if (newFilter || newFilter === '') {
      this.filterText = newFilter;
    }
    if (this.filterText === '') {
      this.selectEntities = this.availableEntities;
    } else {
      this.selectEntities = this.availableEntities.filter(
        option => option.Text
          ? option.Text.toLowerCase().indexOf(this.filterText.toLowerCase()) === 0
          : option.Value.toLowerCase().indexOf(this.filterText.toLowerCase()) === 0
      );
    }
  }

  private patchValue(entityValues: string[]) {
    if (this.isStringFormat) {
      const stringEntityValue = Helper.convertArrayToString(entityValues, this.separator);
      this.group.controls[this.config.field.name].patchValue(stringEntityValue);
    } else {
      this.group.controls[this.config.field.name].patchValue(entityValues);
    }
    this.setDirty();
  }

  private setDirty() {
    this.group.controls[this.config.field.name].markAsDirty();
  }

  setTouched() {
    this.group.controls[this.config.field.name].markAsTouched();
  }

  getPlaceholder() {
    if (this.availableEntities && this.availableEntities.length > 0) {
      return 'search';
    }

    if (this.error) {
      return this.error;
    } else {
      this.translate.instant('FieldType.EntityQuery.QueryNoItems');
    }
  }
}
