import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';

@Component({
  selector: 'app-nema-strane',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCard, UiButton],
  templateUrl: './nema-strane.html',
  styleUrl: '../javno.scss'
})
export class NemaStrane implements OnInit {
  private seo = inject(SeoService);

  ngOnInit() {
    this.seo.postavi(
      'Stranica nije pronađena',
      'Tražena stranica ne postoji. Pogledaj vodič kroz trudnoću, kalkulator termina ili spisak porodilišta.',
      '/404',
    );
  }
}
