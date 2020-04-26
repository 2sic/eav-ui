import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

import { SourceView } from '../models/source-view.model';
import { EditForm } from '../../app-administration/shared/models/edit-form.model';
import { DialogService } from '../../shared/services/dialog.service';

@Component({
  selector: 'app-code-templates',
  templateUrl: './code-templates.component.html',
  styleUrls: ['./code-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeTemplatesComponent implements OnInit {
  @Input() view: SourceView;
  @Input() templates: string[];

  constructor(private dialogService: DialogService) { }

  ngOnInit() {
  }

  openTemplate(path: string) {
    const form: EditForm = {
      items: [
        { Path: path }
      ]
    };
    this.dialogService.openCode(form);
  }

}
