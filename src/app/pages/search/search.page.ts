import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonSegment, IonSegmentButton, IonLabel, IonCard, IonSpinner, IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { DataService } from '../../services/data.service';
import { TmdbResult, TypeFilter } from '../../models';
import { httpErrorMessage } from '../../utils/error';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonSegment, IonSegmentButton, IonLabel, IonCard, IonSpinner, IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar><ion-title>🔎 Buscar títulos</ion-title></ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          placeholder="Película o serie..."
          [debounce]="500"
          (ionInput)="onInput($any($event.target).value)"
        ></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="type()" (ionChange)="changeType($any($event.detail.value))">
          <ion-segment-button value="all"><ion-label>Todas</ion-label></ion-segment-button>
          <ion-segment-button value="movie"><ion-label>Películas</ion-label></ion-segment-button>
          <ion-segment-button value="tv"><ion-label>Series</ion-label></ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div class="center"><ion-spinner name="crescent"></ion-spinner></div>
      } @else if (results().length === 0) {
        <div class="center">
          <div class="emoji">{{ searched() ? '🍿' : '🎟️' }}</div>
          <p>{{ searched() ? 'Sin resultados' : 'Busca títulos reales y añádelos a tu catálogo' }}</p>
        </div>
      } @else {
        <div class="list">
          @for (item of results(); track item.mediaType + '-' + item.tmdbId) {
            <ion-card button class="res" (click)="open(item)">
              <div class="row">
                @if (item.poster) { <img class="poster" [src]="item.poster" alt="poster" /> }
                @else { <div class="poster empty-poster">🎬</div> }
                <div class="info">
                  <h2>{{ item.title }}</h2>
                  <div class="meta">
                    <span class="badge">{{ item.mediaType === 'tv' ? 'Serie' : 'Película' }}</span>
                    @if (item.releaseDate) { <span>{{ item.releaseDate.slice(0, 4) }}</span> }
                    @if (item.tmdbScore) { <span>★ {{ item.tmdbScore.toFixed(1) }}</span> }
                  </div>
                  @if (item.overview) { <p class="ov">{{ item.overview }}</p> }
                  @if (item.inLibrary) {
                    <p class="lib"><ion-icon name="checkmark-circle"></ion-icon> En tu catálogo</p>
                  } @else {
                    <p class="imp">{{ importingId() === item.tmdbId ? 'Importando…' : '+ Tocar para añadir' }}</p>
                  }
                </div>
                @if (importingId() === item.tmdbId) { <ion-spinner name="crescent"></ion-spinner> }
              </div>
            </ion-card>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [`
    .center { text-align: center; padding: 60px 24px; color: var(--ion-color-medium); }
    .center .emoji { font-size: 48px; margin-bottom: 12px; }
    .list { padding: 8px 12px 24px; display: flex; flex-direction: column; gap: 10px; }
    .res { margin: 0; border-radius: 14px; }
    .row { display: flex; gap: 12px; padding: 12px; align-items: center; }
    .poster { width: 56px; height: 84px; border-radius: 8px; object-fit: cover; background: var(--ion-color-step-150, #374151); }
    .empty-poster { display: flex; align-items: center; justify-content: center; font-size: 26px; }
    .info { flex: 1; min-width: 0; }
    .info h2 { font-size: 15px; font-weight: 700; margin: 0; }
    .meta { display: flex; gap: 8px; align-items: center; margin-top: 4px; color: var(--ion-color-medium); font-size: 12px; }
    .badge { font-size: 10px; font-weight: 700; background: var(--ion-color-step-150, #374151); border-radius: 6px; padding: 2px 6px; }
    .ov { font-size: 12px; color: var(--ion-color-medium); margin: 4px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .lib { font-size: 12px; font-weight: 700; color: var(--ion-color-secondary); margin: 6px 0 0; display: flex; align-items: center; gap: 4px; }
    .imp { font-size: 12px; font-weight: 700; color: var(--ion-color-primary); margin: 6px 0 0; }
  `],
})
export class SearchPage {
  private api = inject(ApiService);
  private data = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastController);

  query = '';
  type = signal<TypeFilter>('all');
  results = signal<TmdbResult[]>([]);
  loading = signal(false);
  searched = signal(false);
  importingId = signal<number | null>(null);

  onInput(value: string | null | undefined): void {
    this.query = (value || '').trim();
    if (this.query.length < 2) {
      this.results.set([]);
      this.searched.set(false);
      return;
    }
    this.doSearch();
  }

  changeType(value: TypeFilter): void {
    this.type.set(value);
    if (this.query.length >= 2) this.doSearch();
  }

  async doSearch(): Promise<void> {
    this.loading.set(true);
    this.searched.set(true);
    try {
      const t = this.type();
      const apiType = t === 'all' ? undefined : t; // tipo: 'movie' | 'tv' | undefined
      const { results } = await firstValueFrom(this.api.searchTmdb(this.query, apiType));
      this.results.set(results);
    } catch (e) {
      const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
      await t.present();
    } finally {
      this.loading.set(false);
    }
  }

  async open(item: TmdbResult): Promise<void> {
    if (item.inLibrary && item.localId) {
      this.router.navigate(['/movies', item.localId]);
      return;
    }
    this.importingId.set(item.tmdbId);
    try {
      const movie = await this.data.importMovie(item.tmdbId, item.mediaType);
      this.router.navigate(['/movies', movie.id]);
    } catch (e) {
      const t = await this.toast.create({ message: httpErrorMessage(e), duration: 2500, color: 'danger', position: 'top' });
      await t.present();
    } finally {
      this.importingId.set(null);
    }
  }
}
