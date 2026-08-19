import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

/**
 * Konfiguracija za pečenje statičkog HTML-a.
 *
 * Namerno se ne spaja sa appConfig: on sadrži provideBrowserGlobalErrorListeners,
 * koji kači slušače na window — a pri pečenju window ne postoji.
 */
export const config: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};
