import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Context } from '../shared/services/context';
import { PlumbEditorComponent } from './plumb-editor/plumb-editor.component';
import { VisualQueryStateService } from './services/visual-query.service';
import { AddExplorerComponent } from './add-explorer/add-explorer.component';
import { RunExplorerComponent } from './run-explorer/run-explorer.component';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-visual-query',
  templateUrl: './visual-query.component.html',
  styleUrls: ['./visual-query.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    NgClass,
    MatIconModule,
    RunExplorerComponent,
    AddExplorerComponent,
    PlumbEditorComponent,
  ],
  providers: [
    VisualQueryStateService,  // Shared State for the entire Visual Query, - init run here
  ],
})
export class VisualQueryComponent implements OnInit {
  @ViewChild(PlumbEditorComponent) plumbEditor: PlumbEditorComponent;

  explorer = {
    run: 'run',
    add: 'add'
  };
  activeExplorer = this.explorer.run;

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private visualQueryService: VisualQueryStateService
  ) {
    this.context.init(this.route);
  }

  ngOnInit() {
    this.visualQueryService.init();
  }

  toggleExplorer(explorer: string) {
    this.activeExplorer = (this.activeExplorer === explorer) ? null : explorer;
  }

  openHelp() {
    window.open('https://go.2sxc.org/visual-query', '_blank');
  }

}
