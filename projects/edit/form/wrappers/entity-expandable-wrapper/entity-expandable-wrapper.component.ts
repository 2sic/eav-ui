import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WrappersConstants } from '../../../shared/constants';
import { GeneralHelpers } from '../../../shared/helpers';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseComponent } from '../../fields/base/base.component';
import { calculateSelectedEntities } from '../../fields/entity/entity-default/entity-default.helpers';
import { SelectedEntity } from '../../fields/entity/entity-default/entity-default.models';
import { ContentExpandAnimation } from '../expandable-wrapper/content-expand.animation';
import { EntityExpandableTemplateVars } from './entity-expandable-wrapper.models';

@Component({
  selector: WrappersConstants.EntityExpandableWrapper,
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
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private entityCacheService: EntityCacheService,
    private stringQueryCache: StringQueryCacheService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dialogIsOpen$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    const selectedEntities$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.entityCacheService.getEntities$(),
      this.stringQueryCache.getEntities$(this.config.entityGuid, this.config.fieldName),
      this.settings$.pipe(
        map(settings => ({
          Separator: settings.Separator,
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([value, entityCache, stringQueryCache, settings]) =>
        calculateSelectedEntities(value, settings.Separator, entityCache, stringQueryCache, settings.Value, settings.Label, this.translate)
      ),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([selectedEntities$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [selectedEntities],
      ]) => {
        const templateVars: EntityExpandableTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          selectedEntities: selectedEntities?.slice(0, 9) || [],
          entitiesNumber: selectedEntities?.length || 0,
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
