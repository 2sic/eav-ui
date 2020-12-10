import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditInitializerService } from '../shared/services/edit-initializer.service';
import { EditEntryTemplateVars } from './edit-entry.models';

@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.scss'],
  providers: [EditInitializerService],
})
export class EditEntryComponent implements OnInit {
  templateVars$: Observable<EditEntryTemplateVars>;

  constructor(private editInitializerService: EditInitializerService) { }

  ngOnInit() {
    this.templateVars$ = combineLatest([this.editInitializerService.loaded$]).pipe(
      map(([loaded]) => {
        const templateVars: EditEntryTemplateVars = {
          loaded,
        };
        return templateVars;
      }),
    );
    this.editInitializerService.fetchFormData();
  }
}
