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
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.css']
})
export class DropzoneComponent implements FieldWrapper, OnInit, AfterViewInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef?: DropzoneDirective;
  @ViewChild('invisibleClickable') invisibleClickableReference: ElementRef;
  @ViewChild(AdamBrowserComponent) adamRef: AdamBrowserComponent;

  @Input() config: FieldConfig;
  // @Input() group: FormGroup;

  // public disabled = false;
  public dropzoneConfig: DropzoneConfigInterface;
  private eavConfig: EavConfiguration;  // url: 'http://2sxc-dnn742.dnndev.me/',
  // acceptedFiles: 'image/*',
  // createImageThumbnails: true
  url: string;

  constructor(private eavService: EavService) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  tempFileFilter = '*.jpg,*.pdf';

  ngOnInit() {
    this.config.adam = this.adamRef;

    // TODO: read from configuration
    const serviceRoot = 'http://2sxc-dnn742.dnndev.me/en-us/desktopmodules/2sxc/api/';
    // const url = UrlHelper.resolveServiceUrl('app-content/' + contentType + '/' + entityGuid + '/' + field, serviceRoot);

    const contentType = this.config.header.contentTypeName;
    // const contentType = '106ba6ed-f807-475a-b004-cd77e6b317bd';
    const entityGuid = this.config.header.guid;
    // const entityGuid = '386ec145-d884-4fea-935b-a4d8d0c68d8d';
    const field = this.config.name;
    // const field = 'HyperLinkStaticName';

    this.url = UrlHelper.resolveServiceUrl(`app-content/${contentType}/${entityGuid}/${field}`, serviceRoot);

    console.log('this.url', this.url);

    this.dropzoneConfig = {
      url: this.url + `?usePortalRoot=${this.eavConfig.portalroot}false&appId=${this.eavConfig.appId}`,
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
        'ContentBlockId': this.eavConfig.cbid
      },
      dictDefaultMessage: '',
      addRemoveLinks: false,
      // '.field-' + field.toLowerCase() + ' .dropzone-previews',
      previewsContainer: '.dropzone-previews', // '.field-' + this.config.index + ' .dropzone-previews',
      // we need a clickable, because otherwise the entire area is clickable.
      // so i'm just making the preview clickable, as it's not important
      clickable: '.dropzone-previews' // '.field-' + this.config.index + ' .invisible-clickable'  // " .dropzone-adam"
    };
  }

  ngAfterViewInit() {
    this.dropzoneConfig.previewsContainer = '.field-' + this.config.index + ' .dropzone-previews';
    this.dropzoneConfig.clickable = '.field-' + this.config.index + ' .invisible-clickable';

    console.log('this.dropzoneConfig:', this.dropzoneConfig);
    console.log('config ddropzone wrapper:', this.config.index);
  }

  public onUploadError(args: any): void {
    console.log('onUploadError:', args);
  }

  public onUploadSuccess(args: any): void {
    console.log('onUploadSuccess:', args);
    const response = args[1]; // Gets the server response as second argument.
    if (response.Success) {
      this.adamRef.svc.addFullPath(response); // calculate additional infos
      this.adamRef.afterUploadCallback(response);
      // Reset dropzone
      this.dropzoneRef.reset();
      this.adamRef.refresh();
    } else {
      alert('Upload failed because: ' + response.Error);
    }

  }

  public onDrop(args: any): void {
    // this.adamRef.updateCallback();
  }

  /**
   * triger click on clickable element for load open
   */
  openUpload() {
    this.invisibleClickableReference.nativeElement.click();
  }

  // updateCallback() {
  //   console.log('update callback');
  //   console.log('adamModeImage', this.adamModeImage);
  // }
}
