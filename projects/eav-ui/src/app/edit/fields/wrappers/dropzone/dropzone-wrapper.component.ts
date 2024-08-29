import { Context as DnnContext } from '@2sic.com/sxc-angular';
import { AfterViewInit, Component, computed, inject, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { DropzoneDirective, DropzoneModule } from 'ngx-dropzone-wrapper';
import { AdamItem, DropzoneConfigExt } from '../../../../../../../edit-types';
import { DropzoneConfigInstance, DropzoneType } from './dropzone-wrapper.models';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { FieldState } from '../../field-state';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FormConfigService } from '../../../state/form-config.service';
import { WrappersCatalog } from '../wrappers.constants';
import { DropzoneWysiwyg } from './dropzone-wysiwyg';

const logThis = false;
const nameOfThis = 'DropzoneWrapperComponent';

@Component({
  selector: WrappersCatalog.DropzoneWrapper,
  templateUrl: './dropzone-wrapper.component.html',
  styleUrls: ['./dropzone-wrapper.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    DropzoneModule,
  ],
})
export class DropzoneWrapperComponent implements AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild(DropzoneDirective) dropzoneRef: DropzoneDirective;

  #fieldState = inject(FieldState);
  #config = this.#fieldState.config;

  dropzoneConfig = signal<DropzoneConfigExt>(null);
  dropzoneDisabled = computed(() => this.#fieldState.controlStatus().disabled || (this.dropzoneConfig()?.disabled ?? true));
  
  #wysiwygHelper = new DropzoneWysiwyg();

  private log = new EavLogger(nameOfThis, logThis);

  constructor(
    private formConfig: FormConfigService,
    private dnnContext: DnnContext,
  ) {
    this.extendFieldConfigWithDropZone();
    this.#setConfig({});
  }

  extendFieldConfigWithDropZone() {
    this.#config.dropzone = {
      setConfig: (config) => this.#setConfig(config),
      getConfig: () => this.dropzoneConfig(),
      uploadFile: (image) => this.#uploadFile(image),
    };
  }

  ngAfterViewInit() {
    this.#setConfig({
      previewsContainer: `.${this.#config.dropzonePreviewsClass} .dropzone-previews`,
      clickable: `.${this.#config.dropzonePreviewsClass} .invisible-clickable`,
    });
  }

  // on onDrop we check if drop is on wysiwyg or not
  onDrop(event: any) {
    this.#wysiwygHelper.detectWysiwygOnDrop(event);
  }

  // here we check if file is image type so we can cancel upload if it is also uploaded on wysiwyg
  onAddedFile(file: any) {
    this.#wysiwygHelper.removeFilesHandledByWysiwyg(this.dropzoneRef.dropzone(), file);
  }

  onUploadError(event: DropzoneType) {
    this.log.fn('onUploadError', { event });
    alert(`Dropzone upload error. Event ${event}`);
    this.dropzoneRef.reset();
  }

  onUploadSuccess(event: DropzoneType) {
    const l = this.log.fn('onUploadSuccess', { event });
    const response: AdamItem = event[1]; // gets the server response as second argument.
    if (!response.Error) {
      if (this.#config.adam) {
        this.#config.adam.onItemUpload(response);
        this.#config.adam.refresh();
      } else {
        l.a(`Upload failed because: ADAM reference doesn't exist`);
      }
    } else {
      l.a(`Upload failed because: ${response.Error}`);
      alert(`Upload failed because: ${response.Error}`);
    }
    this.dropzoneRef.reset();
  }

  #setConfig(config: Partial<DropzoneConfigExt>) {
    const contentType = this.#config.contentTypeNameId;
    const entityGuid = this.#config.entityGuid;
    const field = this.#config.fieldName;
    const appId = this.formConfig.config.appId;

    const startDisabled = this.#config.inputTypeSpecs.isExternal;
    const url = this.dnnContext.$2sxc.http.apiUrl(`app/auto/data/${contentType}/${entityGuid}/${field}?subfolder=&usePortalRoot=false&appId=${appId}`);
    const headers = this.dnnContext.sxc.webApi.headers();

    const newConfig = new DropzoneConfigInstance(startDisabled, url, headers);
    const oldConfig = this.dropzoneConfig() ?? newConfig;

    for (const key of Object.keys(newConfig))
      (newConfig as any)[key] = (config as any)[key] ?? (oldConfig as any)[key];

    // fixes
    const syncUploadLimit = newConfig.maxFiles !== newConfig.parallelUploads;
    if (syncUploadLimit) {
      const uploadLimit = (newConfig.maxFiles >= newConfig.parallelUploads)
        ? newConfig.maxFiles
        : newConfig.parallelUploads;
      newConfig.maxFiles = uploadLimit;
      newConfig.parallelUploads = uploadLimit;
    }

    // Make sure dropzone accepts all files, since we'll process it afterwards
    // only way to tell dropzone to accept all files is to remove acceptedFiles from config
    // so if the config exists but is empty/null, we must completely remove it
    const fixAcceptedFiles = newConfig.acceptedFiles == null || newConfig.acceptedFiles === '';
    if (fixAcceptedFiles)
      delete newConfig.acceptedFiles; 

    this.dropzoneConfig.set(newConfig);
  }

  #uploadFile(file: File & { upload?: { chunked: boolean; }; }) {
    const dropzone = this.dropzoneRef.dropzone();
    file.upload = { chunked: dropzone.defaultOptions.chunking };
    dropzone.processFile(file);
  }
}
