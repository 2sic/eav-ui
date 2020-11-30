import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SaveStatusDialogComponent } from '../../eav-material-controls/dialogs/save-status-dialog/save-status-dialog.component';
import { SaveStatusDialogData } from '../../eav-material-controls/dialogs/save-status-dialog/save-status-dialog.models';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';
import { PublishStatusService } from '../../shared/store/ngrx-data/publish-status.service';
import { FormHeaderTemplateVars } from './multi-item-edit-form-header.models';

@Component({
  selector: 'app-multi-item-edit-form-header',
  templateUrl: './multi-item-edit-form-header.component.html',
  styleUrls: ['./multi-item-edit-form-header.component.scss'],
})
export class MultiItemEditFormHeaderComponent implements OnInit {
  @Input() formId: number;
  @Input() isCopy: boolean;
  @Input() formsAreValid: boolean;
  @Input() allControlsAreDisabled: boolean;
  @Input() isParentDialog: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  templateVars$: Observable<FormHeaderTemplateVars>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: PublishStatusService,
  ) { }

  ngOnInit() {
    const hasLanguages$ = this.languageService.entities$.pipe(map(languages => languages.length > 0));
    const publishMode$ = this.publishStatusService.getPublishMode$(this.formId);
    this.templateVars$ = combineLatest([hasLanguages$, publishMode$]).pipe(
      map(([hasLanguages, publishMode]) => {
        const templateVars: FormHeaderTemplateVars = {
          hasLanguages,
          publishMode,
        };
        return templateVars;
      }),
    );
  }

  close() {
    this.closeDialog.emit();
  }

  openSaveStatusDialog() {
    const dialogData: SaveStatusDialogData = {
      formId: this.formId,
    };
    this.dialog.open(SaveStatusDialogComponent, {
      panelClass: 'c-save-status-dialog',
      autoFocus: false,
      width: '350px',
      viewContainerRef: this.viewContainerRef,
      data: dialogData,
    });
  }
}
