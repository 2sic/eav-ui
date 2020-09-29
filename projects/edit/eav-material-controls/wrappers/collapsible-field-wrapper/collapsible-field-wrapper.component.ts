import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-collapsible-field-wrapper',
  templateUrl: './collapsible-field-wrapper.component.html',
  styleUrls: ['./collapsible-field-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleFieldWrapperComponent extends BaseComponent<string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  collapse$ = new BehaviorSubject(true);

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    this.collapse$.complete();
    super.ngOnDestroy();
  }

  toggleCollapse() {
    this.collapse$.next(!this.collapse$.value);
  }
}
