
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { TippyDirective } from '../../shared/directives/tippy.directive';
@Component({
  selector: 'recycle-bin',
  templateUrl: './recycle-bin.html',
  styleUrls: ['./recycle-bin.scss'],
  imports: [
    MatIconModule,
    RouterOutlet,
    MatButtonModule,
    TippyDirective
  ]
})
export class AppRecycleBin {

}