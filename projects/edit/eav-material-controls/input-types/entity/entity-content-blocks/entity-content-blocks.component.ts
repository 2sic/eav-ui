
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService } from '../../../../shared/store/ngrx-data';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-content-blocks',
  templateUrl: '../entity-default/entity-default.component.html',
  styleUrls: ['../entity-default/entity-default.component.scss'],
})
@ComponentMetadata({})
export class EntityContentBlockComponent extends EntityDefaultComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
  ) {
    super(
      eavService,
      validationMessagesService,
      fieldsSettingsService,
      entityService, translate,
      editRoutingService,
      snackBar,
      entityCacheService,
    );
    EntityContentBlocksLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
