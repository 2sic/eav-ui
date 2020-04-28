import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { ElementEventListener } from '../../../../shared/element-event-listener-model';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss']
})
export class VisualQueryComponent implements OnInit, OnDestroy {
  explorer = {
    run: 'run',
    add: 'add'
  };
  activeExplorer: string;
  queryDef: any;

  private pipelineId: number;
  private eventListeners: ElementEventListener[] = [];

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private queryDefinitionService: QueryDefinitionService,
    private titleService: Title,
    private zone: NgZone,
  ) {
    this.context.init(this.route);
    const pipelineId = this.route.snapshot.paramMap.get('pipelineId');
    this.pipelineId = parseInt(pipelineId, 10);
    this.attachListeners();
  }

  ngOnInit() {
    this.loadQuery();
  }

  ngOnDestroy() {
    this.detachListeners();
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

  savePipeline() {

  }

  private loadQuery() {
    this.queryDefinitionService.loadQuery(this.pipelineId).then(res => {
      console.log(res);
      this.queryDef = res;
      this.titleService.setTitle(`${this.queryDef.data.Pipeline.Name} - Visual Query`);
    });
  }

  private attachListeners() {
    this.zone.runOutsideAngular(() => {
      const save = this.keyboardSave.bind(this);
      window.addEventListener('keydown', save);
      this.eventListeners.push({ element: window, type: 'keydown', listener: save });
    });
  }

  private detachListeners() {
    this.zone.runOutsideAngular(() => {
      this.eventListeners.forEach(listener => {
        listener.element.removeEventListener(listener.type, listener.listener);
      });
      this.eventListeners = null;
    });
  }

  private keyboardSave(e: KeyboardEvent) {
    const CTRL_S = e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey);
    if (!CTRL_S) { return; }
    e.preventDefault();
    this.zone.run(() => { this.savePipeline(); });
  }

}
