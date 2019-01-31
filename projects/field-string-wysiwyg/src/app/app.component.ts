import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // encapsulation: ViewEncapsulation.Native
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
  }
}
