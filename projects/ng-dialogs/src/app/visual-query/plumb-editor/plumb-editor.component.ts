import { Component, OnInit, Input } from '@angular/core';
import { QueryDefinitionService } from '../services/query-definition.service';

@Component({
  selector: 'app-plumb-editor',
  templateUrl: './plumb-editor.component.html',
  styles: [':host {display: block; width: 100%; height: 100%}'],
  styleUrls: ['./pipeline-designer.css', './plumb-editor.component.scss']
})
export class PlumbEditorComponent implements OnInit {
  @Input() queryDef: any;

  constructor(private queryDefinitionService: QueryDefinitionService) { }

  ngOnInit() {
  }

  configureDataSource(dataSource: any) {
  }

  typeInfo(dataSource: any) {
    const typeInfo = this.queryDefinitionService.dsTypeInfo(dataSource, this.queryDef);
    return typeInfo;
  }

  editName(dataSource: any) {
  }

  editDescription(dataSource: any) {
  }

  typeNameFilter(input: any, format: any) {
    const filtered = this.queryDefinitionService.typeNameFilter(input, format);
    return filtered;
  }

  remove(index: number) {
  }

}
