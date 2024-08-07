import { ChangeDetectorRef, Directive, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FeatureNames } from '../../../features/feature-names';
import { openFeatureDialog } from '../../../features/shared/base-feature.component';
import { consoleLogEditForm } from '../../../shared/helpers/console-log-angular.helper';
import { FeaturesService } from '../../../shared/services/features.service';
import { FieldConfigSet } from '../../form/builder/fields-builder/field-config-set.model';
import { ElementEventListener, PasteClipboardImageEventDetail } from '../models';
import { BaseDirective } from '../../../shared/directives/base.directive';

@Directive({
  selector: '[appPasteClipboardImage]',
  standalone: true
})
export class PasteClipboardImageDirective extends BaseDirective implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() elementType: string;
  private eventListeners: ElementEventListener[] = [];

  private pasteImageEnabled = this.features.isEnabled(FeatureNames.PasteImageFromClipboard);


  constructor(
    private elementRef: ElementRef,
    private features: FeaturesService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
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
    super.ngOnDestroy();
  }

  private handleImage(event: CustomEvent) {
    if (this.pasteImageEnabled) {
      consoleLogEditForm('PASTE IMAGE', 'event:', event);
      // todo: convert png to jpg to reduce file size
      const image = this.getFile(event.detail as PasteClipboardImageEventDetail);
      this.config.dropzone.uploadFile(image);
    } else {
      this.snackBar.open(this.translate.instant('Message.PastingFilesIsNotEnabled'), this.translate.instant('Message.FindOutMore'), { duration: 3000 }).onAction().subscribe(() => {
        openFeatureDialog(this.dialog, FeatureNames.PasteImageFromClipboard, this.viewContainerRef, this.changeDetectorRef);
      });
    }
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
