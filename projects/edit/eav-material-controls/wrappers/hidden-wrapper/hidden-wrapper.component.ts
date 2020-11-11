import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { HiddenWrapperLogic } from './hidden-wrapper-logic';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HiddenWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  hidden$: Observable<boolean>;

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    const settingsLogic = new HiddenWrapperLogic();
    this.hidden$ = this.settings$.pipe(map(settings => !settingsLogic.init(settings).VisibleInEditUI));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
