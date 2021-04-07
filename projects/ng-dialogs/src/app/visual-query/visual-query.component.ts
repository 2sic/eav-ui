import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Context } from '../shared/services/context';
import { PlumbEditorComponent } from './plumb-editor/plumb-editor.component';
import { VisualQueryService } from './services/visual-query.service';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss'],
  providers: [VisualQueryService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualQueryComponent implements OnInit {
  @ViewChild(PlumbEditorComponent) plumbEditor: PlumbEditorComponent;

  explorer = {
    run: 'run',
    add: 'add'
  };
  activeExplorer = this.explorer.run;

  constructor(private context: Context, private route: ActivatedRoute, private visualQueryService: VisualQueryService) {
    this.context.init(this.route);
  }

  ngOnInit() {
    this.visualQueryService.init();
  }

  toggleExplorer(explorer: string) {
    this.activeExplorer = (this.activeExplorer === explorer) ? null : explorer;
  }

  openHelp() {
    window.open('https://r.2sxc.org/visual-query', '_blank');
  }

}
