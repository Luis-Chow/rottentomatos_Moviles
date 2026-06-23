import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonIcon, IonButton, IonChip, IonSpinner, IonAvatar,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Movie, Review } from '../../models';
import { httpErrorMessage } from '../../utils/error';
import { StarRatingComponent } from '../../components/star-rating.component';
import { ScoreBadgeComponent } from '../../components/score-badge.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
    IonIcon, IonButton, IonChip, IonSpinner, IonAvatar,
    StarRatingComponent, ScoreBadgeComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/catalog"></ion-back-button></ion-buttons>
        <ion-title>{{ movie()?.title || 'Detalle' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading() && !movie()) {
        <div class="center"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!movie()) {
        <div class="center"><p>Título no encontrado</p></div>
      } @else {
        @let m = movie()!;

        <div class="hero">
          @if (m.poster) { <img class="poster" [src]="m.poster" alt="poster" /> }
          @else { <div class="poster empty-poster">🎬</div> }
          <h1>{{ m.title }}</h1>
          <div class="meta">
            <span class="badge primary">{{ m.mediaType === 'tv' ? 'Serie' : 'Película' }}</span>
            <span>{{ formatDate(m.releaseDate) }}</span>
            @if (m.runtime) { <span>· {{ m.runtime }} min</span> }
          </div>
          @if (m.genres.length) {
            <div class="genres">
              @for (g of m.genres; track g) { <ion-chip>{{ g }}</ion-chip> }
            </div>
          }
        </div>

        <div class="scores">
          <app-score-badge label="Usuarios" emoji="👤" [value]="m.userScore" [count]="m.userScoreCount" color="#21d07a"></app-score-badge>
          <app-score-badge label="Críticos" emoji="🎬" [value]="m.criticScore" [count]="m.criticScoreCount" color="#f5c518"></app-score-badge>
        </div>
        @if (m.tmdbScore) { <p class="tmdb">Nota TMDB: {{ m.tmdbScore.toFixed(1) }} / 10</p> }

        @if (m.overview) {
          <div class="section">
            <h3 class="app-section-title">📖 Sinopsis</h3>
            <p class="overview">{{ m.overview }}</p>
          </div>
        }

        @if (m.cast.length) {
          <div class="section">
            <h3 class="app-section-title">🎭 Reparto</h3>
            <div class="hscroll">
              @for (c of m.cast; track $index) {
                <div class="cast">
                  @if (c.photo) { <img [src]="c.photo" alt="actor" /> }
                  @else { <div class="cast-empty">👤</div> }
                  <span class="cname">{{ c.name }}</span>
                  @if (c.character) { <span class="cchar">{{ c.character }}</span> }
                </div>
              }
            </div>
          </div>
        }

        @if (m.directors?.length) {
          <div class="section">
            <h3 class="app-section-title">🎬 Dirección</h3>
            <p class="overview">{{ m.directors!.join(', ') }}</p>
          </div>
        }

        @if (m.images?.length) {
          <div class="section">
            <h3 class="app-section-title">📸 Imágenes</h3>
            <div class="hscroll">
              @for (img of m.images!; track $index) { <img class="still" [src]="img" alt="still" /> }
            </div>
          </div>
        }

        <div class="section">
          <h3 class="app-section-title">📝 Tu reseña</h3>
          @if (myReview(); as mine) {
            <div class="my-review">
              <div class="stars-row">
                <app-star-rating [value]="mine.rating" [size]="18" [color]="userColor()"></app-star-rating>
                <span class="myscore">{{ mine.rating.toFixed(1) }} / 5</span>
              </div>
              @if (mine.text) { <p class="rtext">{{ mine.text }}</p> }
              <div class="my-actions">
                <ion-button size="small" fill="solid" color="medium" (click)="editReview(mine.id)">
                  <ion-icon slot="start" name="create-outline"></ion-icon>Editar
                </ion-button>
                <ion-button size="small" fill="solid" color="danger" (click)="deleteReview(mine.id)">
                  <ion-icon slot="start" name="trash-outline"></ion-icon>Eliminar
                </ion-button>
              </div>
            </div>
          } @else {
            <ion-button expand="block" (click)="writeReview()">
              <ion-icon slot="start" name="star"></ion-icon>Escribir reseña
            </ion-button>
          }
        </div>

        <div class="section">
          <h3 class="app-section-title">💬 Reseñas ({{ otherReviews().length }})</h3>
          @if (otherReviews().length === 0) {
            <p class="app-muted">Aún no hay otras reseñas. ¡Sé el primero!</p>
          } @else {
            @for (r of otherReviews(); track r.id) {
              <div class="review">
                <ion-avatar class="ava">
                  @if (r.author?.avatar) { <img [src]="r.author!.avatar" alt="avatar" /> }
                  @else { <div class="ava-letter">{{ (r.author?.name || '?').charAt(0).toUpperCase() }}</div> }
                </ion-avatar>
                <div class="rbody">
                  <div class="rname">
                    <strong>{{ r.author?.name || 'Usuario' }}</strong>
                    @if (r.isCritic) { <span class="critic-tag">🎬 Crítico</span> }
                  </div>
                  <div class="stars-row small">
                    <app-star-rating [value]="r.rating" [size]="13" [color]="r.isCritic ? '#f5c518' : '#21d07a'"></app-star-rating>
                    <span class="rdate">{{ formatDate(r.createdAt) }}</span>
                  </div>
                  @if (r.text) { <p class="rtext">{{ r.text }}</p> }
                </div>
              </div>
            }
          }
        </div>

        <div style="height: 24px"></div>
      }
    </ion-content>
  `,
  styles: [`
    .center { display: flex; justify-content: center; align-items: center; min-height: 60vh; color: var(--ion-color-medium); }
    .hero { text-align: center; padding: 16px 20px; }
    .poster { width: 150px; height: 225px; border-radius: 14px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: inline-flex; align-items: center; justify-content: center; font-size: 56px; }
    .hero h1 { font-size: 24px; font-weight: 800; margin: 14px 0 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; margin-top: 8px; color: var(--ion-color-medium); font-size: 13px; }
    .badge { font-size: 11px; font-weight: 700; border-radius: 6px; padding: 3px 8px; background: var(--ion-color-step-150, #374151); }
    .badge.primary { background: var(--ion-color-primary); color: #fff; }
    .genres { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 10px; }
    .scores { display: flex; gap: 12px; padding: 0 20px; }
    .tmdb { text-align: center; color: var(--ion-color-medium); font-size: 12px; margin: 10px 0 0; }
    .section { padding: 16px 20px 0; }
    .overview { color: var(--ion-text-color); font-size: 14px; line-height: 1.5; opacity: 0.9; }
    .hscroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
    .cast { width: 92px; flex: 0 0 auto; }
    .cast img, .cast-empty { width: 92px; height: 112px; border-radius: 10px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .cast-empty { display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .cname { display: block; font-size: 12px; font-weight: 700; margin-top: 6px; }
    .cchar { display: block; font-size: 11px; color: var(--ion-color-medium); }
    .still { width: 240px; height: 135px; flex: 0 0 auto; border-radius: 12px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .my-review { background: var(--ion-color-step-100, #1f2937); border-radius: 12px; padding: 16px; }
    .stars-row { display: flex; align-items: center; gap: 10px; }
    .stars-row.small { gap: 8px; margin-top: 3px; }
    .myscore { font-weight: 700; }
    .my-actions { display: flex; gap: 8px; margin-top: 12px; }
    .rtext { font-size: 14px; line-height: 1.45; margin: 8px 0 0; opacity: 0.92; }
    .review { display: flex; gap: 10px; background: var(--ion-color-step-100, #1f2937); border-radius: 12px; padding: 14px; margin-bottom: 10px; }
    .ava { width: 40px; height: 40px; }
    .ava-letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ion-color-primary); color: #fff; font-weight: 800; border-radius: 50%; }
    .rbody { flex: 1; min-width: 0; }
    .rname { display: flex; align-items: center; gap: 8px; }
    .critic-tag { font-size: 10px; font-weight: 800; color: #f5c518; background: var(--ion-color-step-150, #374151); border-radius: 6px; padding: 2px 6px; }
    .rdate { font-size: 11px; color: var(--ion-color-medium); }
  `],
})
export class MovieDetailPage {
  private api = inject(ApiService);
  private data = inject(DataService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastController);

  private movieId = this.route.snapshot.paramMap.get('id') || '';

  movie = signal<Movie | undefined>(undefined);
  reviews = signal<Review[]>([]);
  loading = signal(true);

  myReview = computed(() => this.reviews().find((r) => r.userId === this.auth.user()?.id));
  otherReviews = computed(() => this.reviews().filter((r) => r.userId !== this.auth.user()?.id));
  userColor = computed(() => (this.auth.user()?.isCritic ? '#f5c518' : '#21d07a'));

  ionViewWillEnter(): void {
    // prellena desde cache si existe, luego refresca
    const cached = this.data.movies().find((m) => m.id === this.movieId);
    if (cached) this.movie.set(cached);
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [mv, rv] = await Promise.all([
        firstValueFrom(this.api.getMovie(this.movieId)),
        firstValueFrom(this.api.listReviews(this.movieId)),
      ]);
      this.movie.set(mv.movie);
      this.data.upsertMovie(mv.movie);
      this.reviews.set(rv.reviews);
    } catch (e) {
      const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
      await t.present();
    } finally {
      this.loading.set(false);
    }
  }

  writeReview(): void {
    this.router.navigate(['/review', this.movieId]);
  }

  editReview(reviewId: string): void {
    this.router.navigate(['/review', this.movieId], { queryParams: { reviewId } });
  }

  async deleteReview(reviewId: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: '¿Seguro que quieres borrar tu reseña?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive', handler: async () => {
            try {
              await this.data.deleteReview(reviewId);
              await this.load();
            } catch (e) {
              const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
              await t.present();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  formatDate(iso?: string): string {
    if (!iso) return 'Fecha desconocida';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
