import { Component, OnInit, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss']
})
export class CodeSnippetsComponent implements OnInit {
  @Input() snippets: any;
  snippetSet = 'Content';
  setsKeys: string[];
  activeSnips: any[];

  constructor() { }

  ngOnInit() {
    this.activeSnips = this.snippets[this.snippetSet];
    this.setsKeys = Object.keys(this.snippets);
    console.log('Snippets', this.activeSnips);
  }

  onSetChange(event: MatSelectChange) {
    this.snippetSet = event.value;
    this.activeSnips = this.snippets[this.snippetSet];
    console.log('Snippets', this.activeSnips);
  }

}
