import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { EavService } from '../../../shared/services/eav.service';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
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
// tslint:disable-next-line:max-line-length
export class EntityExpandableWrapperComponent extends BaseComponent<string | string[]> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  templateVars$: Observable<EntityExpandableTemplateVars>;

  private selectedEntities$: BehaviorSubject<SelectedEntity[]>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2NewService: FieldsSettings2NewService,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dialogIsOpen$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
    this.selectedEntities$ = new BehaviorSubject([]);

    this.templateVars$ = combineLatest([
      combineLatest([this.label$, this.required$, this.invalid$, this.selectedEntities$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [label, required, invalid, selectedEntities],
        [disabled, showValidation],
      ]) => {
        const templateVars: EntityExpandableTemplateVars = {
          label,
          required,
          invalid,
          selectedEntities: selectedEntities?.slice(0, 9) || [],
          entitiesNumber: selectedEntities?.length || 0,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngAfterViewInit() {
    this.subscription.add(
      combineLatest([this.value$, this.settings$, this.config.entityCache$]).pipe(
        map(([fieldValue, settings, availableEntities]) => {
          const selected = calculateSelectedEntities(fieldValue, settings.Separator, availableEntities, this.translate);
          return selected;
        }),
      ).subscribe(selected => {
        this.selectedEntities$.next(selected);
      })
    );
  }

  ngOnDestroy() {
    this.selectedEntities$.complete();
    super.ngOnDestroy();
  }

  calculateBottomPixels() {
    return window.innerWidth > 600 ? '100px' : '50px';
  }

  trackByFn(index: number, item: SelectedEntity) {
    return item.value;
  }

  expandDialog() {
    if (this.config.field.disabled) { return; }
    this.editRoutingService.expand(true, this.config.field.index, this.config.entity.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.field.index, this.config.entity.entityGuid);
  }
}
