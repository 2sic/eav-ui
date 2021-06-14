import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EntityInfo } from '../../../../../edit-types';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { ComponentMetadata } from '../../../builder/eav-field/component-metadata.decorator';
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
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    queryService: QueryService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      snackBar,
      entityCacheService,
      stringQueryCacheService,
      queryService,
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => ({
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(() => {
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
