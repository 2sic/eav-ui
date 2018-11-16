import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { TranslateService } from '@ngx-translate/core';
import { EavAdminUiService } from '../../../../shared/services/eav-admin-ui.service';
import { MultiItemEditFormComponent } from '../../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';
import { MatDialog } from '@angular/material';
import { EavService } from '../../../..//shared/services/eav.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';

@Component({
  selector: 'app-entity-default-list',
  templateUrl: './entity-default-list.component.html',
  styleUrls: ['./entity-default-list.component.scss']
})
export class EntityDefaultListComponent implements OnInit, OnDestroy {

  @Input() config: FieldConfig;
  @Input() group: FormGroup;
  @Input() availableEntities: EntityInfo[];
  @Input() autoCompleteInputControl: any;

  chosenEntities: any[];

  // private contentType: FieldMaskService;
  // private availableEntities: EntityInfo[] = [];
  private entityTextDefault = this.translate.instant('FieldType.Entity.EntityNotFound');
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  get allowMultiValue() { return this.config.settings.AllowMultiValue || false; }

  get entityType() { return this.config.settings.EntityType || ''; }

  // get enableAddExisting() { return this.config.settings.EnableAddExisting || true; }

  get enableCreate() { return this.config.settings.EnableCreate || true; }

  get enableEdit() { return this.config.settings.EnableEdit || true; }

  get enableRemove() { return this.config.settings.EnableRemove || true; }

  get enableDelete() { return this.config.settings.EnableDelete || false; }

  get disabled() { return this.group.controls[this.config.name].disabled; }

  // get inputInvalid() { return this.group.controls[this.config.name].invalid; }

  get dndListConfig() { return { allowedTypes: [this.config.name] }; }

  constructor(private entityService: EntityService,
    private eavService: EavService,
    private eavAdminUiService: EavAdminUiService,
    private dialog: MatDialog,
    private translate: TranslateService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.setChosenEntities(this.group.controls[this.config.name].value);
    this.chosenEntitiesSubscribeToChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  getEntityText = (value): string => {
    if (value === null) {
      return 'empty slot';
    }
    const entities = this.availableEntities.filter(f => f.Value === value);
    if (entities.length > 0) {
      return entities.length > 0 ? entities[0].Text :
        this.entityTextDefault ? this.entityTextDefault : value;
    }

    return value;
  }

  private getEntityId = (value): string => {
    if (value === null) {
      return 'empty slot';
    }
    const entities = this.availableEntities.filter(f => f.Value === value);
    if (entities.length > 0) {
      return entities.length > 0 ? entities[0].Id : value;
    }

    return value;
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
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    entityValues.splice(index, 1);
    // this.group.patchValue({ [this.config.name]: entityValues.filter(entity => entity !== value) });
    this.group.controls[this.config.name].patchValue(entityValues);

    if (entityValues.length === 0) {
      // focus if list dont have any alement more
      setTimeout(() => this.autoCompleteInputControl.nativeElement.focus());
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
    const entities: EntityInfo[] = this.availableEntities.filter(f => f.Value === item);
    const id = entities[0].Id;
    const title = entities[0].Text;
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
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    entityValues.splice(index, 1);
    entityValues.splice(index - 1, 0, ...[value]);
    this.group.controls[this.config.name].patchValue(entityValues);
  }

  levelDown(value: string, index: number) {
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    entityValues.splice(index, 1);
    entityValues.splice(index + 1, 0, ...[value]);
    this.group.controls[this.config.name].patchValue(entityValues);
  }


  removeItem(item: any, list: any[]): void {
    const oldIndex = list.indexOf(item);
    const newIndex = list.findIndex(i => i.name === item.name);
    list.splice(list.indexOf(item), 1);
    // TEMP FIX Sorting list by moving an item up the list
    // https://github.com/misha130/ngx-drag-and-drop-lists/issues/30
    if (newIndex < oldIndex) {
      list.splice(newIndex - 1, 0, item);
      list.splice(newIndex + 1, 1);
    }

    const entityList = this.mapFromNameListToEntityList(list);
    this.group.controls[this.config.name].patchValue(entityList);
  }

  private setData() {
    this.setChosenEntities(this.group.controls[this.config.name].value);
    // this.setAvailableEntities();
  }

  private setChosenEntities(values: string[]) {
    const updatedValues = this.mapFromEntityListToNameList(values);
    if (this.chosenEntities !== updatedValues) {
      this.chosenEntities = updatedValues;
    }
  }

  /**
  * subscribe to form value changes
  */
  private chosenEntitiesSubscribeToChanges() {
    this.subscriptions.push(this.group.controls[this.config.name].valueChanges.subscribe((item) => {
      this.setChosenEntities(item);
    }));
    this.subscriptions.push(this.eavService.formSetValueChange$.subscribe((item) => {
      this.setChosenEntities(this.group.controls[this.config.name].value);
    }));
  }

  private mapFromEntityListToNameList = (entityList: string[]): any[] => {
    if (!entityList) {
      return [];
    }
    return entityList.map(v => ({ 'name': v, 'type': this.config.name }));
  }

  private mapFromNameListToEntityList = (nameList: any[]): string[] => {
    if (!nameList) {
      return [];
    }
    return nameList.map(v => v.name);
  }
}
