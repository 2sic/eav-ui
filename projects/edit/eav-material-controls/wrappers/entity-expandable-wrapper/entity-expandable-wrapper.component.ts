import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EntityFieldConfigSet } from '../../../shared/models/entity/entity-field-config-set';
import { EntityInfo } from '../../../shared/models/eav/entity-info';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { Helper } from '../../../shared/helpers/helper';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class EntityExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;

  dialogIsOpen = false;
  private subscriptions: Subscription[] = [];

  get availableEntities(): EntityInfo[] { return this.config.cache || []; }
  get value() { return Helper.convertValueToArray(this.group.controls[this.config.field.name].value, this.separator); }
  get id() { return `${this.config.entity.entityId}${this.config.field.index}`; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get enableAddExisting() { return this.config.field.settings.EnableAddExisting || false; }
  get entityType() { return this.config.field.settings.EntityType || ''; }
  get separator() { return this.config.field.settings.Separator || ','; }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }
  get bottomPixels() { return window.innerWidth > 600 ? '100px' : '50px'; }

  private entityTextDefault = this.translate.instant('Fields.Entity.EntityNotFound');

  constructor(
    private translate: TranslateService,
    private expandableFieldService: ExpandableFieldService,
  ) { }

  ngOnInit() {
    // this.setAvailableEntities();
    this.subscriptions.push(
      this.expandableFieldService.getObservable().subscribe(expandedFieldId => {
        const dialogShouldBeOpen = (this.config.field.index === expandedFieldId);
        if (dialogShouldBeOpen === this.dialogIsOpen) { return; }
        this.dialogIsOpen = dialogShouldBeOpen;
      }),
    );
  }

  ngAfterViewInit() { }

  // TODO: same method in entity - !!!
  getEntityText = (value: string): string => {
    if (value === null) { return 'empty slot'; }

    const entities = this.availableEntities.filter(f => f.Value === value);
    if (entities.length > 0) {
      return entities.length > 0 ? entities[0].Text :
        this.entityTextDefault ? this.entityTextDefault : value;
    }
    return value;
  }

  expandDialog() {
    angularConsoleLog('EntityExpandableWrapperComponent expandDialog');
    this.expandableFieldService.expand(true, this.config.field.index, this.config.form.formId);
  }
  closeDialog() {
    angularConsoleLog('EntityExpandableWrapperComponent closeDialog');
    this.expandableFieldService.expand(false, this.config.field.index, this.config.form.formId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}
