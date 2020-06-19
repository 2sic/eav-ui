import { Component, OnInit, ViewContainerRef, Input, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss']
})
export class AdamAttachWrapperComponent implements FieldWrapper, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableReference: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  fullScreenAdamBrowser: boolean;
  adamDisabled$ = new BehaviorSubject(true);

  private subscription = new Subscription();

  constructor() { }

  ngOnInit() {
    this.fullScreenAdamBrowser = this.config.field.inputType === InputTypeConstants.HyperlinkLibrary;
  }

  ngAfterViewInit() {
    this.subscription.add(this.config.adam.getConfig$().subscribe(adamConfig => {
      if (adamConfig == null) { return; }
      this.adamDisabled$.next(adamConfig.disabled);
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.adamDisabled$.complete();
  }

  /** triger click on clickable element for load open */
  openUpload() {
    angularConsoleLog('openUpload click');
    this.invisibleClickableReference.nativeElement.click();
  }
}
