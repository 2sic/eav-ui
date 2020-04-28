import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss']
})
export class VisualQueryComponent implements OnInit {
  explorer = {
    run: 'run',
    add: 'add'
  };
  activeExplorer: string;
  queryDef: any;

  private pipelineId: number;

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private queryDefinitionService: QueryDefinitionService,
    private titleService: Title,
  ) {
    this.context.init(this.route);
    const pipelineId = this.route.snapshot.paramMap.get('pipelineId');
    this.pipelineId = parseInt(pipelineId, 10);
  }

  ngOnInit() {
    this.loadQuery();
  }

  toggleExplorer(explorer: string) {
    if (this.activeExplorer === explorer) {
      this.activeExplorer = null;
    } else {
      this.activeExplorer = explorer;
    }
  }

  openHelp() {
    window.open('http://2sxc.org/help', '_blank');
  }

  private loadQuery() {
    this.queryDefinitionService.loadQuery(this.pipelineId).then(res => {
      console.log(res);
      this.queryDef = res;
      this.titleService.setTitle(`${this.queryDef.data.Pipeline.Name} - Visual Query`);
    });
  }

}
