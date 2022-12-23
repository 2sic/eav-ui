import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FeatureNames } from '../../../features/feature-names';
import { consoleLogAngular } from '../../../shared/helpers/console-log-angular.helper';
import { FeaturesService } from '../../../shared/services/features.service';
import { FieldConfigSet } from '../../form/builder/fields-builder/field-config-set.model';
import { ElementEventListener, PasteClipboardImageEventDetail } from '../models';

@Directive({ selector: '[appPasteClipboardImage]' })
export class PasteClipboardImageDirective implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() elementType: string;
  private eventListeners: ElementEventListener[] = [];

  constructor(private elementRef: ElementRef, private featuresService: FeaturesService) { }

  ngOnInit() {
    if (!this.featuresService.isEnabled(FeatureNames.PasteImageFromClipboard)) { return; }

    switch (this.elementType) {
      case 'input':
        this.elementRef.nativeElement.pastableTextarea();
        break;
      case 'element':
        this.elementRef.nativeElement.pastableNonInputable();
        break;
    }
    const handleImage = (event: CustomEvent) => { this.handleImage(event); };
    this.elementRef.nativeElement.addEventListener('handleImage', handleImage);

    this.eventListeners.push(
      { element: this.elementRef.nativeElement, type: 'handleImage', listener: handleImage },
    );
  }

  ngOnDestroy() {
    // spm 2019-10-24 paste.js which handles clipboard paste doesn't destroy listeners
    this.eventListeners.forEach(({ element, type, listener }) => {
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
