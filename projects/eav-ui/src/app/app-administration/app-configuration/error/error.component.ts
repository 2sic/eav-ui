import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  standalone: true,
  imports: []
})
export class ErrorComponent implements OnInit {
  errorMessage: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.errorMessage = params['error'] || 'Something went wrong. Please try again later.';
    });
  }
}