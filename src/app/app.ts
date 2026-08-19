import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiCookieConsent } from './shared/ui/cookie-consent/cookie-consent';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiCookieConsent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private analytics = inject(AnalyticsService);

  ngOnInit() {
    // Čita ranije dat pristanak; bez njega se ništa ne učitava.
    this.analytics.init();
  }
}
