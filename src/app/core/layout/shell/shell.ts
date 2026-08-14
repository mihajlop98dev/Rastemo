import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { TermsGate } from '../terms-gate/terms-gate';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar, MobileNav, TermsGate],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {}
