import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { VisualQueryRoutingModule } from './visual-query-routing.module';
import { VisualQueryComponent } from './visual-query.component';
import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { RunExplorerComponent } from './run-explorer/run-explorer.component';

@NgModule({
  declarations: [
    VisualQueryComponent,
    RunExplorerComponent,
  ],
  entryComponents: [
    VisualQueryComponent,
    RunExplorerComponent,
  ],
  imports: [
    CommonModule,
    VisualQueryRoutingModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  providers: [
    Context,
    QueryDefinitionService,
  ]
})
export class VisualQueryModule { }
