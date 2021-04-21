import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { BaseComponent } from '../../input-types/base/base.component';
import { calculateSelectedEntities } from '../../input-types/entity/entity-default/entity-default.helpers';
import { SelectedEntity } from '../../input-types/entity/entity-default/entity-default.models';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { EntityExpandableTemplateVars } from './entity-expandable-wrapper.models';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class EntityExpandableWrapperComponent extends BaseComponent<string | string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  templateVars$: Observable<EntityExpandableTemplateVars>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private entityCacheService: EntityCacheService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dialogIsOpen$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    const separator$ = this.settings$.pipe(map(settings => settings.Separator), distinctUntilChanged());
    const selectedEntities$ = combineLatest([this.value$, separator$, this.entityCacheService.getEntities$()]).pipe(
      map(([value, separator, entityCache]) => calculateSelectedEntities(value, separator, entityCache, this.translate)),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.label$, this.required$, this.invalid$, selectedEntities$]),
      combineLatest([this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [label, required, invalid, selectedEntities],
        [disabled, touched],
      ]) => {
        const templateVars: EntityExpandableTemplateVars = {
          label,
          required,
          invalid,
          selectedEntities: selectedEntities?.slice(0, 9) || [],
          entitiesNumber: selectedEntities?.length || 0,
          disabled,
          touched,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  trackByFn(index: number, item: SelectedEntity) {
    return item.value;
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.index, this.config.entityGuid);
  }
}
