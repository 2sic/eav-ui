import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EavService } from '../../../..//shared/services/eav.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { Helper } from '../../../../shared/helpers/helper';
import { EditForm } from '../../../../../ng-dialogs/src/app/app-administration/shared/models/edit-form.model';

@Component({
  selector: 'app-entity-default-list',
  templateUrl: './entity-default-list.component.html',
  styleUrls: ['./entity-default-list.component.scss']
})
export class EntityDefaultListComponent implements OnInit, OnDestroy {
  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;
  @Input() autoCompleteInputControl: any;
  /** By default data is in array format, but can be string format */
  @Input() isStringFormat = false;
  @Input() freeTextMode = false;
  @Output() callAvailableEntities: EventEmitter<any> = new EventEmitter<any>();

  chosenEntities: any[];

  // private contentType: FieldMaskService;
  private entityTextDefault = this.translate.instant('Fields.Entity.EntityNotFound');
  private subscription = new Subscription();
  private hasChild: boolean;
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
  isFreeTextOrNotFound(entityValue: string) { return this.availableEntities.find(f => f.Value === entityValue) ? false : true; }

  constructor(
    private entityService: EntityService,
    private eavService: EavService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.setChosenEntities(this.controlValue);
    this.chosenEntitiesSubscribeToChanges();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  getEntityText(entityGuidOrStringValue: string): string {
    if (entityGuidOrStringValue === null) { return 'empty slot'; }

    const fallback = this.isStringFormat
      ? entityGuidOrStringValue
      : this.entityTextDefault ? this.entityTextDefault : entityGuidOrStringValue;

    // entity value is converted to string in Helper.convertArrayToString in patchValue and that is why we have to convert it here too
    const entity = this.availableEntities.find(f => f.Value.toString() === entityGuidOrStringValue);
    return entity ? entity.Text : fallback;
  }

  private getEntityId(value: string): string {
    if (value === null) { return 'empty slot'; }

    const entity = this.availableEntities.find(f => f.Value === value);
    return entity ? entity.Id : value;
  }

  stopDnD(event: MouseEvent) {
    event.stopPropagation();
  }

  /** Open edit eav item dialog for item */
  edit(value: string) {
    const entityId = this.getEntityId(value);
    const form: EditForm = {
      items: [{ EntityId: entityId }],
    };
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  /** Remove entity value from form */
  removeSlot(item: string, index: number) {
    const entityValues: string[] = [...this.controlValue];
    entityValues.splice(index, 1);

    this.patchValue(entityValues);
    if (entityValues.length === 0) {
      // focus if list dont have any alement more
      setTimeout(() => { this.autoCompleteInputControl.nativeElement.focus(); });
    }
  }

  /** Delete entity */
  deleteItemInSlot(item: string, index: number) {
    if (this.entityType === '') { alert('Delete not possible - no type specified in entity field configuration'); return; }

    const entity: EntityInfo = this.availableEntities.find(f => f.Value === item);
    const id = entity.Id;
    const title = entity.Text;
    const contentType = this.entityType; // TODO: contentType.resolve()

    let entityDelete$ = this.entityService.delete(this.eavConfig.appId, contentType, id, title, false);
    if (!entityDelete$) { return; }

    entityDelete$.subscribe(result => {
      if (result === null || result.status >= 200 && result.status < 300) {
        this.removeSlot(item, index);
        this.setData();
        entityDelete$ = null;
      } else {
        entityDelete$ = this.entityService.delete(this.eavConfig.appId, contentType, id, title, true);
        if (!entityDelete$) { return; }

        entityDelete$.subscribe(items => {
          this.removeSlot(item, index);
          this.setData();
          entityDelete$ = null;
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

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.chosenEntities, event.previousIndex, event.currentIndex);
    const entityList = this.mapFromNameListToEntityList(this.chosenEntities);
    this.patchValue(entityList);
  }

  private setData() {
    const chosenListIsChanged = this.setChosenEntities(this.controlValue);
    if (chosenListIsChanged) { this.setDirty(); }
    // TODO: call this in parent
    // this.setAvailableEntities();
    this.callAvailableEntities.emit();
  }

  /** Set chosen entities list and if change return true */
  setChosenEntities(values: string[]): boolean {
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

  /** Subscribe to form value changes */
  private chosenEntitiesSubscribeToChanges() {
    this.subscription.add(this.group.controls[this.config.field.name].valueChanges.subscribe((item) => {
      this.setChosenEntities(Helper.convertValueToArray(item, this.separator));
    }));
    this.subscription.add(this.eavService.formSetValueChange$.subscribe(formSet => {
      // check if update is for current form
      if (formSet.formId !== this.config.form.formId) { return; }
      // check if update is for current entity
      if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }
      this.setChosenEntities(this.controlValue);
    }));
  }

  private mapFromEntityListToNameList = (entityList: string[]): any[] => {
    if (!entityList) { return []; }
    return entityList.map(v => ({ name: v, type: this.config.field.name }));
  }

  private mapFromNameListToEntityList = (nameList: any[]): string[] => {
    if (!nameList) { return []; }
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

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          this.setData();
        }
      })
    );
  }

}
