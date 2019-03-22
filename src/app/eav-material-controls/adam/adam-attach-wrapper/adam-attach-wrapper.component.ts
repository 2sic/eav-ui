import { Component, OnInit, ViewContainerRef, Input, ViewChild, AfterContentInit, AfterViewInit, ElementRef } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { AdamBrowserComponent } from '../browser/adam-browser.component';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';
import { UrlHelper } from '../../../shared/helpers/url-helper';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-adam-attach-wrapper',
  templateUrl: './adam-attach-wrapper.component.html',
  styleUrls: ['./adam-attach-wrapper.component.scss']
})
export class AdamAttachWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableReference: ElementRef;
  @ViewChild(AdamBrowserComponent) adamRef: AdamBrowserComponent;

  @Input() config: FieldConfig;
  group: FormGroup;

  url: string;

  private eavConfig: EavConfiguration;

  get disabled() {
    return this.group.controls[this.config.currentFieldConfig.name].disabled;
  }

  constructor(private eavService: EavService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.config.currentFieldConfig.adam = this.adamRef;
    // const serviceRoot = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/';
    const serviceRoot = this.eavConfig.portalroot + 'desktopmodules/2sxc/api/';
    // const url = UrlHelper.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field, serviceRoot);
    const contentType = this.config.itemConfig.header.contentTypeName;
    // const contentType = '106ba6ed-f807-475a-b004-cd77e6b317bd';
    const entityGuid = this.config.itemConfig.header.guid;
    // const entityGuid = '386ec145-d884-4fea-935b-a4d8d0c68d8d';
    const field = this.config.currentFieldConfig.name;
    // const field = 'HyperLinkStaticName';
    this.url = UrlHelper.resolveServiceUrl(`app-content/${contentType}/${entityGuid}/${field}`, serviceRoot);
  }

  // /**
  //  * triger click on clickable element for load open
  //  */
  openUpload() {
    console.log('openUpload click');
    this.invisibleClickableReference.nativeElement.click();
  }
}
