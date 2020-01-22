import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EntityFieldConfigSet } from '../../../shared/models/entity/entity-field-config-set';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { EntityInfo } from '../../../shared/models/eav/entity-info';
import { EavService } from '../../../shared/services/eav.service';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { Helper } from '../../../shared/helpers/helper';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class EntityExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: EntityFieldConfigSet;
  group: FormGroup;

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
    private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
    private translate: TranslateService,
    private languageInstanceService: LanguageInstanceService,
  ) {
  }

  ngOnInit() {
    // this.setAvailableEntities();
    this.subscriptions.push(
      this.config.field.expanded.subscribe(expanded => {
        this.dialogIsOpen = expanded;
        if (expanded) {
          this.languageInstanceService.updateHideHeader(this.config.form.formId, true);
        } else {
          this.languageInstanceService.updateHideHeader(this.config.form.formId, false);
        }
      }),
    );
  }

  ngAfterViewInit() { }

  // TODO: same method in entity - !!!
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

  expandDialog() {
    console.log('EntityExpandableWrapperComponent expandDialog');
    this.config.field.expanded.next(true);
  }
  closeDialog() {
    console.log('EntityExpandableWrapperComponent closeDialog');
    this.config.field.expanded.next(false);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }
}
