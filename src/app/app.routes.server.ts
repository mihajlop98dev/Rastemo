import { RenderMode, ServerRoute } from '@angular/ssr';
import { VODIC } from './core/data/vodic-nedelje';
import { IMENA, slugZaIme } from './core/data/imena';

/**
 * Šta se peče u statički HTML, a šta ostaje na pregledaču.
 *
 * Peku se samo javne stranice. One iza prijave nemaju šta da pokažu
 * pretraživaču, a i pucale bi jer traže sesiju koje pri pečenju nema.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'trudnoca/:nedelja',
    renderMode: RenderMode.Prerender,
    // Svaka nedelja dobija svoj HTML fajl, sa svojim naslovom i tekstom.
    getPrerenderParams: async () => VODIC.map(v => ({ nedelja: String(v.nedelja) })),
  },
  {
    path: 'imena/:ime',
    renderMode: RenderMode.Prerender,
    // Svako ime dobija svoju stranu — to je i smisao: pretraga se radi po imenu.
    getPrerenderParams: async () => IMENA.map(i => ({ ime: slugZaIme(i.ime) })),
  },
  { path: 'imena', renderMode: RenderMode.Prerender },
  { path: 'trudnoca', renderMode: RenderMode.Prerender },
  { path: 'kalkulator-termina', renderMode: RenderMode.Prerender },
  { path: 'porodilista', renderMode: RenderMode.Prerender },
  { path: 'cesta-pitanja', renderMode: RenderMode.Prerender },
  { path: 'o-nama', renderMode: RenderMode.Prerender },
  { path: 'kontakt', renderMode: RenderMode.Prerender },
  { path: 'uslovi-koriscenja', renderMode: RenderMode.Prerender },
  { path: 'politika-privatnosti', renderMode: RenderMode.Prerender },
  { path: '', renderMode: RenderMode.Prerender },

  // Prijava i registracija: statične su, pa se i one peku.
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },

  // Sve ostalo je aplikacija — renderuje se u pregledaču, posle prijave.
  // Tu spada i stranica za nepostojeću adresu: koje sve adrese ne postoje se
  // unapred ne zna, pa se ne može ni ispeći.
  { path: '**', renderMode: RenderMode.Client },
];
