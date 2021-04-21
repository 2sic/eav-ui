import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { EntityInfo } from '../../../../shared/models';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService } from '../../../../shared/store/ngrx-data';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: '../../entity/entity-default/entity-default.component.html',
  styleUrls: ['../../entity/entity-default/entity-default.component.scss'],
})
@ComponentMetadata({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
    queryService: QueryService,
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
      queryService,
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.subscription.add(
      combineLatest([
        this.settings$.pipe(map(settings => settings.Value), distinctUntilChanged()),
        this.settings$.pipe(map(settings => settings.Label), distinctUntilChanged()),
      ]).subscribe(() => {
        this.availableEntities$.next(null);
      })
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /** WARNING! Overrides function in superclass */
  queryEntityMapping(entity: QueryEntity): EntityInfo {
    const settings = this.settings$.value;
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity[settings.Value],
      Text: entity[settings.Label],
    };
    return entityInfo;
  }
}
