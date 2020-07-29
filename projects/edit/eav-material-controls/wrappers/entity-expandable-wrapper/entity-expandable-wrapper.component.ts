import { Component, OnInit, ViewContainerRef, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { Helper } from '../../../shared/helpers/helper';
import { ExpandableFieldService } from '../../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { BaseComponent } from '../../input-types/base/base.component';
import { EavService } from '../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { SelectedEntity } from '../../input-types/entity/entity-default/entity-default.models';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityExpandableWrapperComponent extends BaseComponent<string | string[]> implements FieldWrapper, OnInit, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  invalid$: Observable<boolean>;
  selectedEntities$: Observable<SelectedEntity[]>;
  private separator: string;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private translate: TranslateService,
    private expandableFieldService: ExpandableFieldService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.separator = this.config.field.settings$.value.Separator;
    this.invalid$ = this.control.statusChanges.pipe(map(status => status === 'INVALID'));
    this.dialogIsOpen$ = this.expandableFieldService
      .getObservable()
      .pipe(map(expandedFieldId => this.config.field.index === expandedFieldId));
  }

  ngAfterViewInit() {
    this.selectedEntities$ = combineLatest([this.value$, this.config.entityCache$]).pipe(map(combined => {
      const fieldValue = combined[0];
      const availableEntities = combined[1];
      let selectedEntities: SelectedEntity[];

      if (typeof fieldValue === 'string') {
        const names = Helper.convertValueToArray(fieldValue, this.separator);
        selectedEntities = names.map(name => {
          const selectedEntity: SelectedEntity = {
            value: name,
            label: name,
            tooltip: `${name} (${name})`,
            isFreeTextOrNotFound: true,
          };
          return selectedEntity;
        });
      } else {
        selectedEntities = fieldValue.map(guid => {
          const entity = availableEntities.find(e => e.Value === guid);
          const label = (guid == null) ? 'empty slot' : entity?.Text || this.translate.instant('Fields.Entity.EntityNotFound');
          const selectedEntity: SelectedEntity = {
            value: guid,
            label,
            tooltip: `${label} (${guid})`,
            isFreeTextOrNotFound: !entity,
          };
          return selectedEntity;
        });
      }

      return selectedEntities;
    }));
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  trackByFn(item: SelectedEntity) {
    return item.value;
  }

  expandDialog() {
    angularConsoleLog('EntityExpandableWrapperComponent expandDialog');
    this.expandableFieldService.expand(true, this.config.field.index, this.config.form.formId);
  }

  closeDialog() {
    angularConsoleLog('EntityExpandableWrapperComponent closeDialog');
    this.expandableFieldService.expand(false, this.config.field.index, this.config.form.formId);
  }
}
