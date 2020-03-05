import { Component, OnInit, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss']
})
export class GettingStartedComponent implements OnInit {
  @Input() gettingStartedUrl: string;
  gettingStartedSafe: SafeUrl;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.gettingStartedSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.gettingStartedUrl);
  }

}
