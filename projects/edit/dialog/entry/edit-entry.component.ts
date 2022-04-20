import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { EditInitializerService, LoggingService } from '../../shared/services';
import { EditEntryTemplateVars } from './edit-entry.models';

@Component({
  selector: 'app-edit-entry',
  templateUrl: './edit-entry.component.html',
  styleUrls: ['./edit-entry.component.scss'],
  providers: [LoggingService, EditInitializerService],
})
export class EditEntryComponent implements OnInit {
  templateVars$: Observable<EditEntryTemplateVars>;

  constructor(private editInitializerService: EditInitializerService) { }

  ngOnInit(): void {
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
