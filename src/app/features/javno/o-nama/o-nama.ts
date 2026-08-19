import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { SeoService } from '../../vodic/seo.service';
import { LEGAL_CONTACT_EMAIL, DATA_CONTROLLER } from '../../../core/data/legal';

@Component({
  selector: 'app-o-nama',
  standalone: true,
  imports: [CommonModule, RouterLink, UiCard, UiButton],
  templateUrl: './o-nama.html',
  styleUrl: '../javno.scss'
})
export class ONama implements OnInit {
  private seo = inject(SeoService);
  readonly kontakt = LEGAL_CONTACT_EMAIL;
  readonly rukovalac = DATA_CONTROLLER;

  ngOnInit() {
    this.seo.postavi(
      'O nama',
      'Ko stoji iza Dnevnika trudnoće, odakle dolazi sadržaj i kako se odnosimo prema tvojim podacima.',
      '/o-nama',
    );
  }
}
