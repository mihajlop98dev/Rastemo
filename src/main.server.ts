import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

/** Kontekst je obavezan pri pečenju — bez njega Angular ne zna na kojoj je platformi. */
export default (context: BootstrapContext) => bootstrapApplication(App, config, context);
