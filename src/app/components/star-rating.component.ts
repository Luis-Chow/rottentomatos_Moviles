import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div
      class="stars"
      [class.editable]="editable"
      [style.width.px]="max * size"
      [style.height.px]="size * 1.15"
      (click)="onClick($event)"
    >
      <div class="layer empty">
        @for (s of starsArray; track $index) {
          <span class="star" [style.width.px]="size" [style.fontSize.px]="size">★</span>
        }
      </div>
      <div class="layer fill" [style.width.px]="fillWidth" [style.color]="color">
        @for (s of starsArray; track $index) {
          <span class="star" [style.width.px]="size" [style.fontSize.px]="size">★</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .stars { position: relative; display: inline-block; }
    .stars.editable { cursor: pointer; }
    .layer { position: absolute; top: 0; left: 0; display: flex; overflow: hidden; white-space: nowrap; }
    .layer.empty { color: rgba(255, 255, 255, 0.22); }
    /* flex: 0 0 auto evita que las estrellas de color se encojan al recortar
       el ancho de la capa "fill" y queden desalineadas con las vacías. */
    .star { flex: 0 0 auto; text-align: center; line-height: 1.15; }
  `],
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() max = 5;
  @Input() size = 20;
  @Input() color = '#f5c518';
  @Input() editable = false;
  @Output() valueChange = new EventEmitter<number>();

  get starsArray(): number[] {
    return Array.from({ length: this.max }, (_, i) => i);
  }

  get fillWidth(): number {
    const clamped = Math.max(0, Math.min(this.max, this.value));
    return clamped * this.size;
  }

  // Calcula el puntaje (en pasos de 0.5) según la posición del toque.
  onClick(event: MouseEvent): void {
    if (!this.editable) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const half = this.size / 2;
    let v = Math.ceil(x / half) * 0.5;
    if (v < 0.5) v = 0.5;
    if (v > this.max) v = this.max;
    this.value = v;
    this.valueChange.emit(v);
  }
}
