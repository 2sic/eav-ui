import { AfterViewInit, Component, computed, HostBinding, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { transient } from '../../../../../../core';
import { classLog } from '../../../../../../shared/logging';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { FieldHintComponent } from '../../../shared/components/field-hint/field-hint';
import { dropdownInsertValue } from '../../../shared/constants/dropdown-insert-value.constant';
import { eavConstants, ScopeOption } from '../../../shared/constants/eav.constants';
import { DialogHeaderComponent } from "../../../shared/dialog-header/dialog-header";
import { ClickStopPropagationDirective } from '../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SaveCloseButtonFabComponent } from '../../../shared/modules/save-close-button-fab/save-close-button-fab';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { contentTypeNameError, contentTypeNamePattern } from '../../constants/content-type.patterns';
import { ContentTypeEdit } from '../../models/content-type.model';
import { ContentTypesService } from '../../services/content-types.service';

@Component({
  selector: 'app-edit-content-type',
  templateUrl: './edit-content-type.html',
  styleUrls: ['./edit-content-type.scss'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    FieldHintComponent,
    ClickStopPropagationDirective,
    TippyDirective,
    SaveCloseButtonFabComponent,
    DialogHeaderComponent
]
})
export class EditContentTypeComponent implements OnInit, AfterViewInit {

  log = classLog({ EditContentTypeComponent });

  @HostBinding('className') hostClass = 'dialog-component';
  @ViewChild('ngForm', { static: false }) ngForm?: NgForm;

  #contentTypeSvc = transient(ContentTypesService);

  /** Parameters in case of rename; scope should always be set as we want to always create in that scope*/
  #scope = this.route.snapshot.parent.paramMap.get('scope');
  #typeNameId = this.route.snapshot.paramMap.get('contentTypeStaticName');

  constructor(
    private dialog: MatDialogRef<EditContentTypeComponent>,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.log.a('constructor');
    this.#loadContentTypeOnEdit();
  }

  ngOnInit() {
    this.#watchKeyboardShortcuts();
  }

  #loadContentTypeOnEdit(): void {
    // If we're in new mode, just keep empty values
    if (!this.modeIsEdit)
      return;

    // Preload infos about the current content type if we're in edit mode (not new)
    this.#contentTypeSvc.retrieveContentType(this.#typeNameId).subscribe(fromHttp => {
      this.contentType.set({
        ...fromHttp,
        ChangeNameId: false,
        NewNameId: fromHttp.NameId,
      } satisfies ContentTypeEdit);
    });
  }

  /** RegEx property to use in HTML */
  protected contentTypeNamePattern = contentTypeNamePattern;
  protected contentTypeNameError = contentTypeNameError;
  protected dropdownInsertValue = dropdownInsertValue;

  protected modeIsEdit = !!this.#typeNameId;

  protected lockScope = signalObj<boolean>('lockScope', true);
  protected disableAnimation = signalObj<boolean>('disableAnimation', true);
  protected loading = signalObj<boolean>('loading', false);
  protected formValid = signal(false);
  protected canSave = computed(() => this.formValid() && !this.loading());
  protected contentType = signalObj<ContentTypeEdit>('contentType', {
    StaticName: '',
    // TODO: @2pp - use NameId: '', instead of StaticName
    Name: '',
    Description: '',
    Scope: this.#scope,
    ChangeNameId: false,
    NewNameId: '',
  } as ContentTypeEdit);

  #scopeOptionsHttp = this.#contentTypeSvc.getScopesSig();
  #scopeOptionsManual = signalObj<ScopeOption[]>('scopeOptionsManual', []);
  protected scopeOptions = computedObj<ScopeOption[]>('scopeOptions', () => {
    const fromHttp = this.#scopeOptionsHttp();
    const manual = this.#scopeOptionsManual();
    return (fromHttp) ? manual.concat(this.#convertScopeOptions(fromHttp)) : manual;
  });

  #convertScopeOptions(scopeOptions: ScopeOption[]) {
    const newScopes: ScopeOption[] = [];
    scopeOptions.forEach(scopeOption => {
      if (!newScopes.some(scope => scope.value === scopeOption.value))
        newScopes.push(scopeOption);
    });
    if (!newScopes.some(scope => scope.value === this.#scope))
      newScopes.push({
        name: this.#scope,
        value: this.#scope,
      } satisfies ScopeOption);
    return newScopes;
  }

  // workaround for angular component issue #13870
  ngAfterViewInit() {
    this.ngForm?.form.statusChanges.subscribe(() => {
      this.formValid.set(this.ngForm?.form.valid ?? false);
    });
    // timeout required to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.disableAnimation.set(false));
  }

  closeDialog() {
    this.dialog.close();
  }

  changeContentTypeName(newName: string) {
    this.contentType.set({ ...this.contentType(), Name: newName });
  }

  changeScope(newScope: string) {
    if (newScope === dropdownInsertValue) {
      newScope = prompt('This is an advanced feature to show content-types of another scope. Don\'t use this if you don\'t know what you\'re doing, as content-types of other scopes are usually hidden for a good reason.') || eavConstants.scopes.default.value;
      if (!this.scopeOptions().some(o => o.value === newScope)) {
        this.#scopeOptionsManual.set([
          {
            name: newScope,
            value: newScope,
          } satisfies ScopeOption,
          ...this.scopeOptions()
        ]);
      }
    }
    this.contentType.set({ ...this.contentType(), Scope: newScope });
  }

  unlockScope() {
    this.lockScope.set(!this.lockScope());
    if (this.lockScope())
      this.contentType.set({ ...this.contentType(), Scope: this.#scope });
  }

  saveAndClose() {
    this.loading.set(true);
    this.snackBar.open('Saving...');
    this.#contentTypeSvc.save(this.contentType()).subscribe(result => {
      this.loading.set(false);
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event) && this.canSave()) {
        event.preventDefault();
        this.saveAndClose();
      }
    });
  }
}
