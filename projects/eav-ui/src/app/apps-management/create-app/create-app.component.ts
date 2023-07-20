import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { appNameError, appNamePattern } from '../constants/app.patterns';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
})
export class CreateAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  form: FormGroup;
  loading$: BehaviorSubject<boolean>;
  appNameError = appNameError;

  viewModel$: Observable<CreateAppViewModel>;

  constructor(
    private dialogRef: MatDialogRef<CreateAppComponent>,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.buildForm();
    this.loading$ = new BehaviorSubject(false);
  }

  ngOnInit(): void {
    this.viewModel$ = combineLatest([this.loading$]).pipe(
      map(([loading]) => ({ loading })),
    );
  }

  ngOnDestroy(): void {
    this.loading$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  create(): void {
    this.form.disable();
    this.loading$.next(true);
    const name = this.form.controls.name.value?.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs;
    this.snackBar.open('Creating app...');
    this.appsListService.create(name).subscribe({
      error: () => {
        this.form.enable();
        this.loading$.next(false);
        this.snackBar.open('Failed to create app. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
        this.form.enable();
        this.snackBar.open('Created app', undefined, { duration: 2000 });
        this.closeDialog();
      },
    });
  }

  private buildForm(): FormGroup {
    const form = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(appNamePattern)]),
    });
    return form;
  }
}

interface CreateAppViewModel {
  loading: boolean;
}
