import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
  IonAvatar, IonCard, IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { PublicUser, MyReview } from '../../models';
import { httpErrorMessage } from '../../utils/error';
import { StarRatingComponent } from '../../components/star-rating.component';
import { ExpandableTextComponent } from '../../components/expandable-text.component';

// Perfil público de un usuario: sus datos y todas las reseñas que ha hecho.
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
    IonAvatar, IonCard, IonSpinner, StarRatingComponent, ExpandableTextComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/tabs/catalog"></ion-back-button></ion-buttons>
        <ion-title>{{ user()?.name || 'Perfil' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div class="center"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (!user()) {
        <div class="center"><p>Usuario no encontrado</p></div>
      } @else {
        @let u = user()!;

        <div class="head">
          <ion-avatar class="avatar">
            @if (u.avatar) { <img [src]="u.avatar" alt="avatar" /> }
            @else { <div class="letter">{{ u.name.charAt(0).toUpperCase() }}</div> }
          </ion-avatar>
          <h1>{{ u.name }}</h1>
          <span class="role" [class.critic]="u.isCritic">{{ u.isCritic ? '🎬 Crítico' : '👤 Usuario' }}</span>
          <p class="since">Miembro desde {{ formatDate(u.createdAt) }} · {{ u.reviewsCount }} reseña{{ u.reviewsCount === 1 ? '' : 's' }}</p>
        </div>

        <div class="section">
          <h3 class="app-section-title">⭐ Reseñas ({{ reviews().length }})</h3>
          @if (reviews().length === 0) {
            <p class="app-muted">Este usuario aún no ha escrito reseñas.</p>
          } @else {
            @for (r of reviews(); track r.id) {
              <ion-card class="item" (click)="openMovie(r)">
                <div class="row">
                  @if (r.movie?.poster) { <img class="poster" [src]="r.movie!.poster" alt="poster" /> }
                  @else { <div class="poster empty-poster">🎬</div> }
                  <div class="info">
                    <h2>{{ r.movie?.title || 'Título' }}{{ year(r.movie?.releaseDate) }}</h2>
                    <div class="stars-row">
                      <app-star-rating [value]="r.rating" [size]="14" [color]="r.isCritic ? '#f5c518' : '#21d07a'"></app-star-rating>
                      <span class="score">{{ r.rating.toFixed(1) }}</span>
                      <span class="rdate">{{ formatDate(r.createdAt) }}</span>
                    </div>
                    @if (r.text) { <app-expandable-text [text]="r.text" [limit]="180"></app-expandable-text> }
                  </div>
                </div>
              </ion-card>
            }
          }
        </div>

        <div style="height: 24px"></div>
      }
    </ion-content>
  `,
  styles: [`
    .center { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 60vh; color: var(--ion-color-medium); }
    .head { text-align: center; padding: 20px 20px 4px; }
    .avatar { width: 96px; height: 96px; margin: 0 auto; }
    .avatar .letter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--ion-color-primary); color: #fff; font-size: 36px; font-weight: 800; border-radius: 50%; }
    h1 { font-size: 22px; font-weight: 800; margin: 12px 0 0; }
    .role { display: inline-block; font-size: 12px; font-weight: 800; color: var(--ion-color-secondary); background: var(--ion-color-step-100, #1f2937); border-radius: 10px; padding: 5px 12px; margin-top: 10px; }
    .role.critic { color: #f5c518; }
    .since { color: var(--ion-color-medium); font-size: 13px; margin: 10px 0 0; }
    .section { padding: 16px 12px 0; }
    .section .app-section-title { padding: 0 8px; }
    .item { margin: 0 0 10px; border-radius: 14px; cursor: pointer; }
    .row { display: flex; gap: 12px; padding: 12px; }
    .poster { width: 56px; height: 84px; flex: 0 0 auto; border-radius: 8px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .info { flex: 1; min-width: 0; }
    .info h2 { font-size: 15px; font-weight: 700; margin: 0; }
    .stars-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
    .score { font-size: 13px; font-weight: 700; }
    .rdate { font-size: 11px; color: var(--ion-color-medium); }
  `],
})
export class UserProfilePage {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastController);

  user = signal<PublicUser | undefined>(undefined);
  reviews = signal<MyReview[]>([]);
  loading = signal(true);

  ionViewWillEnter(): void {
    this.load();
  }

  async load(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get('id') || '';
    this.loading.set(true);
    try {
      const [u, r] = await Promise.all([
        firstValueFrom(this.api.getUser(userId)),
        firstValueFrom(this.api.listUserReviews(userId)),
      ]);
      this.user.set(u.user);
      this.reviews.set(r.reviews);
    } catch (e) {
      const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
      await t.present();
    } finally {
      this.loading.set(false);
    }
  }

  openMovie(r: MyReview): void {
    if (r.movie) this.router.navigate(['/movies', r.movie.id]);
  }

  year(date?: string): string {
    return date ? ` (${date.slice(0, 4)})` : '';
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
