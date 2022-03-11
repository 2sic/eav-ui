import { AbstractControl, ValidationErrors } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

export interface SxcAbstractControl extends AbstractControl {
  _warning$?: BehaviorSubject<ValidationErrors>;
}
