import { ChangeDetectorRef, Directive, ElementRef, input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FeatureNames } from '../../../features/feature-names';
import { FeaturesScopedService } from '../../../features/features-scoped.service';
import { openFeatureDialog } from '../../../features/shared/base-feature.component';
import { classLog } from '../../../shared/logging';
import { ElementEventListener } from '../../shared/controls/element-event-listener.model';
import { FieldConfigSet } from '../field-config-set.model';

const logSpecs = {
  all: true,
  constructor: false,
  handleImage: false,
};


@Directive({
  selector: '[appPasteClipboardImage]',
})
export class PasteClipboardImageDirective implements OnInit, OnDestroy {

  log = classLog({PasteClipboardImageDirective}, logSpecs);

  config = input<FieldConfigSet>();
  elementType = input<string>();
  #eventListeners: ElementEventListener[] = [];

  #pasteImageEnabled = this.features.isEnabled[FeatureNames.PasteImageFromClipboard]();

  constructor(
    private elementRef: ElementRef,
    private features: FeaturesScopedService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.log.fn('constructor', { elementType: this.elementType(), pasteImageEnabled: this.#pasteImageEnabled });
  }

  ngOnInit() {
    switch (this.elementType()) {
      case 'input':
        this.elementRef.nativeElement.pastableTextarea();
        break;
      case 'element':
        this.elementRef.nativeElement.pastableNonInputable();
        break;
    }


    const handleImage = (event: CustomEvent) => { this.#handleImage(event); };
    this.elementRef.nativeElement.addEventListener('handleImage', handleImage);

    this.#eventListeners.push(
      { element: this.elementRef.nativeElement, type: 'handleImage', listener: handleImage },
    );
  }

  ngOnDestroy() {
    // spm 2019-10-24 paste.js which handles clipboard paste doesn't destroy listeners
    this.#eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
  }

  #handleImage(event: CustomEvent) {
    const enabled = this.#pasteImageEnabled;
    const l = this.log.fnIf('handleImage', { event }, 'handling paste image - ' + (enabled ? 'enabled' : 'disabled') );
    if (enabled) {
      const image = this.#getFile(event.detail as PasteClipboardImageEventDetail);
      this.config().dropzone.uploadFile(image);
      l.end('started upload');
    } else {
      this.snackBar.open(this.translate.instant('Message.PastingFilesIsNotEnabled'), this.translate.instant('Message.FindOutMore'), { duration: 3000 }).onAction().subscribe(() => {
        openFeatureDialog(this.matDialog, FeatureNames.PasteImageFromClipboard, this.viewContainerRef, this.changeDetectorRef);
      });
      l.end('not enabled, showing snackbar');
    }
  }

  #getFile(data: PasteClipboardImageEventDetail) {
    let newFile = data.file; // for fallback

    try {
      // File.name is readonly so we do this
      const formData = new FormData();
      formData.append('file', data.file, data.imageFileName);
      newFile = formData.get('file') as File;
    } catch (e) {
      console.error('paste image error', e);
    }
    return newFile;
  }
}

interface PasteClipboardImageEventDetail {
  file: File;
  imageFileName: string;
  originalEvent: ClipboardEvent;
}
