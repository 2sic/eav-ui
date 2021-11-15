import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContentType } from '../../app-administration/models';
import { ContentTypesService } from '../../app-administration/services';
import { eavConstants } from '../../shared/constants/eav.constants';
import { MetadataSaveDialogTemplateVars, MetadataSaveFormValues } from './metadata-save-dialog.models';

@Component({
  selector: 'app-metadata-save-dialog',
  templateUrl: './metadata-save-dialog.component.html',
  styleUrls: ['./metadata-save-dialog.component.scss']
})
export class MetadataSaveDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  templateVars$: Observable<MetadataSaveDialogTemplateVars>;

  private contentTypes$: BehaviorSubject<ContentType[]>;

  constructor(
    private dialogRef: MatDialogRef<MetadataSaveDialogComponent>,
    private contentTypesService: ContentTypesService,
  ) { }

  ngOnInit(): void {
    this.contentTypes$ = new BehaviorSubject<ContentType[]>([]);

    this.form = new FormGroup({});
    this.form.addControl('contentType', new FormControl(null, [Validators.required]));

    this.contentTypesService.retrieveContentTypes(eavConstants.scopes.default.value).subscribe(contentTypes => {
      this.contentTypes$.next(contentTypes);
    });

    this.templateVars$ = combineLatest([this.contentTypes$]).pipe(
      map(([contentTypes]) => {
        const templateVars: MetadataSaveDialogTemplateVars = {
          contentTypes,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    this.contentTypes$.complete();
  }

  closeDialog(contentType?: string): void {
    this.dialogRef.close(contentType);
  }

  confirm(): void {
    const formValues: MetadataSaveFormValues = this.form.getRawValue();
    this.closeDialog(formValues.contentType);
  }
}
