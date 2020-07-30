import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityService } from '../../../../shared/services/entity.service';
import { QueryService } from '../../../../shared/services/query.service';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { FieldSettings } from '../../../../../edit-types';
import { ExpandableFieldService } from '../../../../shared/services/expandable-field.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: '../../entity/entity-default/entity-default.component.html',
  styleUrls: ['../../entity/entity-default/entity-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    entityService: EntityService,
    translate: TranslateService,
    router: Router,
    route: ActivatedRoute,
    expandableFieldService: ExpandableFieldService,
    snackBar: MatSnackBar,
    queryService: QueryService,
  ) {
    super(eavService, validationMessagesService, entityService, translate, router, route, expandableFieldService, snackBar, queryService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /** Override function in superclass */
  calculateSettings(settings: FieldSettings) {
    const fixedSettings = super.calculateSettings(settings);
    if (fixedSettings.Value == null) { fixedSettings.Value = ''; }
    if (fixedSettings.Label == null) { fixedSettings.Label = ''; }
    if (fixedSettings.EnableTextEntry == null) { fixedSettings.EnableTextEntry = false; }
    if (fixedSettings.Separator == null || fixedSettings.Separator === '') { fixedSettings.Separator = ','; }
    return fixedSettings;
  }

  /** Override function in superclass */
  queryEntityMapping(entity: QueryEntity) {
    let settings: FieldSettings;
    this.settings$.pipe(take(1)).subscribe(stngs => {
      settings = stngs;
    });
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity[settings.Value],
      Text: entity[settings.Label],
    };
    return entityInfo;
  }
}
