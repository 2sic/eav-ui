import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription, merge, fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { Item } from '../../../../shared/models/eav';
import { ItemService } from '../../../../shared/services/item.service';
import { ContentTypeService } from '../../../../shared/services/content-type.service';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.css'],
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class EntityDefaultComponent implements Field, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('autocompleteInput') input;

  @Input() config: FieldConfig;
  group: FormGroup;

  chosenEntities: string[];
  // options: Item[];
  selectEntities: Observable<EntityInfo[]> = null;
  // entities = [];

  private availableEntities: EntityInfo[] = [];
  private entityTextDefault = 'Item not found'; // $translate.instant("FieldType.Entity.EntityNotFound");
  private subscriptions: Subscription[] = [];

  get allowMultiValue() {
    return this.config.settings.AllowMultiValue || false;
  }

  get entityType() {
    return this.config.settings.EntityType || '';
  }

  get enableAddExisting() {
    return this.config.settings.EnableAddExisting || false;
  }

  get enableCreate() {
    return this.config.settings.EnableCreate || false;
  }

  get enableEdit() {
    return this.config.settings.EnableEdit || false;
  }

  get enableRemove() {
    return this.config.settings.EnableRemove || false;
  }

  get enableDelete() {
    return this.config.settings.EnableDelete || false;
  }

  private eavConfig: EavConfiguration;

  constructor(private itemService: ItemService,
    private eavService: EavService,
    private contenttypeService: ContentTypeService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  // ngDoCheck() {
  //   console.log('DoCheck', this.config.label);
  //   // console.log('this.chosenEntities: ', [... this.group.controls[this.config.name].value]);
  // }

  ngOnInit() {
    console.log('[create]  ngOnInit EntityDefaultComponent', this.group.value);
    this.setChosenEntities();

    this.setAvailableEntities();
    console.log('get config', this.config);
    console.log('get allowMultiValue', this.allowMultiValue);
    console.log('get enableAddExisting', this.enableAddExisting);

    console.log('[create] OnInit EavFormComponent 2', this.group);
    console.log('[create] OnInit EavFormComponent 3', this.group.value);
  }

  ngAfterViewInit() {
    this.setSelectEntitiesObservables();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  optionSelected(event) {
    console.log('optionSelected:', event);
    this.addEntity(event.option.value);
    this.input.nativeElement.value = null;
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

  /**
   * Determine is entityID in chosenEntities
   */
  isInChosenEntities = (value): boolean => {
    if (this.chosenEntities.find(e => e === value)) {
      return true;
    }

    return false;
  }

  /**
   * set initial value and subscribe to form value changes
   */
  private setChosenEntities() {
    this.chosenEntities = this.group.controls[this.config.name].value || [];
    this.subscriptions.push(
      this.group.controls[this.config.name].valueChanges.subscribe((item) => {
        if (this.chosenEntities !== item) {
          this.chosenEntities = item;
        }
      })
    );
  }

  /**
   * TODO: select all entities from app
   */
  private setAvailableEntities() {
    // TODO: const ctName = contentType.resolve(); // always get the latest definition, possibly from another drop-down
    // TEMP: harcoded
    const ctName = '';

    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    let itemFilter = null;
    try {
      itemFilter = this.enableAddExisting
        ? null
        : this.group.controls[this.config.name].value;
    } catch (err) { }

    // Temp
    // TODO: need write right service - this is only for testing
    this.subscriptions.push(
      this.itemService.getAvailableEntities(this.eavConfig, itemFilter, ctName).subscribe(items => {
        console.log('availableEntities: ', items);
        this.availableEntities = [...items];
      })
    );

    // TODO: availableEntities can be title, guid and id only - map observables to that
    // this.contenttypeService.getTitleAttribute(this.config.type)
  }

  /**
   * selectEntities observe events from input autocomplete field
   */
  private setSelectEntitiesObservables() {
    if (this.input && this.selectEntities === null) {
      const eventNames = ['keyup', 'click'];
      // Merge all observables into one single stream:
      const eventStreams = eventNames.map((eventName) => {
        // return Observable.fromEvent(this.input.nativeElement, eventName);
        return fromEvent(this.input.nativeElement, eventName);
      });

      const allEvents$ = merge(...eventStreams);

      this.selectEntities = allEvents$
        .pipe(map((value: any) => this.filter(value.target.value)));
      // .do(value => console.log('test selectEntities', value));
    }

    // clear this.selectEntities if input don't exist
    // this can happen when not allowMultiValue
    if (!this.input) {
      this.selectEntities = null;
    }
  }

  // TODO: change temp harcoded name
  private filter(val: string): EntityInfo[] {
    if (val === '') {
      return this.availableEntities;
    }

    return this.availableEntities.filter(option =>
      option.Text ?
        option.Text.toLowerCase().indexOf(val.toLowerCase()) === 0
        : option.Value.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  /**
   * add entity to form
   * @param value
   */
  addEntity(value: string) {
    if (value) {
      // this.selectedValue = null;
      const entityValues: string[] = [...this.group.controls[this.config.name].value];
      entityValues.push(value);
      this.group.controls[this.config.name].patchValue(entityValues);
    }
  }

  /**
   *  open edit eav item dialog for item
   * @param value
   */
  editEntity(value: string) {
    console.log('TODO editEntity', value);

    // TODO: filter entity Id from availableEntities (we have guid)
    // Then open item edit:
    // eavAdminDialogs.openItemEditWithEntityId(id, $scope.getAvailableEntities);
  }

  /**
   * remove entity value from form
   * @param value
   */
  removeEntity(value: string) {
    const entityValues: string[] = [...this.group.controls[this.config.name].value];
    this.group.patchValue({ [this.config.name]: entityValues.filter(entity => entity !== value) });

    // this.setSelectEntitiesObservables();
  }

  /**
   * delete entity
   * @param value
   */
  deleteEntity(value: string) {
    console.log('TODO deleteEntity', value);

    // TODO: filter entity Id from availableEntities (we have guid)
    // Then delete entity item:
    // entitiesSvc.tryDeleteAndAskForce(contentType.resolve(), id, entities[0].Text).then(function () {
    //  $scope.chosenEntities.splice(index, 1);
    //  $scope.maybeReload(true);
    // });
  }

  openNewEntityDialog() {
    console.log('TODO openNewEntityDialog');

    // open the dialog for a new item
    // eavAdminDialogs.openItemNew(contentType.resolve(), reloadAfterAdd);
  }
}
