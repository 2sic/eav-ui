import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { AfterViewInit, ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdamPostResponse, DropzoneConfigExt } from '../../../../edit-types';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { DropzoneConfigInstance } from './dropzone-wrapper.models';

@Component({
  selector: 'app-dropzone-wrapper',
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropzoneWrapperComponent extends BaseComponent<any> implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef: DropzoneDirective;

  dropzoneConfig$ = new BehaviorSubject<DropzoneConfigExt>(null);
  dropzoneDisabled$: Observable<boolean>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private dnnContext: DnnContext,
    private zone: NgZone,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.dropzoneDisabled$ = combineLatest([this.disabled$, this.dropzoneConfig$]).pipe(
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
        previewsContainer: '.field-' + this.config.field.index + ' .dropzone-previews',
        clickable: '.field-' + this.config.field.index + ' .invisible-clickable',
      });
    });
  }

  ngOnDestroy() {
    this.dropzoneConfig$.complete();
    super.ngOnDestroy();
  }

  onUploadError(args: any) {
    angularConsoleLog('Dropzone upload error. Args:', args);
    this.dropzoneRef.reset();
  }

  onUploadSuccess(args: any) {
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
    const contentType = this.config.entity.header.ContentTypeName;
    const entityGuid = this.config.entity.header.Guid;
    const field = this.config.field.name;
    const appId = this.eavService.eavConfig.appId;

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
