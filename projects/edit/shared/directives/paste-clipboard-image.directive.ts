import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';

import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FeatureService } from '../store/ngrx-data/feature.service';
import { FeaturesGuidsConstants } from '../../../shared/features-guids.constants';
import { ElementEventListener } from '../../../shared/element-event-listener.model';
import { PasteClipboardImageEventDetail } from '../models/adam/paste-clipboard-image';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Directive({ selector: '[appPasteClipboardImage]' })
export class PasteClipboardImageDirective implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() elementType: string;
  private eventListeners: ElementEventListener[] = [];

  constructor(private elementRef: ElementRef, private featureService: FeatureService) { }

  ngOnInit() {
    if (!this.featureService.isFeatureEnabled(FeaturesGuidsConstants.PasteImageFromClipboard)) { return; }

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
    angularConsoleLog('PASTE IMAGE', 'event:', event);
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
