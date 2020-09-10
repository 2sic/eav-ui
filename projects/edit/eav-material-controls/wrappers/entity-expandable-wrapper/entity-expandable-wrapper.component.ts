import { Component, OnInit, ViewContainerRef, ViewChild, AfterViewInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { EavService } from '../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { SelectedEntity } from '../../input-types/entity/entity-default/entity-default.models';
import { calculateSelectedEntities } from '../../input-types/entity/entity-default/entity-default.helpers';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// tslint:disable-next-line:max-line-length
export class EntityExpandableWrapperComponent extends BaseComponent<string | string[]> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  dialogIsOpen$: Observable<boolean>;
  selectedEntities$: Observable<SelectedEntity[]>;
  private separator: string;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.separator = this.config.field.settings$.value.Separator;
    this.dialogIsOpen$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);
  }

  ngAfterViewInit() {
    this.selectedEntities$ = combineLatest([this.value$, this.config.entityCache$]).pipe(
      map(([fieldValue, availableEntities]) => {
        const selected = calculateSelectedEntities(fieldValue, this.separator, availableEntities, this.translate);
        return selected;
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
    if (this.config.field.disabled) { return; }
    this.editRoutingService.expand(true, this.config.field.index, this.config.entity.entityGuid);
  }

  closeDialog() {
    this.editRoutingService.expand(false, this.config.field.index, this.config.entity.entityGuid);
  }
}
