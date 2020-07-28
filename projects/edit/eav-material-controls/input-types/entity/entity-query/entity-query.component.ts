import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { QueryService } from '../../../../shared/services/query.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityService } from '../../../../shared/services/entity.service';
import { FieldSettings } from '../../../../../edit-types';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { QueryEntity } from './entity-query.models';
import { ExpandableFieldService } from '../../../../shared/services/expandable-field.service';
import { FieldMaskService } from '../../../../../shared/field-mask.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-query',
  templateUrl: '../entity-default/entity-default.component.html',
  styleUrls: ['../entity-default/entity-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({})
export class EntityQueryComponent extends EntityDefaultComponent implements OnInit, OnDestroy {
  useQuery = true;
  private paramsMask: FieldMaskService;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    entityService: EntityService,
    translate: TranslateService,
    router: Router,
    route: ActivatedRoute,
    expandableFieldService: ExpandableFieldService,
    snackBar: MatSnackBar,
    private queryService: QueryService,
  ) {
    super(eavService, validationMessagesService, entityService, translate, router, route, expandableFieldService, snackBar);
  }

  ngOnInit() {
    super.ngOnInit();

    this.subscription.add(this.settings$.subscribe(settings => {
      this.paramsMask?.destroy();
      this.paramsMask = new FieldMaskService(
        settings.UrlParameters,
        this.group.controls,
        this.fetchAvailableEntities.bind(this),
        null,
        this.eavConfig,
      );
    }));

    this.fetchAvailableEntities();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /** Override function in superclass */
  calculateSettings(settings: FieldSettings) {
    const fixedSettings = super.calculateSettings(settings);
    if (fixedSettings.Query == null) { fixedSettings.Query = ''; }
    if (fixedSettings.StreamName == null || fixedSettings.StreamName === '') { fixedSettings.StreamName = 'Default'; }
    if (fixedSettings.UrlParameters == null) { fixedSettings.UrlParameters = ''; }
    return fixedSettings;
  }

  /** Override function in superclass */
  fetchAvailableEntities() {
    let settings: FieldSettings;
    this.settings$.pipe(take(1)).subscribe(stngs => {
      settings = stngs;
    });
    if (!settings.Query) {
      alert(`No query defined for ${this.config.field.name} - can't load entities`);
      return;
    }

    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
    const params = this.paramsMask.resolve();

    this.queryService.getAvailableEntities(queryUrl, true, params).subscribe({
      next: (data) => {
        if (!data) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[streamName]) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + streamName);
          return;
        }
        const items: EntityInfo[] = data[streamName].map(this.queryEntityMapping.bind(this));
        this.config.cache = items;
        this.config.entityCache$.next(items);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    });
  }

  /** Overridden in subclass */
  queryEntityMapping(entity: QueryEntity) {
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return entityInfo;
  }
}
