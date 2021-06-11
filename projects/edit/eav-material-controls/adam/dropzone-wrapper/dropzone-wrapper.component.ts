import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { AfterViewInit, ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AdamPostResponse, DropzoneConfigExt } from '../../../../edit-types';
import { consoleLogAngular } from '../../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { FieldWrapper } from '../../../form/model/field-wrapper';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { BaseComponent } from '../../input-types/base/base.component';
import { DropzoneConfigInstance, DropzoneType } from './dropzone-wrapper.models';

@Component({
  selector: 'app-dropzone-wrapper',
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropzoneWrapperComponent extends BaseComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef: DropzoneDirective;

  dropzoneConfig$ = new BehaviorSubject<DropzoneConfigExt>(null);
  dropzoneDisabled$: Observable<boolean>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private dnnContext: DnnContext,
    private zone: NgZone,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dropzoneDisabled$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.disabled), distinctUntilChanged()),
      this.dropzoneConfig$,
    ]).pipe(
      map(([controlDisabled, dropzoneConfig]) => {
        const dropzoneDisabled = (dropzoneConfig != null) ? dropzoneConfig.disabled : true;
        return controlDisabled || dropzoneDisabled;
      }),
    );

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
    setTimeout(() => {
      this.config.dropzone.setConfig({
        previewsContainer: '.field-' + this.config.index + ' .dropzone-previews',
        clickable: '.field-' + this.config.index + ' .invisible-clickable',
      });
    });
  }

  ngOnDestroy() {
    this.dropzoneConfig$.complete();
    super.ngOnDestroy();
  }

  onUploadError(args: DropzoneType) {
    consoleLogAngular('Dropzone upload error. Args:', args);
    this.dropzoneRef.reset();
  }

  onUploadSuccess(args: DropzoneType) {
    const response: AdamPostResponse = args[1]; // Gets the server response as second argument.
    if (response.Success) {
      if (this.config.adam) {
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
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    const appId = this.eavService.eavConfig.appId;

    const startDisabled = this.config.isExternal;
    const url = this.dnnContext.$2sxc.http.apiUrl(`app/auto/content/${contentType}/${entityGuid}/${field}?subfolder=&usePortalRoot=false&appId=${appId}`);
    const headers = this.dnnContext.sxc.webApi.headers();

    const oldConfig = (this.dropzoneConfig$.value != null)
      ? this.dropzoneConfig$.value
      : new DropzoneConfigInstance(startDisabled, url, headers);
    const newConfig = new DropzoneConfigInstance(startDisabled, url, headers);

    for (const key of Object.keys(newConfig)) {
      (newConfig as any)[key] = (config as any)[key] ?? (oldConfig as any)[key];
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

  private uploadFile(file: File & { upload?: { chunked: boolean; }; }) {
    const dropzone = this.dropzoneRef.dropzone();
    file.upload = { chunked: dropzone.defaultOptions.chunking };
    dropzone.processFile(file);
  }

}
