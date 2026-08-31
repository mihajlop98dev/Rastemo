import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Bez ovoga Angular ne dira skrol pri promeni stranice: ko je bio na dnu
    // dugačkog spiska, na sledećoj stranici bi se zatekao kod podnožja i morao
    // da skroluje naviše da bi video naslov.
    //
    // `enabled` ujedno vraća staru poziciju na dugme „nazad", što je ono što
    // korisnica očekuje kad se vraća na spisak koji je već prelistala.
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
};
