import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettings2Service } from '../../../shared/services/fields-settings2.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiddenWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden$: Observable<boolean>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2Service: FieldsSettings2Service,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2Service);
  }

  ngOnInit() {
    super.ngOnInit();
    this.hidden$ = this.settings$.pipe(map(settings => !settings.VisibleInEditUI));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
