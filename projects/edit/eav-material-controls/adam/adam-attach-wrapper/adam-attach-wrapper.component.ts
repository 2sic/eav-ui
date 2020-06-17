import { Component, OnInit, ViewContainerRef, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss']
})
export class AdamAttachWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableReference: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  fullScreenAdamBrowser: boolean;
  dropzoneDisabled: boolean;

  private subscription = new Subscription();

  constructor() { }

  ngOnInit() {
    this.fullScreenAdamBrowser = this.config.field.inputType === InputTypeConstants.HyperlinkLibrary;
    this.subscription.add(this.config.dropzoneDisabled$.subscribe(disabled => {
      this.dropzoneDisabled = disabled;
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /** triger click on clickable element for load open */
  openUpload() {
    angularConsoleLog('openUpload click');
    this.invisibleClickableReference.nativeElement.click();
  }
}
