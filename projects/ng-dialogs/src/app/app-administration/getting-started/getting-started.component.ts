import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GettingStartedComponent implements OnInit {
  @Input() private gettingStartedUrl: string;
  gettingStartedSafe: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.gettingStartedSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.gettingStartedUrl);
  }
}
