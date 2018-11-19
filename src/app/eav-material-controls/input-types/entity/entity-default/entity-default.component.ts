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
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EntityService } from '../../../../shared/services/entity.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { MultiItemEditFormComponent } from '../../../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.component';
import { EavAdminUiService } from '../../../../shared/services/eav-admin-ui.service';
import { FieldMaskService } from '../../../../shared/services/field-mask.service';
import { TranslateService } from '@ngx-translate/core';
import { EntityDefaultListComponent } from '../entity-default-list/entity-default-list.component';
import { Helper } from '../../../../shared/helpers/helper';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.scss'],
})
@InputType({
  // wrapper: ['app-eav-localization-wrapper', 'app-entity-expandable-wrapper'],
})
export class EntityDefaultComponent implements Field, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('autoCompleteInput') autoCompleteInputControl;
  @ViewChild(EntityDefaultListComponent) entityDefaultListComponent;

  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  // @Input() enableTextEntry = false;

  freeTextMode = false;
  selectEntities: Observable<EntityInfo[]> = null;

  private contentType: FieldMaskService;
  private availableEntities: EntityInfo[] = [];
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  get allowMultiValue(): boolean { return this.config.settings.AllowMultiValue || false; }

  // For string-dropdown-query
  get enableTextEntry(): boolean { return this.config.settings.EnableTextEntry || false; }

  get entityType(): string { return this.config.settings.EntityType || ''; }

  get enableAddExisting(): boolean { return this.config.settings.EnableAddExisting || true; }

  get enableCreate(): boolean { return this.config.settings.EnableCreate || true; }

  get enableEdit(): boolean { return this.config.settings.EnableEdit || true; }

  get enableRemove(): boolean { return this.config.settings.EnableRemove || true; }

  get enableDelete(): boolean { return this.config.settings.EnableDelete || false; }
  // TODO:
  // get enableTextEntry() { return this.config.settings.EnableTextEntry || false; }

  get disabled(): boolean { return this.group.controls[this.config.name].disabled; }

  get inputInvalid(): boolean { return this.group.controls[this.config.name].invalid; }

  get dndListConfig() { return { allowedTypes: [this.config.name] }; }

  get chosenEntities() { return this.entityDefaultListComponent.chosenEntities; }

  get separator() { return this.config.settings.Separator || ','; }

  get controlValue() { return Helper.convertValueToArray(this.group.controls[this.config.name].value, this.separator); }

  getErrorMessage = () => this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config, true);

  constructor(private entityService: EntityService,
    private eavService: EavService,
    private eavAdminUiService: EavAdminUiService,
    private validationMessagesService: ValidationMessagesService,
    private dialog: MatDialog,
    private translate: TranslateService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {

    // Initialize entities
    const sourceMask = this.entityType || null;
    // this will contain the auto-resolve type (based on other contentType-field)
    this.contentType = new FieldMaskService(sourceMask, this.maybeReload, null, null);
    // don't get it, it must be blank to start with, so it will be loaded at least 1x lastContentType = contentType.resolve();
    // this.setData();
    this.setAvailableEntities();
    // this.chosenEntitiesSubscribeToChanges();
  }

  ngAfterViewInit() {
    this.setSelectEntitiesObservables();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  freeTextModeChange(event) {
    this.freeTextMode = !this.freeTextMode;
    // Stops dropdown from opening
    event.stopPropagation();
  }

  maybeReload() {
    console.log('call maybeReload');
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
      const entityValues: string[] = [...this.group.controls[this.config.name].value];
      entityValues.push(value);
      this.group.controls[this.config.name].patchValue(entityValues);
    }
  }

  openNewEntityDialog() {
    // open the dialog for a new item
    // TODO: finisih this - bug form closed when new entity closed
    // eavAdminDialogs.openItemNew(contentType.resolve(), reloadAfterAdd);

    const dialogRef = this.eavAdminUiService.openItemNewEntity(this.dialog, MultiItemEditFormComponent, this.entityType);

    dialogRef.afterClosed().subscribe(result => {
      // dialogRef.componentInstance;
      if (result) {
        this.addEntity(Object.keys(result)[0]);
        this.setData();
      }
    });
  }

  private setData() {
    // this.setChosenEntities(this.group.controls[this.config.name].value);
    this.entityDefaultListComponent.setChosenEntities(this.controlValue);
    this.setAvailableEntities();
  }

  /**
   * TODO: select all entities from app
   */
  setAvailableEntities() {
    // TODO:
    // const ctName = this.contentType.resolve(); // always get the latest definition, possibly from another drop-down
    // TEMP: harcoded
    const ctName = this.entityType;

    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    let itemFilter = null;
    try {
      itemFilter = this.enableAddExisting
        ? null
        : this.controlValue;
    } catch (err) { }

    this.entityService.getAvailableEntities(this.eavConfig.appId, itemFilter, ctName).subscribe(items => {
      this.availableEntities = [...items];
    });
  }



  /**
   * selectEntities observe events from input autocomplete field
   */
  private setSelectEntitiesObservables() {
    if (this.autoCompleteInputControl && this.selectEntities === null) {
      const eventNames = ['keyup', 'click'];
      // Merge all observables into one single stream:
      const eventStreams = eventNames.map((eventName) => {
        // return Observable.fromEvent(this.input.nativeElement, eventName);
        return fromEvent(this.autoCompleteInputControl.nativeElement, eventName);
      });

      const allEvents$ = merge(...eventStreams);

      this.selectEntities = allEvents$
        .pipe(map((value: any) => {
          return this.filter(value.target.value);
        }));
      // .do(value => console.log('test selectEntities', value));
    }

    // clear this.selectEntities if input don't exist
    // this can happen when not allowMultiValue
    if (!this.autoCompleteInputControl) {
      this.selectEntities = null;
    }
  }

  private filter = (val: string): EntityInfo[] => {
    if (val === '') {
      return this.availableEntities;
    }

    return this.availableEntities.filter(option =>
      option.Text ?
        option.Text.toLowerCase().indexOf(val.toLowerCase()) === 0
        : option.Value.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }
}
