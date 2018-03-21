import { Component, OnInit, Input, ChangeDetectionStrategy, DoCheck, SimpleChange } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavEntity, Item } from '../../../../shared/models/eav';
import { EavType } from '../../../../shared/models/eav/eav-type';
import { ItemService } from '../../../../shared/services/item.service';
import { Observable } from 'rxjs/Observable';
import { noUndefined } from '@angular/compiler/src/util';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class EntityDefaultComponent implements Field, OnInit, DoCheck {
  @Input() config: FieldConfig;
  group: FormGroup;
  getEntityText1;
  chosenEntities: number[];
  availableEntities: Item[] = []; // text name of entity and value is guid of entity
  selectEntities: Item[] = [];
  entityTextDefault = 'Item not found'; // $translate.instant("FieldType.Entity.EntityNotFound");
  selectedValue;

  // set selectedValue(value: string) {
  //   if (value) {
  //     const entityValues: string[] = [...this.group.controls[this.config.name].value];
  //     entityValues.push(value);
  //     this.group.patchValue({ [this.config.name]: entityValues });
  //     this.setChosenEntities();
  //     // this.selectedValue = null;
  //     this.selectedValue = null;
  //   }
  // }

  // set selectedValue(value: any) {
  //   if (value) {
  //     this.selectedValue = undefined;
  //   }

  // }

  onChange(value: string) {
    if (value) {
      // this.selectedValue = null;

      const entityValues: string[] = [...this.group.controls[this.config.name].value];
      entityValues.push(value);
      this.group.patchValue({ [this.config.name]: entityValues });
      this.selectedValue = null;
      this.setChosenEntities();
    }
  }

  get allowMultiValue() {
    return this.config.settings.AllowMultiValue ? this.config.settings.AllowMultiValue.values[0].value : false;
  }

  get enableAddExisting() {
    return this.config.settings.EnableAddExisting ? this.config.settings.EnableAddExisting.values[0].value : false;
  }

  get enableCreate() {
    return this.config.settings.EnableCreate ? this.config.settings.EnableCreate.values[0].value : false;
  }
  // get chosenEntities() {
  //   return this.group.controls[this.config.name].value;
  // }
  constructor(private itemService: ItemService) {
  }

  ngDoCheck() {
    console.log('DoCheck', this.config.label);
    // console.log('this.chosenEntities: ', [... this.group.controls[this.config.name].value]);
  }

  ngOnInit() {
    // TODO:

    // Init values for model if we dont have entity in model (call service to call list of entities)

    // ContentType = list of content types of entites - can be only one or array - example 'Autors' from EntityType
    // use Field Mask

    // SelectedEntities - [] and availableEntities = []

    // chosenEntities - list of entities from formcontrolVlaue

    // this.chosenEntities = [];
    // this.chosenEntities.push(... this.group.controls[this.config.name].value);
    this.setChosenEntities();
    // console.log('this.chosenEntities: ', this.chosenEntities);

    // Temp
    this.itemService.selectAllItems().subscribe(items => {
      this.availableEntities = this.selectEntities = [...items];
    });
  }
  // TODO: to many detect changes ???
  getEntityText = (entityId): string => {
    // console.log('getEntityText', entityId);
    if (entityId === null) {
      return 'empty slot'; // todo: i18n
    }
    const entities = this.availableEntities.filter(f => f.entity.guid === entityId);
    if (entities.length > 0) {
      // TODO: Need read which attribut is title !!! Harcoded 'name' for now.
      if (entities[0].entity.attributes['Name']) {
        return entities.length > 0 ? entities[0].entity.attributes['Name'].values[0].value :
          this.entityTextDefault ? this.entityTextDefault : entityId;
      }
    }

    return entityId;
  }

  isInChosenEntities = (entityID): boolean => {
    if (this.chosenEntities.find(id => id === entityID)) {
      return true;
    }

    return false;
  }

  setChosenEntities() {
    this.chosenEntities = this.group.controls[this.config.name].value;
  }
}

