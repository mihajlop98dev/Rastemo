import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * "Beautiful pregnant woman in a lush pink dress" by Irena Rudovska, Vecteezy
 * Free License (id 48060260) — attribution is a licence condition and is
 * rendered in the public site footer.
 */
@Component({
  selector: 'app-mom-visual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mom-visual.html',
  styleUrl: './mom-visual.scss'
})
export class MomVisual {
  @Input() size: 'md' | 'lg' | 'xl' = 'xl';
}
