import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent,
  IonTextarea, IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { httpErrorMessage } from '../../utils/error';
import { StarRatingComponent } from '../../components/star-rating.component';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonContent,
    IonTextarea, IonIcon, StarRatingComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-button (click)="cancel()">Cancelar</ion-button></ion-buttons>
        <ion-title>{{ editing ? 'Editar reseña' : 'Nueva reseña' }}</ion-title>
        <ion-buttons slot="end"><ion-button strong="true" (click)="save()" [disabled]="loading()">Guardar</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (movie(); as m) {
        <div class="movie-head">
          @if (m.poster) { <img class="poster" [src]="m.poster" alt="poster" /> }
          @else { <div class="poster empty-poster">🎬</div> }
          <div>
            <h2>{{ m.title }}</h2>
            <p class="type">{{ m.mediaType === 'tv' ? 'Serie' : 'Película' }}</p>
          </div>
        </div>
      }

      <div class="card">
        <h3>Tu puntaje</h3>
        <div class="rating-row">
          <app-star-rating [value]="rating()" [size]="40" [editable]="true" (valueChange)="rating.set($event)" [color]="color()"></app-star-rating>
          <span class="val">{{ rating() > 0 ? (rating().toFixed(1) + ' / 5') : '–' }}</span>
        </div>
        <p class="hint">Toca la mitad izquierda de una estrella para media estrella.</p>
        @if (auth.user()?.isCritic) { <p class="critic">🎬 Reseñas como crítico</p> }
      </div>

      <div class="card">
        <h3>Tu opinión</h3>
        <ion-textarea
          fill="outline" [autoGrow]="true" [rows]="5" [maxlength]="2000"
          placeholder="¿Qué te pareció? (opcional)"
          [(ngModel)]="text"
        ></ion-textarea>
      </div>

      @if (error()) { <p class="err">{{ error() }}</p> }

      <ion-button expand="block" (click)="save()" [disabled]="loading()">
        <ion-icon slot="start" name="send-outline"></ion-icon>
        {{ editing ? 'Guardar cambios' : 'Publicar reseña' }}
      </ion-button>
    </ion-content>
  `,
  styles: [`
    .movie-head { display: flex; gap: 12px; align-items: center; background: var(--ion-color-step-100, #1f2937); border-radius: 14px; padding: 12px; margin-bottom: 16px; }
    .poster { width: 50px; height: 75px; border-radius: 8px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .movie-head h2 { font-size: 16px; font-weight: 700; margin: 0; }
    .type { color: var(--ion-color-medium); font-size: 12px; margin: 4px 0 0; }
    .card { background: var(--ion-color-step-100, #1f2937); border-radius: 14px; padding: 16px; margin-bottom: 16px; }
    .card h3 { font-size: 16px; font-weight: 700; margin: 0 0 12px; }
    .rating-row { display: flex; align-items: center; gap: 14px; }
    .val { font-size: 16px; font-weight: 800; }
    .hint { color: var(--ion-color-medium); font-size: 12px; font-style: italic; margin: 10px 0 0; }
    .critic { color: #f5c518; font-size: 12px; font-weight: 700; margin: 6px 0 0; }
    .err { color: var(--ion-color-danger); font-size: 13px; text-align: center; margin: 0 0 12px; }
  `],
})
export class ReviewFormPage {
  private data = inject(DataService);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private toast = inject(ToastController);

  private movieId = this.route.snapshot.paramMap.get('movieId') || '';
  private reviewId = this.route.snapshot.queryParamMap.get('reviewId') || undefined;

  movie = signal(this.data.movies().find((m) => m.id === this.movieId));
  private existing = this.reviewId ? this.data.myReviews().find((r) => r.id === this.reviewId) : undefined;
  editing = !!this.existing;

  rating = signal<number>(this.existing?.rating ?? 0);
  text = this.existing?.text ?? '';
  error = signal('');
  loading = signal(false);

  color(): string {
    return this.auth.user()?.isCritic ? '#f5c518' : '#21d07a';
  }

  async save(): Promise<void> {
    this.error.set('');
    if (this.rating() <= 0) {
      this.error.set('Selecciona un puntaje (al menos media estrella).');
      return;
    }
    this.loading.set(true);
    try {
      if (this.editing && this.reviewId) {
        await this.data.updateReview(this.reviewId, { rating: this.rating(), text: this.text.trim() });
      } else {
        await this.data.createReview(this.movieId, { rating: this.rating(), text: this.text.trim() });
      }
      this.location.back();
    } catch (e) {
      const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
      await t.present();
    } finally {
      this.loading.set(false);
    }
  }

  cancel(): void {
    this.location.back();
  }
}
