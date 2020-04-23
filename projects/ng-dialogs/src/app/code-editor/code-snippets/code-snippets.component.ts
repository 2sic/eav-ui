import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html',
  styleUrls: ['./code-snippets.component.scss']
})
export class CodeSnippetsComponent implements OnInit {
  snippetSet = 'Content';
  snippets: any[] = [];

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < 10; i++) {
      this.snippets.push(`Snippet Set ${i + 1}`);
    }
  }
}
