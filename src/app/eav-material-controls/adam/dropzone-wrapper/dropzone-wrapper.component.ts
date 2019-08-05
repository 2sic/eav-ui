import { Component, OnInit, ViewContainerRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { BehaviorSubject } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';
import { UrlHelper } from '../../../shared/helpers/url-helper';
import { UrlConstants } from '../../../shared/constants/url-constants';

@Component({
  selector: 'app-dropzone-wrapper',
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss']
})
export class DropzoneWrapperComponent implements FieldWrapper, OnInit, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective, { static: false }) dropzoneRef?: DropzoneDirective;

  @Input() config: FieldConfigSet;
  group: FormGroup;

  private eavConfig: EavConfiguration;
  url: string;
  usePortalRoot = false;

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  constructor(private eavService: EavService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    const serviceRoot = this.eavConfig.portalroot + UrlConstants.apiRoot;
    const contentType = this.config.entity.header.contentTypeName;
    const entityGuid = this.config.entity.header.guid;
    const field = this.config.field.name;

    this.url = UrlHelper.resolveServiceUrl(`app-content/${contentType}/${entityGuid}/${field}`, serviceRoot);

    const dropzoneConfig: DropzoneConfigInterface = {
      // usePortalRoot is updated in AdamBrowser. Switches between Adam and DNN image
      url: this.url + `?subfolder=&usePortalRoot=${this.usePortalRoot}&appId=${this.eavConfig.appId}`,
      maxFiles: 1,
      autoReset: null,
      errorReset: null,
      cancelReset: null,
      // 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/app-content/106ba6ed-f807-475a-b004-cd77e6b317bd/
      // 386ec145-d884-4fea-935b-a4d8d0c68d8d/HyperLinkStaticName?usePortalRoot=false&appId=7',
      // urlRoot: 'http://2sxc-dnn742.dnndev.me/',
      maxFilesize: 10000, // 10'000 MB = 10 GB, note that it will also be stopped on the server if it's larger than the really allowed sized
      paramName: 'uploadfile',
      maxThumbnailFilesize: 10,
      headers: {
        'ModuleId': this.eavConfig.mid,
        'TabId': this.eavConfig.tid,
        'ContentBlockId': this.eavConfig.cbid,
        'RequestVerificationToken': (window as any).$.ServicesFramework(0).getAntiForgeryValue(),
      },
      dictDefaultMessage: '',
      addRemoveLinks: false,
      // '.field-' + field.toLowerCase() + ' .dropzone-previews',
      previewsContainer: '.dropzone-previews', // '.field-' + this.config.currentFieldConfig.index + ' .dropzone-previews',
      // we need a clickable, because otherwise the entire area is clickable.
      // so i'm just making the preview clickable, as it's not important
      clickable: '.dropzone-previews' // '.field-' + this.config.currentFieldConfig.index + ' .invisible-clickable'  // " .dropzone-adam"
    };

    this.config.dropzoneConfig$ = new BehaviorSubject(dropzoneConfig);
  }

  ngAfterViewInit() {
    const currDzConfig = this.config.dropzoneConfig$.value;
    this.config.dropzoneConfig$.next({
      ...currDzConfig,
      previewsContainer: '.field-' + this.config.field.index + ' .dropzone-previews',
      clickable: '.field-' + this.config.field.index + ' .invisible-clickable',
    });
  }

  public onUploadError(args: any): void {
    console.log('onUploadError:', args);
    // Reset dropzone
    this.dropzoneRef.reset();
  }

  public onUploadSuccess(args: any): void {
    const response = args[1]; // Gets the server response as second argument.
    if (response.Success) {
      if (this.config.adam) {
        this.config.adam.svc.addFullPath(response); // calculate additional infos
        this.config.adam.afterUploadCallback(response);
        this.config.adam.refresh(); // Refresh Adam
      } else {
        alert('Upload failed because: ADAM reference doesn\'t exist');
      }
    } else {
      alert('Upload failed because: ' + response.Error);
    }
    // Reset dropzone
    this.dropzoneRef.reset();
  }
}
