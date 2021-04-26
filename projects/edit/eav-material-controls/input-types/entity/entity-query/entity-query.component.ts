import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { FieldMask } from '../../../../shared/helpers';
import { EntityInfo } from '../../../../shared/models';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { EntityQueryLogic } from './entity-query-logic';
import { QueryEntity } from './entity-query.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-query',
  templateUrl: '../entity-default/entity-default.component.html',
  styleUrls: ['../entity-default/entity-default.component.scss'],
})
@ComponentMetadata({})
export class EntityQueryComponent extends EntityDefaultComponent implements OnInit, OnDestroy {
  private paramsMask: FieldMask;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private queryService: QueryService,
  ) {
    super(
      eavService,
      validationMessagesService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      snackBar,
      entityCacheService,
      stringQueryCacheService,
    );
    EntityQueryLogic.importMe();
    this.isQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.UrlParameters),
        distinctUntilChanged(),
      ).subscribe(urlParameters => {
        this.paramsMask?.destroy();
        this.paramsMask = new FieldMask(
          urlParameters,
          this.group.controls,
          () => { this.availableEntities$.next(null); },
          null,
          this.eavService.eavConfig,
        );

        this.availableEntities$.next(null);
      })
    );

    this.subscription.add(
      combineLatest([
        this.settings$.pipe(map(settings => settings.Query), distinctUntilChanged()),
        this.settings$.pipe(map(settings => settings.StreamName), distinctUntilChanged()),
      ]).subscribe(() => {
        this.availableEntities$.next(null);
      })
    );
  }

  ngOnDestroy(): void {
    this.paramsMask?.destroy();
    super.ngOnDestroy();
  }

  /** WARNING! Overrides function in superclass */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.availableEntities$.next(null);
    }

    const settings = this.settings$.value;
    if (!settings.Query) {
      alert(`No query defined for ${this.config.fieldName} - can't load entities`);
      return;
    }

    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
    const params = this.paramsMask.resolve();
    const entitiesFilter: string[] = clearAvailableEntitiesAndOnlyUpdateCache && !this.isStringQuery
      ? (this.control.value as string[]).filter(guid => guid)
      : null;

    this.queryService.getAvailableEntities(queryUrl, true, params, entitiesFilter).subscribe({
      next: (data) => {
        if (!data) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[streamName]) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + streamName);
          return;
        }
        const items: EntityInfo[] = data[streamName].map(entity => this.queryEntityMapping(entity));
        if (!this.isStringQuery) {
          this.entityCacheService.loadEntities(items);
        } else {
          this.stringQueryCacheService.loadEntities(data[streamName]);
        }
        if (!clearAvailableEntitiesAndOnlyUpdateCache) {
          this.availableEntities$.next(items);
        }
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    });
  }

  /** WARNING! Overridden in subclass */
  queryEntityMapping(entity: QueryEntity): EntityInfo {
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return entityInfo;
  }
}
