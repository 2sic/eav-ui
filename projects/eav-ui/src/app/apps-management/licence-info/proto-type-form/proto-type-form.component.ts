import { Component, effect, Inject, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { transient } from 'projects/core';
import { ContentItemsService } from '../../../content-items/services/content-items.service';
import { eavConstants } from '../../../shared/constants/eav.constants';
import { ClosingDialogState, DialogRoutingState } from '../../models/routeState.model';

export interface ProtoTypeFormResult {
  tempVersionNr: string;
}



@Component({
  selector: 'app-proto-type-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
  ],
  templateUrl: './proto-type-form.component.html',
  styleUrl: './proto-type-form.component.scss'
})
export class ProtoTypeFormComponent {


  #contentItemsSvc = transient(ContentItemsService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  form: UntypedFormGroup;
  loading = signal<boolean>(false);

  isReturnValueMode = false;

  contentItem = this.#contentItemsSvc.getAllSig(eavConstants.contentTypes.appConfiguration, /* initial: */ null);

  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: DialogRoutingState,
    private dialog: MatDialogRef<ProtoTypeFormComponent>,
  ) {
    this.isReturnValueMode = dialogData?.returnValue;

    this.form = this.buildForm();

    effect(() => {
      const item = this.contentItem();
      if (item) {
        const version = item?.[0]?.Version ?? null;
        this.form.get('tempVersionNr')?.setValue(version);
      }
    })
  }
 

  closeDialog(): void {
    this.dialog.close();
  }

  save() {
    const formValue = this.form.value.nr;
    if (this.isReturnValueMode) {
      const value = this.form.value;
      this.router.navigate(['../'], { relativeTo: this.route, state: { dialogValue: value } satisfies ClosingDialogState<ProtoTypeFormResult> });
    } else {
      console.log('Submit to backend:', formValue);
    }
  }

  private buildForm(): UntypedFormGroup {

    const form = new UntypedFormGroup({
      tempVersionNr: new UntypedFormControl(null, [Validators.required]),
    });
    return form;
  }

}
