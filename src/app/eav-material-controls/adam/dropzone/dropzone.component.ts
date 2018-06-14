import { Component, OnInit, ViewContainerRef, Input, ViewChild, AfterContentInit, AfterViewInit, ElementRef } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.css']
})
export class DropzoneComponent implements FieldWrapper, OnInit, AfterViewInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;
  @ViewChild('invisibleClickable') elReference: ElementRef;

  @Input() config: FieldConfig;

  public disabled = false;

  public dropzoneConfig: DropzoneConfigInterface = {
    // clickable: true,
    maxFiles: 1,
    autoReset: null,
    errorReset: null,
    cancelReset: null,

    url: 'http://2sxc-dnn742.dnndev.me/',
    // urlRoot: 'http://2sxc-dnn742.dnndev.me/',
    maxFilesize: 10000, // 10'000 MB = 10 GB, note that it will also be stopped on the server if it's larger than the really allowed sized
    paramName: 'uploadfile',
    maxThumbnailFilesize: 10,
    headers: {
      'ModuleId': '421',
      'TabId': '89',
      'ContentBlockId': '421'
    },
    dictDefaultMessage: '',
    addRemoveLinks: false,
    // '.field-' + field.toLowerCase() + ' .dropzone-previews',
    previewsContainer: '.dropzone-previews', // '.field-' + this.config.index + ' .dropzone-previews',
    // we need a clickable, because otherwise the entire area is clickable. so i'm just making the preview clickable, as it's not important
    clickable: '.dropzone-previews' // '.field-' + this.config.index + ' .invisible-clickable'  // " .dropzone-adam"
  };

  // url: 'http://2sxc-dnn742.dnndev.me/',
  // acceptedFiles: 'image/*',
  // createImageThumbnails: true




  constructor() { }

  ngOnInit() {
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
  }

  openUpload() {
    console.log('onUploadSuccess openUpload:');
    this.elReference.nativeElement.click();
  }

}
