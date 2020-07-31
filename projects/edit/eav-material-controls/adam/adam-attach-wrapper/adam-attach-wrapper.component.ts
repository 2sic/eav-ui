import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, OnDestroy, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { BaseComponent } from '../../input-types/base/base.component';
import { EavService } from '../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdamAttachWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  fullscreenAdam: boolean;
  adamDisabled$ = new BehaviorSubject(true);

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.fullscreenAdam = this.config.field.inputType === InputTypeConstants.HyperlinkLibrary;
  }

  ngAfterViewInit() {
    this.subscription.add(this.config.adam.getConfig$().subscribe(adamConfig => {
      if (adamConfig == null) { return; }
      this.adamDisabled$.next(adamConfig.disabled);
    }));
  }

  ngOnDestroy() {
    this.adamDisabled$.complete();
    super.ngOnDestroy();
  }

  openUpload() {
    this.invisibleClickableRef.nativeElement.click();
  }
}
