import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../shared/constants';
import { AdamHintComponent } from './adam-hint/adam-hint.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { AdamBrowserComponent } from './adam-browser/adam-browser.component';
import { FieldState } from '../../builder/fields-builder/field-state';
import { Subscription } from 'rxjs';

@Component({
  selector: WrappersConstants.AdamWrapper,
  templateUrl: './adam-wrapper.component.html',
  styleUrls: ['./adam-wrapper.component.scss'],
  standalone: true,
  imports: [
    AdamBrowserComponent,
    NgClass,
    ExtendedModule,
    AdamHintComponent,
  ],
})
export class AdamWrapperComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('invisibleClickable') invisibleClickableRef: ElementRef;

  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;

  fullscreenAdam: boolean;
  adamDisabled = signal<boolean>(true);
  subscriptions = new Subscription();

  constructor() {
  }

  ngOnInit() {
    this.fullscreenAdam = this.config.inputTypeStrict === InputTypeConstants.HyperlinkLibrary;
  }

  ngAfterViewInit() {
    this.subscriptions =
      this.config.adam.getConfig$().subscribe(adamConfig => {
        const disabled = adamConfig?.disabled ?? true;
        if (this.adamDisabled() !== disabled) {
          this.adamDisabled.set(disabled);
        }
      })
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  openUpload() {
    this.invisibleClickableRef.nativeElement.click();
  }
}
