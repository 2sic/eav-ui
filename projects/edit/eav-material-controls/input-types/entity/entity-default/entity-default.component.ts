import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EntityService } from '../../../../shared/services/entity.service';
import { FieldMaskService } from '../../../../../shared/field-mask.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.scss'],
})
@InputType({})
export class EntityDefaultComponent implements Field, OnInit, OnDestroy {
  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;

  availableEntities: EntityInfo[] = [];

  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;
  private fieldMaskService: FieldMaskService;

  get entityType(): string { return this.config.field.settings.EntityType || ''; }

  get enableAddExisting(): boolean { return this.config.field.settings.EnableAddExisting === false ? false : true; }

  get separator() { return this.config.field.settings.Separator || ','; }

  get value() { return this.group.controls[this.config.field.name].value; }

  constructor(
    private entityService: EntityService,
    private eavService: EavService,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    // Initialize url parameters mask
    const sourceMask = this.entityType || null;
    // this will contain the auto-resolve url parameters
    this.fieldMaskService = new FieldMaskService(sourceMask, this.group.controls, null, null);

    // get all mask field and subcribe to changes. On every change getAvailableEntities.
    this.subscribeToMaskFieldsChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  callAvailableEntities(event: Event) {
    this.getAvailableEntities();
  }

  getAvailableEntities() {
    const ctName = this.fieldMaskService.resolve(); // always get the latest definition, possibly from another drop-down
    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    let itemFilter = null;
    try {
      itemFilter = this.enableAddExisting
        ? null
        : this.value;
    } catch (err) { }
    this.entityService.getAvailableEntities(this.eavConfig.appId, itemFilter, ctName).subscribe(items => {
      this.config.cache = [...items];
    });
  }

  /**
   *  get all mask field and subcribe to changes. On every change getAvailableEntities.
   */
  private subscribeToMaskFieldsChanges() {
    this.fieldMaskService.fieldList().forEach((e, i) => {
      if (this.group.controls[e]) {
        this.group.controls[e].valueChanges.subscribe((item) => {
          this.getAvailableEntities();
        });
      }
    });
  }
}
