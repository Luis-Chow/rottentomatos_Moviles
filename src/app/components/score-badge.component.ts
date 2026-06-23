import { Component, Input } from '@angular/core';
import { StarRatingComponent } from './star-rating.component';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [StarRatingComponent],
  template: `
    <div class="badge">
      <div class="label">{{ emoji ? emoji + ' ' : '' }}{{ label }}</div>
      <div class="value" [style.color]="hasScore ? color : 'var(--ion-color-medium)'">
        {{ displayValue }}<span class="outof"> / 5</span>
      </div>
      <app-star-rating [value]="hasScore ? (value || 0) : 0" [size]="14" [color]="color"></app-star-rating>
      <div class="count">{{ countLabel }}</div>
    </div>
  `,
  styles: [`
    .badge {
      flex: 1;
      background: var(--ion-color-step-100, #1f2937);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .label { font-size: 13px; font-weight: 700; color: var(--ion-text-color); }
    .value { font-size: 26px; font-weight: 800; }
    .outof { font-size: 13px; font-weight: 600; color: var(--ion-color-medium); }
    .count { font-size: 11px; color: var(--ion-color-medium); margin-top: 2px; }
  `],
})
export class ScoreBadgeComponent {
  @Input() label = '';
  @Input() value: number | null = null;
  @Input() count = 0;
  @Input() color = '#21d07a';
  @Input() emoji = '';

  get hasScore(): boolean {
    return this.value != null && this.count > 0;
  }

  get displayValue(): string {
    return this.hasScore ? (this.value as number).toFixed(1) : '–';
  }

  get countLabel(): string {
    if (this.count === 0) return 'Sin reseñas';
    if (this.count === 1) return '1 reseña';
    return `${this.count} reseñas`;
  }
}
