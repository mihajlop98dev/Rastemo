import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { TermsGate } from '../terms-gate/terms-gate';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar, MobileNav, TermsGate],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Posle Google prijave korisnica sleti ovde, na /home. Ako je krenula sa
   * foruma, ovde se pokupi zapamćena putanja i vraća je tamo — inače bi
   * obećanje „vratićemo te na temu" važilo samo za prijavu lozinkom.
   */
  ngOnInit() {
    const nazad = this.auth.uzmiPovratak();
    if (nazad) this.router.navigateByUrl(nazad);
  }
}
