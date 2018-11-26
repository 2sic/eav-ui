import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  EventEmitter,
  Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription, merge, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
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
import { QueryService } from '../../../../shared/services/query.service';

@Component({
  selector: 'app-entity-default-main-search',
  templateUrl: './entity-default-main-search.component.html',
  styleUrls: ['./entity-default-main-search.component.scss']
})
export class EntityDefaultMainSearchComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('autoCompleteInput') autoCompleteInputControl;
  @ViewChild(EntityDefaultListComponent) entityDefaultListComponent;

  @Input() config: FieldConfig;
  @Input() group: FormGroup;
  @Input() error = '';

  // by default data is in array format, but can be stringformat
  @Input() isStringFormat = false;

  @Output()
  callAvailableEntities: EventEmitter<any> = new EventEmitter<any>();

  freeTextMode = false;
  selectEntities: Observable<EntityInfo[]> = null;

  private contentType: FieldMaskService;
  // private availableEntities: EntityInfo[] = [];
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  get availableEntities(): EntityInfo[] { return this.config.availableEntities || []; }

  get allowMultiValue(): boolean { return this.config.settings.AllowMultiValue || false; }

  get enableTextEntry(): boolean { return this.config.settings.EnableTextEntry || false; }

  get entityType(): string { return this.config.settings.EntityType || ''; }

  get enableAddExisting(): boolean { return this.config.settings.EnableAddExisting || true; }

  get enableCreate(): boolean { return this.config.settings.EnableCreate || true; }

  get enableEdit(): boolean { return this.config.settings.EnableEdit || true; }

  get enableRemove(): boolean { return this.config.settings.EnableRemove || true; }

  get enableDelete(): boolean { return this.config.settings.EnableDelete || false; }

  get disabled(): boolean { return this.group.controls[this.config.name].disabled; }

  get inputInvalid(): boolean { return this.group.controls[this.config.name].invalid; }

  get chosenEntities() { return this.entityDefaultListComponent.chosenEntities; }

  get separator() { return this.config.settings.Separator || ','; }

  get controlValue() { return Helper.convertValueToArray(this.group.controls[this.config.name].value, this.separator); }

  get touched() { return this.group.controls[this.config.name].touched || false; }

  getErrorMessage = () => this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config, true);

  constructor(private entityService: EntityService,
    private eavService: EavService,
    private queryService: QueryService,
    private eavAdminUiService: EavAdminUiService,
    private validationMessagesService: ValidationMessagesService,
    private dialog: MatDialog,
    private translate: TranslateService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {

    this.setAvailableEntities();
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

  // maybeReload() {
  //   console.log('call maybeReload');
  // }

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
    this.entityDefaultListComponent.setChosenEntities(this.controlValue);
    this.setAvailableEntities();
  }

  /**
   * TODO: select all entities from app
   */
  setAvailableEntities() {
    this.callAvailableEntities.emit();
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

  private patchValue(entityValues: string[]) {
    if (this.isStringFormat) {
      const stringEntityValue = Helper.convertArrayToString(entityValues, this.separator);
      this.group.controls[this.config.name].patchValue(stringEntityValue);
    } else {
      this.group.controls[this.config.name].patchValue(entityValues);
    }
    this.setDirty();
  }

  private setDirty() {
    this.group.controls[this.config.name].markAsDirty();
  }

  setTouched() {
    this.group.controls[this.config.name].markAsTouched();
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
