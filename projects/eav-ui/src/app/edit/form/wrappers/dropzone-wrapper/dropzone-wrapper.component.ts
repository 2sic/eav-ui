import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { AdamItem, DropzoneConfigExt } from '../../../../../../../edit-types';
import { consoleLogAngular } from '../../../../shared/helpers/console-log-angular.helper';
import { WrappersConstants } from '../../../shared/constants';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { FieldWrapper } from '../../builder/fields-builder/field-wrapper.model';
import { BaseFieldComponent } from '../../fields/base/base-field.component';
import { DropzoneConfigInstance, DropzoneType } from './dropzone-wrapper.models';

@Component({
  selector: WrappersConstants.DropzoneWrapper,
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss'],
})
export class DropzoneWrapperComponent extends BaseFieldComponent implements FieldWrapper, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef: DropzoneDirective;

  dropzoneConfig$ = new BehaviorSubject<DropzoneConfigExt>(null);
  dropzoneDisabled$: Observable<boolean>;
  imageTypes: string[] = ["image/jpeg", "image/png"];
  isStringWysiwyg = false;

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
        previewsContainer: `.${this.config.dropzonePreviewsClass} .dropzone-previews`,
        clickable: `.${this.config.dropzonePreviewsClass} .invisible-clickable`,
      });
    });
  }

  ngOnDestroy() {
    this.dropzoneConfig$.complete();
    super.ngOnDestroy();
  }

  // on onDrop we check if drop is on wysiwyg or not
  onDrop(event: any) {
    if (this.isParentWysiwyg((event.toElement as HTMLElement))) {
      this.isStringWysiwyg = true;
    } else {
      this.isStringWysiwyg = false;
    }
  }

  // here we check if file is image type so we can cancel upload if it is also uploaded on wysiwyg
  onAddedFile(file: any) {
    if (this.isStringWysiwyg && this.imageTypes.some(x => x === file.type)) {
      this.dropzoneRef.dropzone().removeFile(file);
    }
  }

  onUploadError(event: DropzoneType) {
    consoleLogAngular('Dropzone upload error. Event:', event);
    alert(`Dropzone upload error. Event ${event}`);
    this.dropzoneRef.reset();
  }

  onUploadSuccess(event: DropzoneType) {
    const response: AdamItem = event[1]; // gets the server response as second argument.
    if (!response.Error) {
      if (this.config.adam) {
        this.config.adam.onItemUpload(response);
        this.config.adam.refresh();
      } else {
        consoleLogAngular(`Upload failed because: ADAM reference doesn't exist`);
      }
    } else {
      consoleLogAngular(`Upload failed because: ${response.Error}`);
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
    const url = this.dnnContext.$2sxc.http.apiUrl(`app/auto/data/${contentType}/${entityGuid}/${field}?subfolder=&usePortalRoot=false&appId=${appId}`);
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

  private isParentWysiwyg(element: HTMLElement): boolean {
    do {
      if (element == null) return false;
      if (element?.classList.contains("class-distinguish-from-adam-dropzone")) return true;
      element = element.parentElement;
    } while (!element?.classList.contains("class-distinguish-from-adam-dropzone") || element.parentElement != document.body);
    return false;
  }
}
