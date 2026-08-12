import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
