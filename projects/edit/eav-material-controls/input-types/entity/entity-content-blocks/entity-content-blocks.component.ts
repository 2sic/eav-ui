
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityService } from '../../../../shared/services/entity.service';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { FieldSettings } from '../../../../../edit-types';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-content-blocks',
  templateUrl: '../entity-default/entity-default.component.html',
  styleUrls: ['../entity-default/entity-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({})
export class EntityContentBlockComponent extends EntityDefaultComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
  ) {
    super(eavService, validationMessagesService, entityService, translate, editRoutingService, snackBar);
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
    fixedSettings.AllowMultiValue = false;
    fixedSettings.EnableRemove = true;
    fixedSettings.AllowMultiValue = true;
    fixedSettings.EnableAddExisting = false;
    fixedSettings.EnableCreate = false;
    fixedSettings.EnableEdit = false;
    fixedSettings.EntityType = 'ContentGroupReference';
    return fixedSettings;
  }
}
