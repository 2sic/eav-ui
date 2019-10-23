import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FeatureService } from '../store/ngrx-data/feature.service';
import { FeaturesGuidsConstants } from '../../../../projects/shared/features-guids.constants';

@Directive({ selector: '[appPasteClipboardImage]' })
export class PasteClipboardImageDirective implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() elementType: string;

  constructor(
    private elementRef: ElementRef,
    private featureService: FeatureService,
  ) { }

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
    this.elementRef.nativeElement.addEventListener('handleImage', (ev, data) => {
      console.log('PASTE IMAGE');
      if (ev.detail && !data) { data = ev.detail; }
      // todo: convert png to jpg to reduce file size
      const filename = ev.imageFileName ? ev.imageFileName : ev.detail.imageFileName;
      const image = this.getFile(data, filename);
      this.config.saveImage(image);
    });
  }

  private getFile(data, fileName) {
    let newFile = data.file; // for fallback

    try {
      // File.name is readonly so we do this
      const formData = new FormData();
      formData.append('file', data.file, fileName);
      newFile = formData.get('file');
    } catch (e) {
      console.log('paste image error', e);
    }
    return newFile;
  }
}
