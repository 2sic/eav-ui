import { Component, OnInit, ViewContainerRef, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { AdamBrowserComponent } from '../browser/adam-browser.component';
import { InputTypesConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-types-constants';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss']
})
export class AdamAttachWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableReference: ElementRef;
  @ViewChild(AdamBrowserComponent, { static: true }) adamRef: AdamBrowserComponent;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  fullScreenAdamBrowser = false;
  url: string;

  get disabled() { return this.group.controls[this.config.field.name].disabled; }

  constructor(private dnnContext: DnnContext) { }

  ngOnInit() {
    this.fullScreenAdamBrowser = this.config.field.inputType === InputTypesConstants.hyperlinkLibrary;
    this.config.adam = this.adamRef;
    const contentType = this.config.entity.header.ContentTypeName; // const contentType = '106ba6ed-f807-475a-b004-cd77e6b317bd';
    const entityGuid = this.config.entity.header.Guid; // const entityGuid = '386ec145-d884-4fea-935b-a4d8d0c68d8d';
    const field = this.config.field.name; // const field = 'HyperLinkStaticName';
    this.url = this.dnnContext.$2sxc.http.apiUrl(`app-content/${contentType}/${entityGuid}/${field}`);
  }

  /** triger click on clickable element for load open */
  openUpload() {
    angularConsoleLog('openUpload click');
    this.invisibleClickableReference.nativeElement.click();
  }
}
