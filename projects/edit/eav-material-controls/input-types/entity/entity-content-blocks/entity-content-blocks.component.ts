
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { FieldsSettings2Service } from '../../../../shared/services/fields-settings2.service';
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
    fieldsSettings2Service: FieldsSettings2Service,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2Service, entityService, translate, editRoutingService, snackBar);
    EntityContentBlocksLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
