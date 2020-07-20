import { Component, OnInit, ViewContainerRef, Input, ViewChild, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { filter, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { DropzoneConfigInstance } from './dropzone-wrapper.models';
import { DropzoneConfigExt, AdamPostResponse } from '../../../../edit-types';

@Component({
  selector: 'app-dropzone-wrapper',
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss']
})
export class DropzoneWrapperComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef?: DropzoneDirective;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  control: AbstractControl;
  disabled$: Observable<boolean>;
  dropzoneConfig$ = new BehaviorSubject<DropzoneConfigExt>(null);
  dropzoneDisabled$: Observable<boolean>;

  private eavConfig: EavConfiguration;

  constructor(private eavService: EavService, private dnnContext: DnnContext, private zone: NgZone) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.disabled$ = this.eavService.formDisabledChanged$$.asObservable().pipe(
      filter(formDisabledSet => (formDisabledSet.formId === this.config.form.formId)
        && (formDisabledSet.entityGuid === this.config.entity.entityGuid)
      ),
      map(formSet => this.control.disabled),
      startWith(this.control.disabled),
      distinctUntilChanged(),
    );
    this.dropzoneDisabled$ = combineLatest([this.disabled$, this.dropzoneConfig$]).pipe(map(combined => {
      const controlDisabled = combined[0];
      const dropzoneConfig = combined[1];
      const dropzoneDisabled = (dropzoneConfig != null) ? dropzoneConfig.disabled : true;
      return controlDisabled || dropzoneDisabled;
    }));

    this.config.dropzone = {
      setConfig: (config) => {
        this.zone.run(() => {
          this.setConfig(config);
        });
      },
      getConfig: () => this.dropzoneConfig$.value,
      getConfig$: () => this.dropzoneConfig$.asObservable(),
      uploadFile: (image) => {
        this.zone.run(() => {
          this.uploadFile(image);
        });
      }
    };

    this.config.dropzone.setConfig({});
  }

  ngAfterViewInit() {
    this.config.dropzone.setConfig({
      previewsContainer: '.field-' + this.config.field.index + ' .dropzone-previews',
      clickable: '.field-' + this.config.field.index + ' .invisible-clickable',
    });
  }

  ngOnDestroy() {
    this.dropzoneConfig$.complete();
  }

  onUploadError(args: any) {
    angularConsoleLog('onUploadError:', args);
    this.dropzoneRef.reset();
  }

  onUploadSuccess(args: any) {
    const response: AdamPostResponse = args[1]; // Gets the server response as second argument.
    if (response.Success) {
      if (this.config.adam) {
        this.config.adam.addFullPath(response);
        this.config.adam.onItemUpload(response);
        this.config.adam.refresh();
      } else {
        alert(`Upload failed because: ADAM reference doesn't exist`);
      }
    } else {
      alert(`Upload failed because: ${response.Error}`);
    }
    this.dropzoneRef.reset();
  }

  private setConfig(config: Partial<DropzoneConfigExt>) {
    const contentType = this.config.entity.header.ContentTypeName;
    const entityGuid = this.config.entity.header.Guid;
    const field = this.config.field.name;
    const appId = this.eavConfig.appId;

    const startDisabled = this.config.field.isExternal;
    const url = this.dnnContext.$2sxc.http.apiUrl(`app-content/${contentType}/${entityGuid}/${field}?subfolder=&usePortalRoot=false&appId=${appId}`);
    const headers = this.dnnContext.sxc.webApi.headers();

    const oldConfig = (this.dropzoneConfig$.value != null)
      ? this.dropzoneConfig$.value
      : new DropzoneConfigInstance(startDisabled, url, headers);
    const newConfig = new DropzoneConfigInstance(startDisabled, url, headers);

    const newConfigKeys = Object.keys(newConfig);
    for (const key of newConfigKeys) {
      (newConfig as any)[key] = ((config as any)[key] != null) ? (config as any)[key] : (oldConfig as any)[key];
    }

    // fixes
    const syncUploadLimit = newConfig.maxFiles !== newConfig.parallelUploads;
    if (syncUploadLimit) {
      const uploadLimit = (newConfig.maxFiles >= newConfig.parallelUploads) ? newConfig.maxFiles : newConfig.parallelUploads;
      newConfig.maxFiles = uploadLimit;
      newConfig.parallelUploads = uploadLimit;
    }
    const fixAcceptedFiles = newConfig.acceptedFiles == null || newConfig.acceptedFiles === '';
    if (fixAcceptedFiles) {
      delete newConfig.acceptedFiles; // only way to tell dropzone to accept all files is to remove acceptedFiles from config
    }

    this.dropzoneConfig$.next(newConfig);
  }

  private uploadFile(file: File) {
    const dropzone = this.dropzoneRef.dropzone();
    (file as any).upload = { chunked: dropzone.defaultOptions.chunking };
    dropzone.processFile(file);
  }

}
