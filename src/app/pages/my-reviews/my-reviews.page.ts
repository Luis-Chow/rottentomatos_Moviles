import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonChip,
  IonCard, IonButton, IonIcon, IonRefresher, IonRefresherContent,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { MyReview } from '../../models';
import { httpErrorMessage } from '../../utils/error';
import { StarRatingComponent } from '../../components/star-rating.component';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonChip,
    IonCard, IonButton, IonIcon, IonRefresher, IonRefresherContent, StarRatingComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>⭐ Mis Reseñas</ion-title>
        @if (auth.user()?.isCritic) {
          <ion-buttons slot="end"><ion-chip color="warning">🎬 Crítico</ion-chip></ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (data.myReviews().length === 0) {
        <div class="empty">
          <div class="emoji">📭</div>
          <p>Aún no has escrito reseñas</p>
          <ion-button (click)="goCatalog()">🎬 Ir al catálogo</ion-button>
        </div>
      } @else {
        <div class="list">
          @for (r of data.myReviews(); track r.id) {
            <ion-card class="item">
              <div class="row">
                <div class="left" (click)="openMovie(r)">
                  @if (r.movie?.poster) { <img class="poster" [src]="r.movie!.poster" alt="poster" /> }
                  @else { <div class="poster empty-poster">🎬</div> }
                  <div class="info">
                    <h2>{{ r.movie?.title || 'Título' }}{{ year(r.movie?.releaseDate) }}</h2>
                    <div class="stars-row">
                      <app-star-rating [value]="r.rating" [size]="14" [color]="r.isCritic ? '#f5c518' : '#21d07a'"></app-star-rating>
                      <span class="score">{{ r.rating.toFixed(1) }}</span>
                      @if (r.isCritic) { <span class="ct">🎬</span> }
                    </div>
                    @if (r.text) { <p class="txt">{{ r.text }}</p> }
                  </div>
                </div>
                <div class="actions">
                  <ion-button fill="clear" size="small" (click)="edit(r)"><ion-icon slot="icon-only" name="create-outline"></ion-icon></ion-button>
                  <ion-button fill="clear" size="small" color="danger" (click)="remove(r)"><ion-icon slot="icon-only" name="trash-outline"></ion-icon></ion-button>
                </div>
              </div>
            </ion-card>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .empty { text-align: center; padding: 60px 24px; color: var(--ion-color-medium); }
    .empty .emoji { font-size: 48px; margin-bottom: 12px; }
    .list { padding: 8px 12px 24px; display: flex; flex-direction: column; gap: 10px; }
    .item { margin: 0; border-radius: 14px; }
    .row { display: flex; align-items: center; padding: 12px; }
    .left { display: flex; gap: 12px; flex: 1; min-width: 0; cursor: pointer; }
    .poster { width: 56px; height: 84px; border-radius: 8px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .info { flex: 1; min-width: 0; }
    .info h2 { font-size: 15px; font-weight: 700; margin: 0; }
    .stars-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
    .score { font-size: 13px; font-weight: 700; }
    .ct { font-size: 12px; }
    .txt { font-size: 13px; color: var(--ion-color-medium); margin: 6px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .actions { display: flex; flex-direction: column; }
  `],
})
export class MyReviewsPage {
  data = inject(DataService);
  auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toast = inject(ToastController);

  ionViewWillEnter(): void {
    this.data.refresh();
  }

  year(date?: string): string {
    return date ? ` (${date.slice(0, 4)})` : '';
  }

  openMovie(r: MyReview): void {
    if (r.movie) this.router.navigate(['/movies', r.movie.id]);
  }

  edit(r: MyReview): void {
    if (r.movie) this.router.navigate(['/review', r.movie.id], { queryParams: { reviewId: r.id } });
  }

  async remove(r: MyReview): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reseña',
      message: `¿Borrar tu reseña de "${r.movie?.title || 'este título'}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive', handler: async () => {
            try {
              await this.data.deleteReview(r.id);
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

  goCatalog(): void {
    this.router.navigateByUrl('/tabs/catalog');
  }

  async doRefresh(ev: CustomEvent): Promise<void> {
    await this.data.refresh();
    (ev.target as HTMLIonRefresherElement).complete();
  }
}
