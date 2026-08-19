import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { SeoService } from '../../vodic/seo.service';
import { LEGAL_CONTACT_EMAIL, LEGAL_ENTITY } from '../../../core/data/legal';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCard],
  templateUrl: './kontakt.html',
  styleUrls: ['../javno.scss', './kontakt.scss']
})
export class Kontakt implements OnInit {
  private seo = inject(SeoService);
  readonly kontakt = LEGAL_CONTACT_EMAIL;
  readonly rukovalac = LEGAL_ENTITY;

  ngOnInit() {
    this.seo.postavi(
      'Kontakt',
      'Piši nam za pitanja, predloge, prijavu greške ili zahtev za brisanje podataka.',
      '/kontakt',
    );
  }
}
