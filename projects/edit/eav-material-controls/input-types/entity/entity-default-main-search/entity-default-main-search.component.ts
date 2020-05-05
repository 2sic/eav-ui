import { Component, Input, OnDestroy, OnInit, ViewChild, EventEmitter, Output, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityDefaultListComponent } from '../entity-default-list/entity-default-list.component';
import { Helper } from '../../../../shared/helpers/helper';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { GlobalConfigurationService } from '../../../../shared/services/global-configuration.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { EditForm } from '../../../../../ng-dialogs/src/app/app-administration/shared/models/edit-form.model';
import { ExpandableFieldService } from '../../../../shared/services/expandable-field.service';

@Component({
  selector: 'app-entity-default-main-search',
  templateUrl: './entity-default-main-search.component.html',
  styleUrls: ['./entity-default-main-search.component.scss']
})
export class EntityDefaultMainSearchComponent implements OnInit, OnDestroy {
  @ViewChild('autoCompleteInput') autoCompleteInputControl: ElementRef;
  @ViewChild(EntityDefaultListComponent, { static: true }) entityDefaultListComponent: EntityDefaultListComponent;

  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;
  @Input()
  set cache(entitiesList: EntityInfo[]) {
    this.filterSelectionList();
  }
  @Input() error = '';
  /** By default data is in array format, but can be string format */
  @Input() isStringFormat = false;
  @Output() callAvailableEntities: EventEmitter<any> = new EventEmitter<any>();

  freeTextMode = false;
  selectEntities: EntityInfo[] = [];
  filterText = '';
  contentTypeMask: FieldMaskService;
  disableAddNew = false;
  debugEnabled$: Observable<boolean>;
  debugEnabled = false;

  private subscription = new Subscription();
  private hasChild: boolean;

  get availableEntities(): EntityInfo[] { return this.config.cache || []; }
  get allowMultiValue(): boolean { return this.config.field.settings.AllowMultiValue || false; }
  get enableTextEntry(): boolean { return this.config.field.settings.EnableTextEntry || false; }
  get entityType(): string { return this.config.field.settings.EntityType || ''; }
  get enableAddExisting(): boolean { return this.config.field.settings.EnableAddExisting === false ? false : true; }
  get enableCreate(): boolean { return this.config.field.settings.EnableCreate === false ? false : true; }
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
    private validationMessagesService: ValidationMessagesService,
    private translate: TranslateService,
    private globalConfigurationService: GlobalConfigurationService,
    private router: Router,
    private route: ActivatedRoute,
    private expandableFieldService: ExpandableFieldService,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild;
  }

  ngOnInit() {
    this.setAvailableEntities();
    this.contentTypeMask = new FieldMaskService(this.entityType, this.group.controls, this.onContentTypeMaskChange.bind(this), null);
    this.disableAddNew = !this.contentTypeMask.resolve();
    // subscribe to debug enabled changes
    this.debugEnabled$ = this.globalConfigurationService.getDebugEnabled();
    this.subscription.add(
      this.debugEnabled$.subscribe(debugEnabled => {
        this.debugEnabled = debugEnabled;
      })
    );
    this.refreshOnChildClosed();
  }

  onContentTypeMaskChange(value: any) {
    this.disableAddNew = !!!value;
  }

  ngOnDestroy() {
    this.contentTypeMask.destroy();
    this.subscription.unsubscribe();
    this.subscription = null;
  }

  freeTextModeChange(event: Event) {
    // Stops dropdown from opening
    event.stopPropagation();
    this.freeTextMode = !this.freeTextMode;
  }

  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.addEntity(event.option.value);
    this.autoCompleteInputControl.nativeElement.value = null;
  }

  /** Determine is entityID in chosenEntities */
  isInChosenEntities = (value: string): boolean => {
    if (this.chosenEntities.find((e: any) => e.name === value)) { return true; }
    return false;
  }

  /** Add entity to form */
  addEntity(value: string) {
    if (value) {
      const entityValues: string[] = [...this.controlValue];
      entityValues.push(value);
      this.patchValue(entityValues);
    }
  }

  insertNull() {
    const entityValues = [...this.controlValue];
    entityValues.push(null);
    this.patchValue(entityValues);
  }

  openNewEntityDialog() {
    const contentTypeName = this.contentTypeMask ? this.contentTypeMask.resolve() : this.entityType;
    const form: EditForm = {
      items: [{ ContentTypeName: contentTypeName }],
    };
    this.expandableFieldService.openWithUpdate(this.config.field.index, form);
  }

  private setData() {
    this.entityDefaultListComponent.setChosenEntities(this.controlValue);
    this.setAvailableEntities();
  }

  /** TODO: select all entities from app */
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
          ? option.Text.toLowerCase().includes(this.filterText.toLowerCase())
          // input (filterText) works with string but value can be a number so we have to convert it to string for comparison to work
          : option.Value.toString().toLowerCase().includes(this.filterText.toLowerCase())
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
    if (this.availableEntities && this.availableEntities.length > 0) { return 'search'; }

    if (this.error) {
      return this.error;
    } else {
      this.translate.instant('Fields.EntityQuery.QueryNoItems');
    }
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild;
        if (!this.hasChild && hadChild) {
          const expandedFieldId = this.route.snapshot.paramMap.get('expandedFieldId');
          const updateFieldId = this.route.snapshot.paramMap.get('updateFieldId');
          const thisId = this.config.field.index.toString();

          if (expandedFieldId != null && expandedFieldId !== thisId) { return; }
          if (updateFieldId != null && updateFieldId !== thisId) { return; }

          const navigation = this.router.getCurrentNavigation();
          const editResult = navigation.extras?.state;
          if (editResult) {
            this.addEntity(Object.keys(editResult)[0]);
          }
          this.setData();

          if (updateFieldId != null && updateFieldId === thisId) {
            this.expandableFieldService.openWithUpdate(this.config.field.index, null);
          }
        }
      })
    );
  }

}
