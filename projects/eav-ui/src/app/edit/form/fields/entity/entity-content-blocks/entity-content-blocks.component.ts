import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';

@Component({
  selector: InputTypeConstants.EntityContentBlocks,
  templateUrl: '../entity-default/entity-default.component.html',
  styleUrls: ['../entity-default/entity-default.component.scss'],
})
@FieldMetadata({})
export class EntityContentBlockComponent extends EntityDefaultComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService, translate,
      editRoutingService,
      snackBar,
      entityCacheService,
      stringQueryCacheService,
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
