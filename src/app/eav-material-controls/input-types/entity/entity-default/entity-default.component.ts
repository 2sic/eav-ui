import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EntityService } from '../../../../shared/services/entity.service';
import { FieldMaskService } from '../../../../shared/services/field-mask.service';
import { EntityDefaultListComponent } from '../entity-default-list/entity-default-list.component';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.scss'],
})
@InputType({
  // wrapper: ['app-eav-localization-wrapper', 'app-entity-expandable-wrapper'],
})
export class EntityDefaultComponent implements Field, OnInit, OnDestroy {

  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  availableEntities: EntityInfo[] = [];

  // private contentType: FieldMaskService;

  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;
  private fieldMaskService: FieldMaskService;

  get entityType(): string { return this.config.settings.EntityType || ''; }

  get enableAddExisting(): boolean { return this.config.settings.EnableAddExisting === false ? false : true; }

  get separator() { return this.config.settings.Separator || ','; }

  get value() { return this.group.controls[this.config.name].value; }

  constructor(private entityService: EntityService,
    private eavService: EavService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    // // Initialize entities
    // const sourceMask = this.entityType || null;
    // // this will contain the auto-resolve type (based on other contentType-field)
    // this.contentType = new FieldMaskService(sourceMask, this.maybeReload, null, null);
    // // don't get it, it must be blank to start with, so it will be loaded at least 1x lastContentType = contentType.resolve();
    // // this.setData();
    // this.setAvailableEntities(this.config.inputType);
    // // this.chosenEntitiesSubscribeToChanges();

    // Initialize url parameters mask
    const sourceMask = this.entityType || null;
    // this will contain the auto-resolve url parameters
    this.fieldMaskService = new FieldMaskService(sourceMask, this.maybeReload, null, this.group.controls);

    // get all mask field and subcribe to changes. On every change getAvailableEntities.
    this.subscribeToMaskFieldsChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  maybeReload() {
    console.log('call maybeReload');
  }

  callAvailableEntities(value) {
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
      this.config.availableEntities = [...items];
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
