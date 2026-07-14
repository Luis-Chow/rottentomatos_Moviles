import { Component, Input, signal } from '@angular/core';

// Texto largo con "Ver más / Ver menos" (para reseñas y biografías).
@Component({
  selector: 'app-expandable-text',
  standalone: true,
  template: `
    <p class="txt">{{ displayText() }}
      @if (isLong) {
        <button class="more" type="button" (click)="toggle($event)">
          {{ expanded() ? 'Ver menos' : 'Ver más' }}
        </button>
      }
    </p>
  `,
  styles: [`
    .txt { font-size: 14px; line-height: 1.45; margin: 8px 0 0; opacity: 0.92; white-space: pre-line; }
    .more {
      background: none; border: none; padding: 0; margin-left: 4px;
      color: var(--ion-color-primary); font-size: 13px; font-weight: 700; cursor: pointer;
    }
  `],
})
export class ExpandableTextComponent {
  @Input() text = '';
  @Input() limit = 220; // caracteres visibles antes de recortar

  expanded = signal(false);

  get isLong(): boolean {
    return this.text.length > this.limit;
  }

  displayText(): string {
    if (!this.isLong || this.expanded()) return this.text;
    // Recorta en el último espacio para no partir palabras.
    const cut = this.text.slice(0, this.limit);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > this.limit * 0.6 ? cut.slice(0, lastSpace) : cut) + '…';
  }

  // stopPropagation: las tarjetas que contienen el texto suelen ser clicables.
  toggle(event: Event): void {
    event.stopPropagation();
    this.expanded.update((v) => !v);
  }
}
