import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Activity, ClipboardList, Stethoscope, Users, ShoppingBag, Baby, Calculator, MapPin, Lock } from 'lucide-angular';
import { UiCard } from '../../../shared/ui/card/card';
import { UiButton } from '../../../shared/ui/button/button';
import { MomVisual } from '../../../shared/illustrations/mom-visual/mom-visual';
import { SeoService } from '../../vodic/seo.service';

@Component({
  selector: 'app-javna-pocetna',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, UiCard, UiButton, MomVisual],
  templateUrl: './pocetna.html',
  styleUrls: ['../javno.scss', './pocetna.scss']
})
export class JavnaPocetna implements OnInit {
  private seo = inject(SeoService);

  /** Ono što posetiteljka može da otvori odmah, bez naloga. */
  readonly odmah = [
    { putanja: '/trudnoca', ikona: Baby, naslov: 'Nedelju po nedelju',
      tekst: 'Šta se dešava sa bebom i sa tobom, od 4. do 42. nedelje.' },
    { putanja: '/kalkulator-termina', ikona: Calculator, naslov: 'Kalkulator termina',
      tekst: 'Izračunaj termin porođaja i nedelju u kojoj si sada.' },
    { putanja: '/porodilista', ikona: MapPin, naslov: 'Porodilišta u Srbiji',
      tekst: 'Spisak ustanova po gradovima, sa adresama i telefonima.' },
  ];

  /** Ono što traži nalog — zato stoji odvojeno, sa katancem. */
  readonly uAplikaciji = [
    { ikona: Activity, naslov: 'Praćenje trudnoće', tekst: 'Simptomi, raspoloženje, težina, kontrakcije i terapija — na jednom mestu.' },
    { ikona: ClipboardList, naslov: 'Pregledi i nalazi', tekst: 'Zakazani pregledi, podsetnici i mesto za nalaze.' },
    { ikona: Stethoscope, naslov: 'Lekari', tekst: 'Ginekolozi iz registra Lekarske komore, sa ocenama korisnica.' },
    { ikona: Users, naslov: 'Zajednica', tekst: 'Pitanja i iskustva drugih trudnica — anonimno ako želiš.' },
    { ikona: ShoppingBag, naslov: 'Priprema', tekst: 'Šta spakovati za porodilište i šta kupiti pre dolaska bebe.' },
  ];

  ngOnInit() {
    this.seo.postavi(
      'Prati trudnoću nedelju po nedelju',
      'Besplatna aplikacija za praćenje trudnoće na srpskom: razvoj bebe po nedeljama, kalkulator termina, porodilišta u Srbiji, simptomi, težina i pregledi.',
      '/',
    );
  }

  readonly LockIcon = Lock;
}
