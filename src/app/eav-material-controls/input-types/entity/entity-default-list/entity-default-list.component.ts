import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EavAdminUiService } from '../../../../shared/services/eav-admin-ui.service';
import { MultiItemEditFormComponent } from '../../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';
import { EavService } from '../../../..//shared/services/eav.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { Helper } from '../../../../shared/helpers/helper';

@Component({
  selector: 'app-entity-default-list',
  templateUrl: './entity-default-list.component.html',
  styleUrls: ['./entity-default-list.component.scss']
})
export class EntityDefaultListComponent implements OnInit, OnDestroy {

  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;
  @Input() autoCompleteInputControl: any;
  // by default data is in array format, but can be stringformat
  @Input() isStringFormat = false;
  @Input() freeTextMode = false;

  @Output()
  callAvailableEntities: EventEmitter<any> = new EventEmitter<any>();

  chosenEntities: any[];

  // private contentType: FieldMaskService;
  private entityTextDefault = this.translate.instant('FieldType.Entity.EntityNotFound');
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  get availableEntities(): EntityInfo[] { return this.config.cache || []; }
  get allowMultiValue() { return this.config.field.settings.AllowMultiValue || false; }
  get entityType() { return this.config.field.settings.EntityType || ''; }
  // get enableAddExisting() { return this.config.currentFieldConfig.settings.EnableAddExisting || true; }
  get enableCreate() { return this.config.field.settings.EnableCreate === false ? false : true; }
  get enableEdit() { return this.config.field.settings.EnableEdit === false ? false : true; }
  get enableRemove() { return this.config.field.settings.EnableRemove === false ? false : true; }
  get enableDelete() { return this.config.field.settings.EnableDelete || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }
  // get inputInvalid() { return this.group.controls[this.config.currentFieldConfig.name].invalid; }
  get dndListConfig() { return { allowedTypes: [this.config.field.name] }; }
  get separator() { return this.config.field.settings.Separator || ','; }
  get controlValue() { return Helper.convertValueToArray(this.group.controls[this.config.field.name].value, this.separator); }
  isFreeTextOrNotFound(entityValue: string) {
    return this.availableEntities.find(f => f.Value === entityValue) ? false : true;
  }

  constructor(
    private entityService: EntityService,
    private eavService: EavService,
    private eavAdminUiService: EavAdminUiService,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.setChosenEntities(this.controlValue);
    this.chosenEntitiesSubscribeToChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  getEntityText(entityGuidOrStringValue: string): string {
    if (entityGuidOrStringValue === null) { return 'empty slot'; }

    const fallback = this.isStringFormat
      ? entityGuidOrStringValue
      : this.entityTextDefault ? this.entityTextDefault : entityGuidOrStringValue;

    const entity = this.availableEntities.find(f => f.Value === entityGuidOrStringValue);
    return entity ? entity.Text : fallback;
  }

  private getEntityId(value): string {
    if (value === null) { return 'empty slot'; }

    const entity = this.availableEntities.find(f => f.Value === value);
    return entity ? entity.Id : value;
  }

  /**
   *  open edit eav item dialog for item
   * @param value
   */
  edit(value: string) {
    const entityId = this.getEntityId(value);
    const dialogRef = this.eavAdminUiService.openItemEditWithEntityId(this.dialog, MultiItemEditFormComponent, entityId);

    dialogRef.afterClosed().subscribe(result => {
      this.setData();
    });
  }

  /**
   * remove entity value from form
   * @param value
   */
  removeSlot(item: string, index: number) {
    const entityValues: string[] = [...this.controlValue];
    entityValues.splice(index, 1);

    this.patchValue(entityValues);
    if (entityValues.length === 0) {
      // focus if list dont have any alement more
      setTimeout(() => {
        this.autoCompleteInputControl.nativeElement.focus();
      });
    }
  }

  /**
   * delete entity
   * @param value
   */
  deleteItemInSlot(item: string, index: number) {
    if (this.entityType === '') {
      alert('delete not possible - no type specified in entity field configuration');
      return;
    }
    const entity: EntityInfo = this.availableEntities.find(f => f.Value === item);
    const id = entity.Id;
    const title = entity.Text;
    // TODO:contentType.resolve()
    const contentTypeTemp = this.entityType; // contentType.resolve()
    // Then delete entity item:
    this.entityService.delete(this.eavConfig.appId, contentTypeTemp, id, title, false).subscribe(result => {

      if (result === null || result.status >= 200 && result.status < 300) {
        // TODO: make message
        this.removeSlot(item, index);
        this.setData();
      } else {
        // TODO: message success
        this.entityService.delete(this.eavConfig.appId, contentTypeTemp, id, title, true).subscribe(items => {
          this.removeSlot(item, index);
          this.setData();
        });
      }
    });
  }

  levelUp(value: string, index: number) {
    const entityValues: string[] = [...this.controlValue];
    entityValues.splice(index, 1);
    entityValues.splice(index - 1, 0, ...[value]);
    this.patchValue(entityValues);
  }

  levelDown(value: string, index: number) {
    const entityValues: string[] = [...this.controlValue];
    entityValues.splice(index, 1);
    entityValues.splice(index + 1, 0, ...[value]);
    this.patchValue(entityValues);
  }


  removeItem(item: any, list: any[]): void {
    const oldIndex = list.indexOf(item);
    const newIndex = list.findIndex(i => i.name === item.name);
    list.splice(list.indexOf(item), 1);
    // TEMP FIX Sorting list by moving an item up in the list
    // https://github.com/misha130/ngx-drag-and-drop-lists/issues/30
    if (newIndex < oldIndex) {
      list.splice(newIndex - 1, 0, item);
      list.splice(newIndex + 1, 1);
    }

    const entityList = this.mapFromNameListToEntityList(list);
    this.patchValue(entityList);
  }

  private setData() {
    const chosenListIsChanged = this.setChosenEntities(this.controlValue);
    if (chosenListIsChanged) { this.setDirty(); }
    // TODO: call this in parent
    // this.setAvailableEntities();
    this.callAvailableEntities.emit();
  }

  /**
   * set chosen entities list and if change return true
   * @param values
   */
  private setChosenEntities(values: string[]): boolean {
    const updatedValues = this.mapFromEntityListToNameList(values);
    if (this.chosenEntities !== updatedValues) {
      this.chosenEntities = updatedValues;
      return true;
    }
    return false;
  }

  private setDirty() {
    this.group.controls[this.config.field.name].markAsDirty();
  }

  /**
  * subscribe to form value changes
  */
  private chosenEntitiesSubscribeToChanges() {
    this.subscriptions.push(this.group.controls[this.config.field.name].valueChanges.subscribe((item) => {
      this.setChosenEntities(Helper.convertValueToArray(item, this.separator));
    }));
    this.subscriptions.push(this.eavService.formSetValueChange$.subscribe(formSet => {
      // check if update is for current entity
      if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }

      this.setChosenEntities(this.controlValue);
    }));
  }

  private mapFromEntityListToNameList = (entityList: string[]): any[] => {
    if (!entityList) {
      return [];
    }
    return entityList.map(v => ({ 'name': v, 'type': this.config.field.name }));
  }

  private mapFromNameListToEntityList = (nameList: any[]): string[] => {
    if (!nameList) {
      return [];
    }
    return nameList.map(v => v.name);
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
}
