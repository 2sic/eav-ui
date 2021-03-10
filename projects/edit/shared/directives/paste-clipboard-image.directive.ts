import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { consoleLogAngular } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FeaturesConstants } from '../constants';
import { PasteClipboardImageEventDetail } from '../models';
import { ElementEventListener } from '../models';
import { FeatureService } from '../store/ngrx-data';

@Directive({ selector: '[appPasteClipboardImage]' })
export class PasteClipboardImageDirective implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() elementType: string;
  private eventListeners: ElementEventListener[] = [];

  constructor(private elementRef: ElementRef, private featureService: FeatureService) { }

  ngOnInit() {
    if (!this.featureService.isFeatureEnabled(FeaturesConstants.PasteImageFromClipboard)) { return; }

    switch (this.elementType) {
      case 'input':
        this.elementRef.nativeElement.pastableTextarea();
        break;
      case 'element':
        this.elementRef.nativeElement.pastableNonInputable();
        break;
    }
    const handleImageBound = this.handleImage.bind(this);
    this.elementRef.nativeElement.addEventListener('handleImage', handleImageBound);

    this.eventListeners.push(
      { element: this.elementRef.nativeElement, type: 'handleImage', listener: handleImageBound },
    );
  }

  ngOnDestroy() {
    // spm 2019-10-24 paste.js which handles clipboard paste doesn't destroy listeners
    this.eventListeners.forEach(eventListener => {
      const element = eventListener.element;
      const type = eventListener.type;
      const listener = eventListener.listener;
      element.removeEventListener(type, listener);
    });
  }

  private handleImage(event: CustomEvent) {
    consoleLogAngular('PASTE IMAGE', 'event:', event);
    // todo: convert png to jpg to reduce file size
    const image = this.getFile(event.detail as PasteClipboardImageEventDetail);
    this.config.dropzone.uploadFile(image);
  }

  private getFile(data: PasteClipboardImageEventDetail) {
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
