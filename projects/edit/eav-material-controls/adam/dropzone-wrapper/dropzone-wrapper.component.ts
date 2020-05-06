import { Component, OnInit, ViewContainerRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { BehaviorSubject } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-dropzone-wrapper',
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss']
})
export class DropzoneWrapperComponent implements FieldWrapper, OnInit, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef?: DropzoneDirective;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  private eavConfig: EavConfiguration;
  url: string;
  usePortalRoot = false;

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  constructor(private eavService: EavService, private dnnContext: DnnContext) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    const contentType = this.config.entity.header.ContentTypeName;
    const entityGuid = this.config.entity.header.Guid;
    const field = this.config.field.name;
    this.url = this.dnnContext.$2sxc.http.apiUrl(`app-content/${contentType}/${entityGuid}/${field}`);

    const dropzoneConfig: DropzoneConfigInterface = {
      // usePortalRoot is updated in AdamBrowser. Switches between Adam and DNN image
      url: this.url + `?subfolder=&usePortalRoot=${this.usePortalRoot}&appId=${this.eavConfig.appId}`,
      maxFiles: 1000, // keep maxFiles and parallelUploads in sync
      parallelUploads: 1000,
      autoReset: null,
      errorReset: null,
      cancelReset: null,
      maxFilesize: 10000, // 10'000 MB = 10 GB, note that it will also be stopped on the server if it's larger than the really allowed sized
      paramName: 'uploadfile',
      maxThumbnailFilesize: 10,
      headers: this.dnnContext.sxc.webApi.headers(),
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
    this.config.saveImage = (image) => {
      const dropzone = this.dropzoneRef.dropzone();
      (image as any).upload = { chunked: dropzone.defaultOptions.chunking };
      dropzone.processFile(image);
    };
  }

  public onUploadError(args: any): void {
    angularConsoleLog('onUploadError:', args);
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
